-- Trusted server subjects only. No user can join an existing organization here.
GRANT INSERT ON "User", "Organization", "Membership" TO leadrescue_identity;
CREATE POLICY "Membership_identity_insert" ON "Membership" FOR INSERT TO leadrescue_identity WITH CHECK (true);

CREATE FUNCTION public.leadrescue_workspaces(p_subject text)
RETURNS TABLE ("organizationId" uuid, name text, role text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $fn$
  SELECT o.id, o.name::text, m.role::text FROM public."Membership" m
  JOIN public."User" u ON u.id=m."userId"
  JOIN public."Organization" o ON o.id=m."organizationId"
  WHERE u."authSubject"=p_subject AND m.active AND o.active
  ORDER BY o.name,o.id;
$fn$;

CREATE FUNCTION public.leadrescue_create_workspace(p_subject text,p_email text,p_display text,p_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $fn$
DECLARE u_id uuid; o_id uuid;
BEGIN
  IF p_subject IS NULL OR length(p_subject) NOT BETWEEN 1 AND 512
    OR p_email IS NULL OR length(p_email) NOT BETWEEN 3 AND 254
    OR p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 2 AND 160 THEN
    RAISE EXCEPTION 'Invalid workspace request' USING ERRCODE='22023';
  END IF;
  -- Serialize retries, including the very first request for this subject.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_subject,42));
  SELECT id INTO u_id FROM public."User" WHERE "authSubject"=p_subject;
  IF u_id IS NOT NULL THEN
    -- Never let an inactive/revoked member recreate or regain an organization.
    SELECT m."organizationId" INTO o_id FROM public."Membership" m
      JOIN public."Organization" o ON o.id=m."organizationId"
      WHERE m."userId"=u_id AND m.active AND o.active ORDER BY m."createdAt" LIMIT 1;
    IF o_id IS NOT NULL THEN RETURN o_id; END IF;
    IF EXISTS(SELECT FROM public."Membership" WHERE "userId"=u_id) THEN
      RAISE EXCEPTION 'Access denied' USING ERRCODE='42501';
    END IF;
  ELSE
    u_id:=gen_random_uuid();
    INSERT INTO public."User"(id,"authSubject",name,email)
      VALUES(u_id,p_subject,left(coalesce(nullif(p_display,''),p_email),160),p_email);
  END IF;
  o_id:=gen_random_uuid();
  INSERT INTO public."Organization"(id,name,"updatedAt") VALUES(o_id,trim(p_name),now());
  INSERT INTO public."Membership"(id,"organizationId","userId",role)
    VALUES(gen_random_uuid(),o_id,u_id,'ORGANIZATION_ADMIN');
  RETURN o_id;
END $fn$;
GRANT CREATE ON SCHEMA public TO leadrescue_identity;
ALTER FUNCTION public.leadrescue_workspaces(text) OWNER TO leadrescue_identity;
ALTER FUNCTION public.leadrescue_create_workspace(text,text,text,text) OWNER TO leadrescue_identity;
REVOKE CREATE ON SCHEMA public FROM leadrescue_identity;
REVOKE ALL ON FUNCTION public.leadrescue_workspaces(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leadrescue_create_workspace(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leadrescue_workspaces(text) TO leadrescue_app;
GRANT EXECUTE ON FUNCTION public.leadrescue_create_workspace(text,text,text,text) TO leadrescue_app;
