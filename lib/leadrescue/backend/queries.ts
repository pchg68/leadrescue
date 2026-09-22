// Fixed, parameterized statements reused by the HTTP adapter and DB tests.
export const AUTHORIZE_SQL='SELECT * FROM public.leadrescue_authorize($1::text,$2::uuid)';
// The runtime must log in directly with leadrescue_app, not a schema owner.
export const ROLE_SQL=`SELECT current_user AS role, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb
  FROM pg_roles WHERE rolname=current_user`;
export const LIST_LEADS_SQL=`SELECT l.id,l.name,l.source,l."brokerId",l."currentState",l."doNotContact",l."humanRequired",
  CASE WHEN l."dataQuality"->>'analysisPending'='true' THEN NULL ELSE l."leadScore" END AS "leadScore", CASE WHEN l."dataQuality"->>'analysisPending'='true' THEN NULL ELSE l."rescueRisk" END AS "rescueRisk", CASE WHEN l."dataQuality"->>'analysisPending'='true' THEN NULL ELSE l."progressionScore" END AS "progressionScore", CASE WHEN l."dataQuality"->>'analysisPending'='true' THEN NULL ELSE l."rescuePriority" END AS "rescuePriority",l.coverage,l.version,l."projectionVersion"
  FROM public."Lead" l WHERE l."organizationId"=$1::uuid AND l."deletedAt" IS NULL
  AND (current_setting('app.role',true) IN ('ORGANIZATION_ADMIN','MANAGER')
    OR (current_setting('app.role',true)='BROKER' AND l."brokerId"=nullif(current_setting('app.broker_id',true),'')::uuid))
  AND ($2::uuid IS NULL OR l.id>$2::uuid) ORDER BY l.id LIMIT $3::int`;
export const GET_LEAD_SQL=`SELECT l.id,l.name,l.source,l."brokerId",l."currentState",l."doNotContact",l."humanRequired", l.email,l.phone,l."dataQuality",l."provisionalContactBlock",l."contactNotBefore",l."operationType",l.city,l.neighborhood,l."propertyType",l."minPrice",l."maxPrice",l."purchaseTimelineDays",l."financingStatus",l.motivation,
  CASE WHEN l."dataQuality"->>'analysisPending'='true' THEN NULL ELSE l."leadScore" END AS "leadScore", CASE WHEN l."dataQuality"->>'analysisPending'='true' THEN NULL ELSE l."rescueRisk" END AS "rescueRisk", CASE WHEN l."dataQuality"->>'analysisPending'='true' THEN NULL ELSE l."progressionScore" END AS "progressionScore", CASE WHEN l."dataQuality"->>'analysisPending'='true' THEN NULL ELSE l."rescuePriority" END AS "rescuePriority",l.coverage,l.version,l."projectionVersion"
  FROM public."Lead" l WHERE l."organizationId"=$1::uuid AND l.id=$2::uuid AND l."deletedAt" IS NULL
  AND (current_setting('app.role',true) IN ('ORGANIZATION_ADMIN','MANAGER')
    OR (current_setting('app.role',true)='BROKER' AND l."brokerId"=nullif(current_setting('app.broker_id',true),'')::uuid))`;
