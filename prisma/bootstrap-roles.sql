-- Run with a database administrator, once, before prisma migrate deploy.
-- Roles have NOLOGIN: passwords must never appear in migrations or Git.
DO $roles$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='leadrescue_app') THEN
    CREATE ROLE leadrescue_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='leadrescue_identity') THEN
    CREATE ROLE leadrescue_identity NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
END $roles$;
-- Refuse to proceed if a pre-existing app role has dangerous privileges.
DO $check$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname IN ('leadrescue_app','leadrescue_identity')
    AND (rolsuper OR rolbypassrls OR rolcreaterole OR rolcreatedb)) THEN
    RAISE EXCEPTION 'LeadRescue roles must not have administrative privileges';
  END IF;
END $check$;
-- PostgreSQL 16+ requires explicit SET membership for function ownership.
-- Only the migration operator receives it; never grant identity to the app.
DO $operator$
BEGIN
  EXECUTE format('GRANT leadrescue_identity TO %I WITH INHERIT FALSE, SET TRUE', current_user);
  EXECUTE format('GRANT leadrescue_app TO %I WITH INHERIT FALSE, SET TRUE', current_user);
END $operator$;
