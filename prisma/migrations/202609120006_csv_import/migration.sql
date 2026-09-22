-- Bounded, atomic import. Existing leads are never modified or merged.
CREATE FUNCTION public.leadrescue_import(p_key text,p_rows jsonb,p_mapping jsonb,p_request text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $fn$
DECLARE org uuid:=nullif(current_setting('app.organization_id',true),'')::uuid;
 member uuid:=nullif(current_setting('app.membership_id',true),'')::uuid;
 batch uuid; lead uuid; item jsonb; outcome text; saved integer:=0; invalid integer:=0; duplicates integer:=0; counts jsonb;
BEGIN
 PERFORM public.leadrescue_assert_runtime();
 IF org IS NULL OR member IS NULL OR coalesce(current_setting('app.role',true),'') NOT IN ('ORGANIZATION_ADMIN','MANAGER') THEN
   RAISE EXCEPTION 'Import requires manager' USING ERRCODE='42501';
 END IF;
 IF p_key IS NULL OR p_key !~ '^[a-f0-9]{64}$' OR jsonb_typeof(p_rows) IS DISTINCT FROM 'array' OR jsonb_array_length(p_rows) NOT BETWEEN 1 AND 500 THEN
   RAISE EXCEPTION 'Invalid import' USING ERRCODE='22023';
 END IF;
 -- Serialize imports per tenant, including different files sharing contacts.
 PERFORM pg_advisory_xact_lock(hashtextextended(org::text,0));
 SELECT id,counters INTO batch,counts FROM public."ImportBatch" WHERE "organizationId"=org AND "dedupeKey"=p_key;
 IF batch IS NOT NULL THEN RETURN counts||jsonb_build_object('batchId',batch,'replayed',true); END IF;
 batch:=gen_random_uuid();
 INSERT INTO public."ImportBatch" ("organizationId",id,"createdBy",source,"objectKey","fileHash","dedupeKey",status,mapping,counters,"confirmedAt","expiresAt")
 VALUES(org,batch,member,'csv','inline:no-original-file',p_key,p_key,'IMPORTING',p_mapping,'{}',now(),now()+interval '90 days');
 FOR item IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
   lead:=NULL;outcome:='IMPORTED';
   IF jsonb_array_length(item->'errors')>0 THEN outcome:='INVALID';invalid:=invalid+1;
   ELSIF (item->>'duplicate')::boolean OR EXISTS (
     SELECT 1 FROM public."Lead" l WHERE l."organizationId"=org AND (
       (nullif(item->>'externalId','') IS NOT NULL AND l.source=item->>'source' AND l."externalId"=nullif(item->>'externalId','')) OR
       (nullif(item->>'email','') IS NOT NULL AND lower(l.email)=lower(nullif(item->>'email',''))) OR
       EXISTS(SELECT 1 FROM jsonb_array_elements(item->'phones') p WHERE l.phone=p->>'number' OR
         EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(l."dataQuality"->'phones','[]')) old WHERE old->>'number'=p->>'number'))))
     THEN outcome:='SKIPPED';duplicates:=duplicates+1;
   ELSE
     lead:=gen_random_uuid();
     INSERT INTO public."Lead" ("organizationId",id,name,email,phone,source,"externalId","originalCreatedAt","dataQuality","humanRequired","provisionalContactBlock","suppressionReason","updatedAt")
     VALUES(org,lead,item->>'name',item->>'email',item->'phones'->0->>'number',item->>'source',item->>'externalId',(item->>'originalCreatedAt')::timestamptz,
       jsonb_build_object('phones',item->'phones','importBatchId',batch,'analysisPending',true,'originalDateMissing',(item->'originalCreatedAt' IS NULL OR jsonb_typeof(item->'originalCreatedAt')='null')),true,true,'Importado: revisar contexto e permissão de contato',now());
     INSERT INTO public."LeadEvent" ("organizationId",id,"leadId",type,source,"sourceEventId","actorType","actorId","occurredAt",payload)
     VALUES(org,gen_random_uuid(),lead,'lead.imported','csv',batch::text||':'||(item->>'row'),'IMPORT',member::text,now(),jsonb_build_object('batchId',batch,'rowNumber',item->'row'));
     saved:=saved+1;
   END IF;
   INSERT INTO public."ImportRow" ("organizationId",id,"batchId","rowNumber",status,normalized,errors,"leadId")
   VALUES(org,gen_random_uuid(),batch,(item->>'row')::integer,outcome::public."RowStatus",CASE WHEN outcome='SKIPPED' THEN NULL ELSE item-'errors' END,
     CASE WHEN outcome='SKIPPED' THEN '["Possível duplicidade; registro existente preservado"]'::jsonb ELSE item->'errors' END,lead);
 END LOOP;
 counts:=jsonb_build_object('imported',saved,'invalid',invalid,'duplicates',duplicates,'total',jsonb_array_length(p_rows));
 UPDATE public."ImportBatch" SET status=CASE WHEN invalid+duplicates>0 THEN 'PARTIAL'::public."ImportStatus" ELSE 'COMPLETED'::public."ImportStatus" END,counters=counts WHERE "organizationId"=org AND id=batch;
 -- TODO(LGPD): expiresAt define retenção do lote, mas ainda falta o processo automático de expurgo.
 INSERT INTO public."AuditLog" ("organizationId",id,"actorId",action,"objectType","objectId","requestId","redactedDiff")
 VALUES(org,gen_random_uuid(),member::text,'csv.import.confirmed','ImportBatch',batch::text,p_request,counts);
 RETURN counts||jsonb_build_object('batchId',batch,'replayed',false);
END $fn$;
REVOKE ALL ON FUNCTION public.leadrescue_import(text,jsonb,jsonb,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leadrescue_import(text,jsonb,jsonb,text) TO leadrescue_app;
