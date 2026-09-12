// Normative wire types. Validate at runtime; TypeScript alone does not validate JSON.
export type UUID = string;
export type ISODateTime = string;
export type Money = string; // decimal, exactly 2 fractional digits
export type Role = "ORGANIZATION_ADMIN" | "MANAGER" | "BROKER";
export type LeadState = "NEW" | "CONTACTED" | "QUALIFYING" | "QUALIFIED" | "MATCHING" | "OPPORTUNITY" | "VISIT_REQUESTED" | "VISIT_SCHEDULED" | "VISIT_COMPLETED" | "NEGOTIATION" | "PROPOSAL" | "WON" | "PAUSED" | "NURTURE" | "RECOVERY" | "NO_FIT" | "LOST" | "DUPLICATE" | "BLOCKED";
export type OperationType = "SALE" | "RENT" | "UNKNOWN";
export type FinancingStatus = "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE";
export type Fit = "EXCELLENT" | "GOOD" | "LIMITED" | "NONE" | "UNKNOWN";
export type LossReason = "NO_RESPONSE" | "TIMING" | "FINANCING_PENDING" | "NO_INVENTORY" | "BOUGHT_ELSEWHERE" | "EXPLICIT_DISINTEREST" | "PRICE" | "OTHER" | "UNKNOWN";
export type ActionType = "CONTACT" | "FOLLOW_UP" | "QUALIFY" | "SCHEDULE_VISIT" | "ASK_FEEDBACK" | "RECOMMEND_PROPERTY" | "REACTIVATE" | "ESCALATE" | "WAIT" | "CLOSE";
export type InterventionLevel = "L0" | "L1" | "L2" | "L3" | "L4";
export type RecommendationStatus = "PENDING" | "ACCEPTED" | "EXECUTED" | "DISMISSED" | "EXPIRED";
export type ExceptionType = "NEGOTIATION_REQUIRED" | "PRICE_REQUEST" | "PROPERTY_SWAP" | "COMPLAINT" | "DATA_CONFLICT" | "BROKER_UNAVAILABLE" | "HIGH_VALUE_LEAD_AT_RISK" | "UNKNOWN_INTENT" | "DUPLICATE" | "INTEGRATION_ERROR" | "DO_NOT_CONTACT";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ExceptionStatus = "OPEN" | "ASSIGNED" | "RESOLVED" | "DISMISSED";
export type ActorType = "USER" | "API_KEY" | "IMPORT" | "SYSTEM";
export type AnalysisMode = "LIVE" | "HISTORICAL";
export type JobStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
export type ImportStatus = "UPLOADED" | "VALIDATING" | "VALIDATED" | "IMPORTING" | "COMPLETED" | "PARTIAL" | "FAILED" | "CANCELLED";
export type RowStatus = "VALID" | "INVALID" | "WARNING" | "IMPORTED" | "SKIPPED";
export type OutcomeType = "REACTIVATED" | "VISIT" | "PROPOSAL" | "WON";
export type JobType = "ANALYZE" | "IMPORT_VALIDATE" | "IMPORT_COMMIT" | "AUDIT" | "PRIVACY_EXPORT" | "PRIVACY_ERASE" | "RETENTION";
export type Profile = { "city"?: string | null; "neighborhood"?: string | null; "propertyType"?: string | null; "minPrice"?: string | null; "maxPrice"?: string | null; "availableDownPayment"?: string | null; "bedrooms"?: number | null; "parkingSpaces"?: number | null; "purchaseTimelineDays"?: number | null; "financingStatus"?: "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE"; "fit"?: "EXCELLENT" | "GOOD" | "LIMITED" | "NONE" | "UNKNOWN"; "motivation"?: string | null };
export interface EventPayloadMap {
  "lead.created": { "name"?: string | null; "email"?: string | null; "phone"?: string | null; "operationType": "SALE" | "RENT" | "UNKNOWN"; "sourceDetail"?: string | null; "profile"?: { "city"?: string | null; "neighborhood"?: string | null; "propertyType"?: string | null; "minPrice"?: string | null; "maxPrice"?: string | null; "availableDownPayment"?: string | null; "bedrooms"?: number | null; "parkingSpaces"?: number | null; "purchaseTimelineDays"?: number | null; "financingStatus"?: "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE"; "fit"?: "EXCELLENT" | "GOOD" | "LIMITED" | "NONE" | "UNKNOWN"; "motivation"?: string | null }; "originalCreatedAt"?: string | null };
  "lead.imported": { "name"?: string | null; "email"?: string | null; "phone"?: string | null; "operationType"?: "SALE" | "RENT" | "UNKNOWN"; "sourceDetail"?: string | null; "profile"?: { "city"?: string | null; "neighborhood"?: string | null; "propertyType"?: string | null; "minPrice"?: string | null; "maxPrice"?: string | null; "availableDownPayment"?: string | null; "bedrooms"?: number | null; "parkingSpaces"?: number | null; "purchaseTimelineDays"?: number | null; "financingStatus"?: "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE"; "fit"?: "EXCELLENT" | "GOOD" | "LIMITED" | "NONE" | "UNKNOWN"; "motivation"?: string | null }; "currentState": "NEW" | "CONTACTED" | "QUALIFYING" | "QUALIFIED" | "MATCHING" | "OPPORTUNITY" | "VISIT_REQUESTED" | "VISIT_SCHEDULED" | "VISIT_COMPLETED" | "NEGOTIATION" | "PROPOSAL" | "WON" | "PAUSED" | "NURTURE" | "RECOVERY" | "NO_FIT" | "LOST" | "DUPLICATE" | "BLOCKED"; "asOf": string; "coverage": { "interactionsCompleteFrom": string | null; "interactionsCompleteThrough": string | null; "stateHistoryCompleteFrom": string | null; "precision": "INSTANT" | "DATE_ONLY" | "UNKNOWN" }; "originalCreatedAt"?: string | null; "lastInteractionAt"?: string | null; "lossReason"?: "NO_RESPONSE" | "TIMING" | "FINANCING_PENDING" | "NO_INVENTORY" | "BOUGHT_ELSEWHERE" | "EXPLICIT_DISINTEREST" | "PRICE" | "OTHER" | "UNKNOWN"; "lostAt"?: string | null; "doNotContact"?: boolean; "contactNotBefore"?: string | null };
  "lead.updated": { "changes": { "name"?: string | null; "email"?: string | null; "phone"?: string | null; "operationType"?: "SALE" | "RENT" | "UNKNOWN"; "sourceDetail"?: string | null; "profile"?: { "city"?: string | null; "neighborhood"?: string | null; "propertyType"?: string | null; "minPrice"?: string | null; "maxPrice"?: string | null; "availableDownPayment"?: string | null; "bedrooms"?: number | null; "parkingSpaces"?: number | null; "purchaseTimelineDays"?: number | null; "financingStatus"?: "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE"; "fit"?: "EXCELLENT" | "GOOD" | "LIMITED" | "NONE" | "UNKNOWN"; "motivation"?: string | null } }; "reason": string };
  "state.changed": { "from": "NEW" | "CONTACTED" | "QUALIFYING" | "QUALIFIED" | "MATCHING" | "OPPORTUNITY" | "VISIT_REQUESTED" | "VISIT_SCHEDULED" | "VISIT_COMPLETED" | "NEGOTIATION" | "PROPOSAL" | "WON" | "PAUSED" | "NURTURE" | "RECOVERY" | "NO_FIT" | "LOST" | "DUPLICATE" | "BLOCKED"; "to": "NEW" | "CONTACTED" | "QUALIFYING" | "QUALIFIED" | "MATCHING" | "OPPORTUNITY" | "VISIT_REQUESTED" | "VISIT_SCHEDULED" | "VISIT_COMPLETED" | "NEGOTIATION" | "PROPOSAL" | "WON" | "PAUSED" | "NURTURE" | "RECOVERY" | "NO_FIT" | "LOST" | "DUPLICATE" | "BLOCKED"; "reason": string; "canonicalLeadId"?: string };
  "message.received": { "messageId": string; "channel": "WHATSAPP" | "EMAIL" | "PHONE" | "PORTAL" | "OTHER"; "text"?: string; "requiresResponse": boolean };
  "message.sent": { "messageId": string; "channel": "WHATSAPP" | "EMAIL" | "PHONE" | "PORTAL" | "OTHER"; "text"?: string; "purpose": "FIRST_CONTACT" | "FOLLOW_UP" | "VISIT_FEEDBACK" | "PROPOSAL_FOLLOW_UP" | "OTHER" };
  "broker.assigned": { "brokerId": string | null; "reason": string };
  "broker.responded": { "brokerId": string; "messageId"?: string; "purpose": "FIRST_CONTACT" | "FOLLOW_UP" | "VISIT_FEEDBACK" | "PROPOSAL_FOLLOW_UP" | "OTHER" };
  "qualification.started": { "reason": string };
  "qualification.completed": { "operationType": "SALE" | "RENT" | "UNKNOWN"; "region": string | null; "budget": string | null; "timelineDays": number | null; "financingStatus": "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE" };
  "visit.requested": { "visitId": string };
  "visit.scheduled": { "visitId": string; "scheduledFor": string };
  "visit.completed": { "visitId": string; "note"?: string };
  "proposal.created": { "proposalId": string; "amount": string | null };
  "proposal.sent": { "proposalId": string; "amount": string | null };
  "lead.paused": { "resumeAt": string; "reason": string };
  "lead.reactivated": { "reason": string; "recommendationId"?: string };
  "lead.marked_lost": { "reason": "NO_RESPONSE" | "TIMING" | "FINANCING_PENDING" | "NO_INVENTORY" | "BOUGHT_ELSEWHERE" | "EXPLICIT_DISINTEREST" | "PRICE" | "OTHER" | "UNKNOWN"; "note"?: string };
  "deal.lost": { "dealId": string; "reason": "NO_RESPONSE" | "TIMING" | "FINANCING_PENDING" | "NO_INVENTORY" | "BOUGHT_ELSEWHERE" | "EXPLICIT_DISINTEREST" | "PRICE" | "OTHER" | "UNKNOWN" };
  "deal.won": { "dealId": string; "amount": string | null; "commission": string | null; "operationType": "SALE" | "RENT" | "UNKNOWN" };
  "contact.preference_changed": { "doNotContact": boolean; "contactNotBefore": string | null; "reason": string; "evidenceId"?: string };
  "human.intervention_requested": { "exceptionType": "NEGOTIATION_REQUIRED" | "PRICE_REQUEST" | "PROPERTY_SWAP" | "COMPLAINT" | "DATA_CONFLICT" | "BROKER_UNAVAILABLE" | "HIGH_VALUE_LEAD_AT_RISK" | "UNKNOWN_INTENT" | "DUPLICATE" | "INTEGRATION_ERROR" | "DO_NOT_CONTACT"; "reason": string; "evidenceEventIds": Array<string> };
  "next_action.defined": { "action": "CONTACT" | "FOLLOW_UP" | "QUALIFY" | "SCHEDULE_VISIT" | "ASK_FEEDBACK" | "RECOMMEND_PROPERTY" | "REACTIVATE" | "ESCALATE" | "WAIT" | "CLOSE"; "actor": "BROKER" | "CUSTOMER"; "actionAt": string; "deadlineAt": string; "brokerId": string | null };
  "qualification.repetition_confirmed": { "reason": string; "evidenceEventIds": Array<string> };
  "observer.sla_violation": { "conditionCode": string; "deadlineAt": string; "analysisRunId": string };
  "recommendation.created": { "recommendationId": string; "action": "CONTACT" | "FOLLOW_UP" | "QUALIFY" | "SCHEDULE_VISIT" | "ASK_FEEDBACK" | "RECOMMEND_PROPERTY" | "REACTIVATE" | "ESCALATE" | "WAIT" | "CLOSE"; "level": "L0" | "L1" | "L2" | "L4" };
  "recommendation.accepted": { "recommendationId": string };
  "recommendation.dismissed": { "recommendationId": string; "reason": string };
  "recommendation.executed": { "recommendationId": string; "executedAt": string; "evidenceEventId"?: string; "note": string };
  "recommendation.expired": { "recommendationId": string; "reason": string };
  "exception.created": { "exceptionId": string; "type": "NEGOTIATION_REQUIRED" | "PRICE_REQUEST" | "PROPERTY_SWAP" | "COMPLAINT" | "DATA_CONFLICT" | "BROKER_UNAVAILABLE" | "HIGH_VALUE_LEAD_AT_RISK" | "UNKNOWN_INTENT" | "DUPLICATE" | "INTEGRATION_ERROR" | "DO_NOT_CONTACT" };
  "exception.resolved": { "exceptionId": string; "reason": string };
  "analysis.completed": { "analysisRunId": string; "inputVersion": number };
  "event.corrected": { "targetEventId": string; "reason": string; "replacement": { "type": "lead.created"; "occurredAt": string; "payload": { "name"?: string | null; "email"?: string | null; "phone"?: string | null; "operationType": "SALE" | "RENT" | "UNKNOWN"; "sourceDetail"?: string | null; "profile"?: { "city"?: string | null; "neighborhood"?: string | null; "propertyType"?: string | null; "minPrice"?: string | null; "maxPrice"?: string | null; "availableDownPayment"?: string | null; "bedrooms"?: number | null; "parkingSpaces"?: number | null; "purchaseTimelineDays"?: number | null; "financingStatus"?: "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE"; "fit"?: "EXCELLENT" | "GOOD" | "LIMITED" | "NONE" | "UNKNOWN"; "motivation"?: string | null }; "originalCreatedAt"?: string | null } } | { "type": "lead.imported"; "occurredAt": string; "payload": { "name"?: string | null; "email"?: string | null; "phone"?: string | null; "operationType"?: "SALE" | "RENT" | "UNKNOWN"; "sourceDetail"?: string | null; "profile"?: { "city"?: string | null; "neighborhood"?: string | null; "propertyType"?: string | null; "minPrice"?: string | null; "maxPrice"?: string | null; "availableDownPayment"?: string | null; "bedrooms"?: number | null; "parkingSpaces"?: number | null; "purchaseTimelineDays"?: number | null; "financingStatus"?: "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE"; "fit"?: "EXCELLENT" | "GOOD" | "LIMITED" | "NONE" | "UNKNOWN"; "motivation"?: string | null }; "currentState": "NEW" | "CONTACTED" | "QUALIFYING" | "QUALIFIED" | "MATCHING" | "OPPORTUNITY" | "VISIT_REQUESTED" | "VISIT_SCHEDULED" | "VISIT_COMPLETED" | "NEGOTIATION" | "PROPOSAL" | "WON" | "PAUSED" | "NURTURE" | "RECOVERY" | "NO_FIT" | "LOST" | "DUPLICATE" | "BLOCKED"; "asOf": string; "coverage": { "interactionsCompleteFrom": string | null; "interactionsCompleteThrough": string | null; "stateHistoryCompleteFrom": string | null; "precision": "INSTANT" | "DATE_ONLY" | "UNKNOWN" }; "originalCreatedAt"?: string | null; "lastInteractionAt"?: string | null; "lossReason"?: "NO_RESPONSE" | "TIMING" | "FINANCING_PENDING" | "NO_INVENTORY" | "BOUGHT_ELSEWHERE" | "EXPLICIT_DISINTEREST" | "PRICE" | "OTHER" | "UNKNOWN"; "lostAt"?: string | null; "doNotContact"?: boolean; "contactNotBefore"?: string | null } } | { "type": "lead.updated"; "occurredAt": string; "payload": { "changes": { "name"?: string | null; "email"?: string | null; "phone"?: string | null; "operationType"?: "SALE" | "RENT" | "UNKNOWN"; "sourceDetail"?: string | null; "profile"?: { "city"?: string | null; "neighborhood"?: string | null; "propertyType"?: string | null; "minPrice"?: string | null; "maxPrice"?: string | null; "availableDownPayment"?: string | null; "bedrooms"?: number | null; "parkingSpaces"?: number | null; "purchaseTimelineDays"?: number | null; "financingStatus"?: "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE"; "fit"?: "EXCELLENT" | "GOOD" | "LIMITED" | "NONE" | "UNKNOWN"; "motivation"?: string | null } }; "reason": string } } | { "type": "state.changed"; "occurredAt": string; "payload": { "from": "NEW" | "CONTACTED" | "QUALIFYING" | "QUALIFIED" | "MATCHING" | "OPPORTUNITY" | "VISIT_REQUESTED" | "VISIT_SCHEDULED" | "VISIT_COMPLETED" | "NEGOTIATION" | "PROPOSAL" | "WON" | "PAUSED" | "NURTURE" | "RECOVERY" | "NO_FIT" | "LOST" | "DUPLICATE" | "BLOCKED"; "to": "NEW" | "CONTACTED" | "QUALIFYING" | "QUALIFIED" | "MATCHING" | "OPPORTUNITY" | "VISIT_REQUESTED" | "VISIT_SCHEDULED" | "VISIT_COMPLETED" | "NEGOTIATION" | "PROPOSAL" | "WON" | "PAUSED" | "NURTURE" | "RECOVERY" | "NO_FIT" | "LOST" | "DUPLICATE" | "BLOCKED"; "reason": string; "canonicalLeadId"?: string } } | { "type": "message.received"; "occurredAt": string; "payload": { "messageId": string; "channel": "WHATSAPP" | "EMAIL" | "PHONE" | "PORTAL" | "OTHER"; "text"?: string; "requiresResponse": boolean } } | { "type": "message.sent"; "occurredAt": string; "payload": { "messageId": string; "channel": "WHATSAPP" | "EMAIL" | "PHONE" | "PORTAL" | "OTHER"; "text"?: string; "purpose": "FIRST_CONTACT" | "FOLLOW_UP" | "VISIT_FEEDBACK" | "PROPOSAL_FOLLOW_UP" | "OTHER" } } | { "type": "broker.assigned"; "occurredAt": string; "payload": { "brokerId": string | null; "reason": string } } | { "type": "broker.responded"; "occurredAt": string; "payload": { "brokerId": string; "messageId"?: string; "purpose": "FIRST_CONTACT" | "FOLLOW_UP" | "VISIT_FEEDBACK" | "PROPOSAL_FOLLOW_UP" | "OTHER" } } | { "type": "qualification.started"; "occurredAt": string; "payload": { "reason": string } } | { "type": "qualification.completed"; "occurredAt": string; "payload": { "operationType": "SALE" | "RENT" | "UNKNOWN"; "region": string | null; "budget": string | null; "timelineDays": number | null; "financingStatus": "APPROVED" | "OWN_FUNDS" | "DOWN_PAYMENT" | "UNDER_REVIEW" | "UNKNOWN" | "UNABLE" } } | { "type": "visit.requested"; "occurredAt": string; "payload": { "visitId": string } } | { "type": "visit.scheduled"; "occurredAt": string; "payload": { "visitId": string; "scheduledFor": string } } | { "type": "visit.completed"; "occurredAt": string; "payload": { "visitId": string; "note"?: string } } | { "type": "proposal.created"; "occurredAt": string; "payload": { "proposalId": string; "amount": string | null } } | { "type": "proposal.sent"; "occurredAt": string; "payload": { "proposalId": string; "amount": string | null } } | { "type": "lead.paused"; "occurredAt": string; "payload": { "resumeAt": string; "reason": string } } | { "type": "lead.reactivated"; "occurredAt": string; "payload": { "reason": string; "recommendationId"?: string } } | { "type": "lead.marked_lost"; "occurredAt": string; "payload": { "reason": "NO_RESPONSE" | "TIMING" | "FINANCING_PENDING" | "NO_INVENTORY" | "BOUGHT_ELSEWHERE" | "EXPLICIT_DISINTEREST" | "PRICE" | "OTHER" | "UNKNOWN"; "note"?: string } } | { "type": "deal.lost"; "occurredAt": string; "payload": { "dealId": string; "reason": "NO_RESPONSE" | "TIMING" | "FINANCING_PENDING" | "NO_INVENTORY" | "BOUGHT_ELSEWHERE" | "EXPLICIT_DISINTEREST" | "PRICE" | "OTHER" | "UNKNOWN" } } | { "type": "deal.won"; "occurredAt": string; "payload": { "dealId": string; "amount": string | null; "commission": string | null; "operationType": "SALE" | "RENT" | "UNKNOWN" } } | { "type": "contact.preference_changed"; "occurredAt": string; "payload": { "doNotContact": boolean; "contactNotBefore": string | null; "reason": string; "evidenceId"?: string } } | { "type": "human.intervention_requested"; "occurredAt": string; "payload": { "exceptionType": "NEGOTIATION_REQUIRED" | "PRICE_REQUEST" | "PROPERTY_SWAP" | "COMPLAINT" | "DATA_CONFLICT" | "BROKER_UNAVAILABLE" | "HIGH_VALUE_LEAD_AT_RISK" | "UNKNOWN_INTENT" | "DUPLICATE" | "INTEGRATION_ERROR" | "DO_NOT_CONTACT"; "reason": string; "evidenceEventIds": Array<string> } } | { "type": "next_action.defined"; "occurredAt": string; "payload": { "action": "CONTACT" | "FOLLOW_UP" | "QUALIFY" | "SCHEDULE_VISIT" | "ASK_FEEDBACK" | "RECOMMEND_PROPERTY" | "REACTIVATE" | "ESCALATE" | "WAIT" | "CLOSE"; "actor": "BROKER" | "CUSTOMER"; "actionAt": string; "deadlineAt": string; "brokerId": string | null } } | { "type": "qualification.repetition_confirmed"; "occurredAt": string; "payload": { "reason": string; "evidenceEventIds": Array<string> } } };
}
export type EventType = keyof EventPayloadMap;
export type EventInput = { [K in EventType]: {
  type: K; schemaVersion: 1; sourceEventId: string; sourceSequence?: string;
  occurredAt: ISODateTime; payload: EventPayloadMap[K]
}}[EventType];
export type EventView = EventInput & {
  id: UUID; organizationId: UUID; leadId: UUID; source: string;
  actor: {type: ActorType; id: string|null}; receivedAt: ISODateTime;
};
export interface CreateLead {
  source: string; externalId?: string; name?: string; email?: string; phone?: string;
  operationType: OperationType; originalCreatedAt?: ISODateTime|null; profile?: Profile;
}
export interface LeadPatch {
  name?: string|null; email?: string|null; phone?: string|null;
  operationType?: OperationType; sourceDetail?: string|null; profile?: Profile;
}
export interface Scores {
  leadScore: number; rescueRisk: number; progressionScore: number;
  rescuePriority: number; priority: Severity; coverage: number;
  queueEligible: boolean; suppressionReason: string|null;
}
export interface LeadView {
  id: UUID; name: string|null; source: string; externalId: string|null;
  brokerId: UUID|null; currentState: LeadState; humanRequired: boolean;
  doNotContact: boolean; provisionalContactBlock: boolean;
  contactNotBefore: ISODateTime|null; scores: Scores|null;
  version: number; projectionVersion: number; analysisPending: boolean;
  profile: Profile; currentAnalysisId: UUID|null;
}
export interface Meta {requestId: string; nextCursor?: string|null}
export interface Response<T> {data:T; meta:Meta}
export interface Page<T> {items:T[]; nextCursor:string|null}
export interface ApiError {error:{code:string; message:string; details?:Record<string,unknown>; requestId:string}}
export interface JobRef {id:UUID; status:JobStatus; pollUrl:string}
export interface AnalyzeInput {mode:AnalysisMode; asOf?:ISODateTime}
export interface RecommendationView {
  id:UUID; leadId:UUID; action:ActionType; level:Exclude<InterventionLevel,"L3">;
  status:RecommendationStatus; priority:Severity; reason:string;
  evidenceEventIds:UUID[]; confidence:number; version:number; expiresAt:ISODateTime;
}
export type RecommendationDecision =
  | {decision:"ACCEPT"}
  | {decision:"DISMISS";reason:string}
  | {decision:"EXECUTE";executedAt:ISODateTime;note:string;evidenceEventId?:UUID};
export type ExceptionDecision =
  | {decision:"ASSIGN";assignedTo:UUID;reason:string}
  | {decision:"RESOLVE"|"DISMISS";reason:string;evidenceEventId?:UUID};
export interface OutcomeInput {
  type:OutcomeType; externalMilestoneId:string; occurredAt:ISODateTime;
  operationType:OperationType; amount?:Money|null; commission?:Money|null;
  recommendationId?:UUID; evidenceEventId?:UUID; note:string;
}
export interface ImportMapping {
  columns:Record<string,string>; statusMap:Record<string,LeadState>;
  brokerMap:Record<string,UUID|null>; dateFormat:string; timezone:string;
  coverage: {interactionsCompleteFrom:ISODateTime|null;interactionsCompleteThrough:ISODateTime|null;
    stateHistoryCompleteFrom:ISODateTime|null;precision:"INSTANT"|"DATE_ONLY"|"UNKNOWN"};
}
export interface Policy {
  version:number; timezone:string; businessHours:Record<string,Array<{start:string;end:string}>>;
  holidays:string[]; stateSlaMinutes:Partial<Record<LeadState,number>>;
  unansweredAttemptLimit:3; attemptWindowDays:14; cooldownDays:30;
  attributionWindowDays:30; enabledLevels:Array<"L0"|"L1"|"L2"|"L4">;
  ai:{enabled:boolean;dailyCallLimit:number;perLeadDailyLimit:number};
}
export interface EvidenceFeature<T> {value:T|null;known:boolean;evidenceEventIds:UUID[];observedAt:ISODateTime|null}
export interface NBACandidate {
  action:ActionType; reason:string; evidenceIds:UUID[]; confidence:number;
  humanRequired:boolean; optionalDraft:string|null;
}


