-- Run AFTER the Prisma-generated initial migration, as migration owner.
-- Scalar IDs in Prisma intentionally use SQL foreign keys. Preserve this file
-- in migration history; do not use db push to replace reviewed migrations.
-- Runtime role leadrescue_app must already exist (non-owner, no BYPASSRLS).
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "LeadEvent" ADD CONSTRAINT "LeadEvent_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "StateHistory" ADD CONSTRAINT "StateHistory_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "ExceptionCase" ADD CONSTRAINT "ExceptionCase_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "OutboxJob" ADD CONSTRAINT "OutboxJob_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_organization_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_user_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT;
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_membershipId_fk" FOREIGN KEY ("organizationId","membershipId") REFERENCES "Membership"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_createdBy_fk" FOREIGN KEY ("organizationId","createdBy") REFERENCES "Membership"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_brokerId_fk" FOREIGN KEY ("organizationId","brokerId") REFERENCES "Broker"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_canonicalLeadId_fk" FOREIGN KEY ("organizationId","canonicalLeadId") REFERENCES "Lead"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "LeadEvent" ADD CONSTRAINT "LeadEvent_leadId_fk" FOREIGN KEY ("organizationId","leadId") REFERENCES "Lead"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_leadId_fk" FOREIGN KEY ("organizationId","leadId") REFERENCES "Lead"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "StateHistory" ADD CONSTRAINT "StateHistory_leadId_fk" FOREIGN KEY ("organizationId","leadId") REFERENCES "Lead"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "StateHistory" ADD CONSTRAINT "StateHistory_eventId_fk" FOREIGN KEY ("organizationId","eventId") REFERENCES "LeadEvent"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "StateHistory" ADD CONSTRAINT "StateHistory_analysisRunId_fk" FOREIGN KEY ("organizationId","analysisRunId") REFERENCES "AnalysisRun"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_leadId_fk" FOREIGN KEY ("organizationId","leadId") REFERENCES "Lead"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_analysisRunId_fk" FOREIGN KEY ("organizationId","analysisRunId") REFERENCES "AnalysisRun"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_leadId_fk" FOREIGN KEY ("organizationId","leadId") REFERENCES "Lead"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_analysisRunId_fk" FOREIGN KEY ("organizationId","analysisRunId") REFERENCES "AnalysisRun"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_decisionBy_fk" FOREIGN KEY ("organizationId","decisionBy") REFERENCES "Membership"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "ExceptionCase" ADD CONSTRAINT "ExceptionCase_leadId_fk" FOREIGN KEY ("organizationId","leadId") REFERENCES "Lead"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "ExceptionCase" ADD CONSTRAINT "ExceptionCase_assignedTo_fk" FOREIGN KEY ("organizationId","assignedTo") REFERENCES "Membership"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_createdBy_fk" FOREIGN KEY ("organizationId","createdBy") REFERENCES "Membership"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_batchId_fk" FOREIGN KEY ("organizationId","batchId") REFERENCES "ImportBatch"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_leadId_fk" FOREIGN KEY ("organizationId","leadId") REFERENCES "Lead"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_leadId_fk" FOREIGN KEY ("organizationId","leadId") REFERENCES "Lead"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_recommendationId_fk" FOREIGN KEY ("organizationId","recommendationId") REFERENCES "Recommendation"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_evidenceEventId_fk" FOREIGN KEY ("organizationId","evidenceEventId") REFERENCES "LeadEvent"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_recordedBy_fk" FOREIGN KEY ("organizationId","recordedBy") REFERENCES "Membership"("organizationId","id") ON DELETE RESTRICT;
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_policy_fk" FOREIGN KEY ("organizationId","policyVersion") REFERENCES "PolicyVersion"("organizationId","version");
ALTER TABLE "LeadEvent" ADD CONSTRAINT "LeadEvent_lead_identity" UNIQUE ("organizationId","leadId","id");
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_lead_identity" UNIQUE ("organizationId","leadId","id");
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_event_same_lead" FOREIGN KEY ("organizationId","leadId","evidenceEventId") REFERENCES "LeadEvent"("organizationId","leadId","id");
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_recommendation_same_lead" FOREIGN KEY ("organizationId","leadId","recommendationId") REFERENCES "Recommendation"("organizationId","leadId","id");
ALTER TABLE "StateHistory" ADD CONSTRAINT "StateHistory_event_same_lead" FOREIGN KEY ("organizationId","leadId","eventId") REFERENCES "LeadEvent"("organizationId","leadId","id");
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_score_bounds" CHECK ("leadScore" BETWEEN 0 AND 100 AND "rescueRisk" BETWEEN 0 AND 100 AND "progressionScore" BETWEEN 0 AND 100 AND "rescuePriority" BETWEEN 0 AND 100 AND "coverage" BETWEEN 0 AND 1);
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_score_bounds" CHECK ("leadScore" BETWEEN 0 AND 100 AND "rescueRisk" BETWEEN 0 AND 100 AND "progressionScore" BETWEEN 0 AND 100 AND "rescuePriority" BETWEEN 0 AND 100 AND "coverage" BETWEEN 0 AND 1);
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_price_bounds" CHECK (("minPrice" IS NULL OR "minPrice">=0) AND ("maxPrice" IS NULL OR "maxPrice">=0) AND ("minPrice" IS NULL OR "maxPrice" IS NULL OR "minPrice"<="maxPrice"));
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_projection_version" CHECK ("projectionVersion" <= "version");
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_not_own_duplicate" CHECK ("canonicalLeadId" IS NULL OR "canonicalLeadId" <> "id");
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_no_L3" CHECK ("level" <> 'L3');
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_confidence" CHECK ("confidence" BETWEEN 0 AND 1);
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_money" CHECK (("amount" IS NULL OR "amount">=0) AND ("commission" IS NULL OR "commission">=0));
CREATE UNIQUE INDEX "Recommendation_active_fingerprint" ON "Recommendation"("organizationId","fingerprint") WHERE "status" IN ('PENDING','ACCEPTED');
CREATE UNIQUE INDEX "ExceptionCase_active_fingerprint" ON "ExceptionCase"("organizationId","fingerprint") WHERE "status" IN ('OPEN','ASSIGNED');
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" FORCE ROW LEVEL SECURITY;
CREATE POLICY "Membership_tenant" ON "Membership" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "Broker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Broker" FORCE ROW LEVEL SECURITY;
CREATE POLICY "Broker_tenant" ON "Broker" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "PolicyVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PolicyVersion" FORCE ROW LEVEL SECURITY;
CREATE POLICY "PolicyVersion_tenant" ON "PolicyVersion" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" FORCE ROW LEVEL SECURITY;
CREATE POLICY "Lead_tenant" ON "Lead" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "LeadEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY "LeadEvent_tenant" ON "LeadEvent" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "AnalysisRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnalysisRun" FORCE ROW LEVEL SECURITY;
CREATE POLICY "AnalysisRun_tenant" ON "AnalysisRun" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "StateHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StateHistory" FORCE ROW LEVEL SECURITY;
CREATE POLICY "StateHistory_tenant" ON "StateHistory" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "ScoreSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScoreSnapshot" FORCE ROW LEVEL SECURITY;
CREATE POLICY "ScoreSnapshot_tenant" ON "ScoreSnapshot" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "Recommendation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Recommendation" FORCE ROW LEVEL SECURITY;
CREATE POLICY "Recommendation_tenant" ON "Recommendation" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "ExceptionCase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExceptionCase" FORCE ROW LEVEL SECURITY;
CREATE POLICY "ExceptionCase_tenant" ON "ExceptionCase" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "ImportBatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImportBatch" FORCE ROW LEVEL SECURITY;
CREATE POLICY "ImportBatch_tenant" ON "ImportBatch" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "ImportRow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImportRow" FORCE ROW LEVEL SECURITY;
CREATE POLICY "ImportRow_tenant" ON "ImportRow" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "OutboxJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OutboxJob" FORCE ROW LEVEL SECURITY;
CREATE POLICY "OutboxJob_tenant" ON "OutboxJob" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" FORCE ROW LEVEL SECURITY;
CREATE POLICY "ApiKey_tenant" ON "ApiKey" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "IdempotencyRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IdempotencyRecord" FORCE ROW LEVEL SECURITY;
CREATE POLICY "IdempotencyRecord_tenant" ON "IdempotencyRecord" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;
CREATE POLICY "AuditLog_tenant" ON "AuditLog" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
ALTER TABLE "Outcome" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Outcome" FORCE ROW LEVEL SECURITY;
CREATE POLICY "Outcome_tenant" ON "Outcome" FOR ALL TO leadrescue_app
USING ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid)
WITH CHECK ("organizationId" = nullif(current_setting('app.organization_id',true),'')::uuid);
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Membership" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Broker" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "PolicyVersion" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Lead" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "LeadEvent" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "AnalysisRun" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "StateHistory" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ScoreSnapshot" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Recommendation" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ExceptionCase" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ImportBatch" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ImportRow" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "OutboxJob" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ApiKey" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "IdempotencyRecord" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "AuditLog" TO leadrescue_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Outcome" TO leadrescue_app;
REVOKE UPDATE, DELETE, TRUNCATE ON "LeadEvent", "PolicyVersion", "AuditLog", "StateHistory", "ScoreSnapshot" FROM leadrescue_app;
-- Organization/User provisioning and privacy erasure use a separate narrowly scoped
-- service, never credentials available to ordinary web requests or LLMs.
-- Do not grant web runtime generic access to global User or Organization tables.
-- Membership creation/user linking is mediated by the identity service.
-- Broker-level authorization remains mandatory in repositories (RLS is tenant-level).
-- Erasure worker uses audited elevated credentials; backup deletion ledger is external
-- to the restored dataset, so a restore cannot accidentally remove its own ledger.


