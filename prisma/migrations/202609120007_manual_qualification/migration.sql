CREATE FUNCTION public.leadrescue_save_manual(p_id uuid,p_version integer,p_mutation uuid,p_data jsonb,p_request text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $fn$
DECLARE org uuid:=nullif(current_setting('app.organization_id',true),'')::uuid;
 member uuid:=nullif(current_setting('app.membership_id',true),'')::uuid;
 broker uuid:=nullif(current_setting('app.broker_id',true),'')::uuid;
 role_name text:=current_setting('app.role',true);
 lead_id uuid; lead_version integer; previous public."Lead"%ROWTYPE;
 prior public."AuditLog"%ROWTYPE; input_hash text; profile jsonb; event_payload jsonb;
BEGIN
 PERFORM public.leadrescue_assert_runtime();
 IF org IS NULL OR member IS NULL OR coalesce(role_name,'') NOT IN ('ORGANIZATION_ADMIN','MANAGER','BROKER') OR (role_name='BROKER' AND broker IS NULL) THEN
   RAISE EXCEPTION 'Access denied' USING ERRCODE='42501';
 END IF;
 IF p_mutation IS NULL OR jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR length(p_data->>'reason') NOT BETWEEN 8 AND 1000 THEN
   RAISE EXCEPTION 'Invalid input' USING ERRCODE='22023';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(org::text,0));
 input_hash:=md5(coalesce(p_id::text,'create')||coalesce(p_version::text,'')||p_data::text);
 SELECT * INTO prior FROM public."AuditLog" WHERE "organizationId"=org AND "actorId"=member::text AND action='lead.manual.saved' AND "requestId"=p_mutation::text;
 IF prior.id IS NOT NULL THEN
   IF prior."redactedDiff"->>'inputHash'<>input_hash THEN RETURN '{"error":"IDEMPOTENCY_CONFLICT"}'::jsonb; END IF;
   IF NOT EXISTS(SELECT 1 FROM public."Lead" WHERE "organizationId"=org AND id=prior."objectId"::uuid AND "deletedAt" IS NULL AND (role_name<>'BROKER' OR "brokerId"=broker)) THEN
     RAISE EXCEPTION 'Access denied' USING ERRCODE='42501';
   END IF;
   RETURN jsonb_build_object('id',prior."objectId",'version',prior."redactedDiff"->'version','replayed',true);
 END IF;
 IF p_id IS NULL THEN
   IF EXISTS(SELECT 1 FROM public."Lead" l WHERE l."organizationId"=org AND (
      (nullif(p_data->>'email','') IS NOT NULL AND lower(l.email)=lower(nullif(p_data->>'email',''))) OR
      EXISTS(SELECT 1 FROM jsonb_array_elements(p_data->'phones') p WHERE l.phone=p->>'number' OR
        EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(l."dataQuality"->'phones','[]')) old WHERE old->>'number'=p->>'number')))) THEN
     RETURN '{"error":"DUPLICATE"}'::jsonb;
   END IF;
   lead_id:=gen_random_uuid();lead_version:=1;
   INSERT INTO public."Lead" ("organizationId",id,name,email,phone,source,"brokerId","operationType",city,neighborhood,"propertyType","minPrice","maxPrice","purchaseTimelineDays","financingStatus",motivation,"dataQuality","humanRequired","provisionalContactBlock","suppressionReason","queueEligible","originalCreatedAt",version,"updatedAt")
   VALUES(org,lead_id,p_data->>'name',p_data->>'email',p_data->'phones'->0->>'number','manual',CASE WHEN role_name='BROKER' THEN broker ELSE NULL END,
     (p_data->>'operationType')::public."OperationType",nullif(p_data->>'city',''),nullif(p_data->>'neighborhood',''),nullif(p_data->>'propertyType',''),
     (p_data->>'minPrice')::numeric,(p_data->>'maxPrice')::numeric,(p_data->>'purchaseTimelineDays')::integer,(p_data->>'financingStatus')::public."FinancingStatus",
     nullif(p_data->>'motivation',''),
     jsonb_build_object('phones',p_data->'phones','analysisPending',true,'qualificationUpdatedAt',now(),'qualificationEvidence',jsonb_build_object('reason',p_data->>'reason','membershipId',member)),
     true,true,'Cadastro manual: revisar contexto e permissão de contato',false,NULL,lead_version,now());
 ELSE
   SELECT * INTO previous FROM public."Lead" WHERE "organizationId"=org AND id=p_id AND "deletedAt" IS NULL AND (role_name<>'BROKER' OR "brokerId"=broker) FOR UPDATE;
   IF previous.id IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
   IF p_version IS DISTINCT FROM previous.version THEN RETURN '{"error":"CONFLICT"}'::jsonb; END IF;
   lead_id:=p_id;lead_version:=previous.version+1;
   UPDATE public."Lead" SET
    "operationType"=(p_data->>'operationType')::public."OperationType",
    city=nullif(p_data->>'city',''),neighborhood=nullif(p_data->>'neighborhood',''),"propertyType"=nullif(p_data->>'propertyType',''),
    "minPrice"=(p_data->>'minPrice')::numeric,"maxPrice"=(p_data->>'maxPrice')::numeric,
    "purchaseTimelineDays"=(p_data->>'purchaseTimelineDays')::integer,"financingStatus"=(p_data->>'financingStatus')::public."FinancingStatus",
    motivation=nullif(p_data->>'motivation',''),version=lead_version,"updatedAt"=now(),"queueEligible"=false,
    "dataQuality"="dataQuality"||jsonb_build_object('analysisPending',true,'qualificationUpdatedAt',now(),'qualificationEvidence',jsonb_build_object('reason',p_data->>'reason','membershipId',member))
   WHERE "organizationId"=org AND id=lead_id;
 END IF;
 profile:=p_data-'name'-'email'-'phones'-'operationType'-'reason';
 IF p_id IS NULL THEN
   -- TODO(LGPD): lead.created abaixo replica e-mail/telefone em histórico append-only; avaliar estratégia de minimização/expurgo.
   event_payload:=jsonb_build_object('name',p_data->'name','email',p_data->'email','phone',p_data->'phones'->0->>'number','phones',p_data->'phones','operationType',p_data->'operationType','profile',profile,'originalCreatedAt',NULL);
 ELSE
   event_payload:=jsonb_build_object('changes',jsonb_build_object('operationType',p_data->'operationType','profile',profile),'reason',p_data->>'reason');
 END IF;
 INSERT INTO public."LeadEvent" ("organizationId",id,"leadId",type,source,"sourceEventId","actorType","actorId","occurredAt",payload)
 VALUES(org,gen_random_uuid(),lead_id,CASE WHEN p_id IS NULL THEN 'lead.created' ELSE 'lead.updated' END,'manual',member::text||':'||p_mutation::text,'USER',member::text,now(),event_payload);
 INSERT INTO public."AuditLog" ("organizationId",id,"actorId",action,"objectType","objectId","requestId","redactedDiff")
 VALUES(org,gen_random_uuid(),member::text,'lead.manual.saved','Lead',lead_id::text,p_mutation::text,jsonb_build_object('inputHash',input_hash,'version',lead_version,'requestId',p_request));
 RETURN jsonb_build_object('id',lead_id,'version',lead_version,'replayed',false);
END $fn$;
REVOKE ALL ON FUNCTION public.leadrescue_save_manual(uuid,integer,uuid,jsonb,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leadrescue_save_manual(uuid,integer,uuid,jsonb,text) TO leadrescue_app;
