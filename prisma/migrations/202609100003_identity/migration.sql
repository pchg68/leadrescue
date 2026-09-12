-- Narrow identity lookup: no generic access to global users/organizations.
CREATE FUNCTION public.leadrescue_assert_runtime() RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog AS $fn$
BEGIN
  IF current_user <> 'leadrescue_app' OR EXISTS (
    SELECT FROM pg_roles WHERE rolname=current_user AND (rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole)
  ) OR EXISTS (
    SELECT FROM pg_class c JOIN pg_roles r ON r.oid=c.relowner
    WHERE r.rolname=current_user AND c.relnamespace='public'::regnamespace
  ) THEN RAISE EXCEPTION 'Unsafe runtime role' USING ERRCODE='42501'; END IF;
END $fn$;
REVOKE ALL ON FUNCTION public.leadrescue_assert_runtime() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leadrescue_assert_runtime() TO leadrescue_app;
GRANT USAGE ON SCHEMA public TO leadrescue_app, leadrescue_identity;
GRANT SELECT ON "User", "Organization", "Membership", "Broker" TO leadrescue_identity;
CREATE POLICY "Membership_identity_read" ON "Membership" FOR SELECT TO leadrescue_identity USING (true);
CREATE POLICY "Broker_identity_read" ON "Broker" FOR SELECT TO leadrescue_identity USING (true);

CREATE FUNCTION public.leadrescue_authorize(p_subject text, p_organization uuid)
RETURNS TABLE ("membershipId" uuid, "role" text, "brokerId" uuid, "organizationName" text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $fn$
DECLARE m_id uuid; m_role text; b_id uuid; org_name text;
BEGIN
  IF p_subject IS NULL OR p_subject='' OR length(p_subject)>512 OR p_organization IS NULL THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE='42501';
  END IF;
  SELECT m.id, m.role::text, b.id, o.name INTO m_id, m_role, b_id, org_name
  FROM public."Membership" m
  JOIN public."User" u ON u.id=m."userId"
  JOIN public."Organization" o ON o.id=m."organizationId"
  LEFT JOIN public."Broker" b ON b."organizationId"=m."organizationId" AND b."membershipId"=m.id AND b.active
  WHERE u."authSubject"=p_subject AND m."organizationId"=p_organization AND m.active AND o.active;
  IF m_id IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  -- Broker with no active associated broker gets no commercial data.
  PERFORM set_config('app.organization_id', p_organization::text, true);
  PERFORM set_config('app.membership_id', m_id::text, true);
  PERFORM set_config('app.role', m_role, true);
  PERFORM set_config('app.broker_id', coalesce(b_id::text,''), true);
  RETURN QUERY SELECT m_id, m_role, b_id, org_name;
END $fn$;
-- The migration operator must have authority to assign this NOLOGIN role.
GRANT CREATE ON SCHEMA public TO leadrescue_identity;
ALTER FUNCTION public.leadrescue_authorize(text,uuid) OWNER TO leadrescue_identity;
REVOKE CREATE ON SCHEMA public FROM leadrescue_identity;
REVOKE ALL ON FUNCTION public.leadrescue_authorize(text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leadrescue_authorize(text,uuid) TO leadrescue_app;
-- Membership provisioning is not part of ordinary web requests.
REVOKE INSERT, UPDATE, DELETE ON "Membership", "Broker" FROM leadrescue_app;

-- Additional restrictive guard on lead reads: tenant RLS is still required.
CREATE POLICY "Lead_member_read" ON "Lead" AS RESTRICTIVE FOR SELECT TO leadrescue_app
USING (
  nullif(current_setting('app.membership_id',true),'') IS NOT NULL
  AND (current_setting('app.role',true) IN ('ORGANIZATION_ADMIN','MANAGER')
    OR (current_setting('app.role',true)='BROKER'
      AND "brokerId"=nullif(current_setting('app.broker_id',true),'')::uuid))
);
