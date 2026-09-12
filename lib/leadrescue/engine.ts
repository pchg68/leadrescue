export const ENGINE_VERSION = "rules-v0.1.0-components";
export const RISK_WEIGHTS = {
  SLA_OVERDUE: 30, NO_FIRST_BROKER_RESPONSE: 25, CUSTOMER_WAITING: 25,
  POST_VISIT_OVERDUE: 20, PROPOSAL_FOLLOWUP_OVERDUE: 25,
  HIGH_INTENT_STAGNANT: 15, THREE_UNANSWERED_ATTEMPTS: -20, EXPLICIT_DISINTEREST: -50,
} as const;
export type RiskFlag = keyof typeof RISK_WEIGHTS;
export type Progression = Record<'Q'|'T'|'V'|'C'|'P'|'N'|'S'|'R'|'A',number>;
export type ScoreInput = { leadComponents:number[]; riskFlags:string[]; progression:Progression; zeroRiskGate?:string };
export type Gate = 'DO_NOT_CONTACT'|'CONTACT_IN_FUTURE'|'BLOCKED'|'DUPLICATE'|'WON'|'BOUGHT_ELSEWHERE';
const zeroGates = new Set<string>(['DO_NOT_CONTACT','CONTACT_IN_FUTURE','BLOCKED','DUPLICATE','WON','BOUGHT_ELSEWHERE']);
const allowedComponents = [[0,3,8,15,25,30],[0,5,12,20,25],[0,5,12,20],[0,5,10,15],[0,2,4,7,9,10]];
const progressionAllowed = {Q:[0,4,8,12,16,20],T:[0,20],V:[0,15],C:[0,15],P:[0,20],N:[0,10],S:[0,15],R:[0,10],A:[0,10]};
export function clamp(n:number) { return Math.max(0,Math.min(100,n)); }
export function priorityBand(n:number) {
  if (!Number.isFinite(n)||n<0||n>100) throw new Error('INVALID_PRIORITY');
  return n>=80?'CRITICAL':n>=60?'HIGH':n>=40?'MEDIUM':'LOW';
}
export function priority(LS:number,RR:number,PS:number) {
  for(const n of [LS,RR,PS]) if(!Number.isInteger(n)||n<0||n>100) throw new Error('INVALID_SCORE');
  // Integer scores and integer hundredths: no intermediate floating-point rounding.
  return (45*LS+35*RR+20*(100-PS))/100;
}
export function calculateScores(input:ScoreInput) {
  if(input.leadComponents.length!==5 || input.leadComponents.some((n,i)=>!allowedComponents[i].includes(n))) throw new Error('INVALID_LEAD_COMPONENT');
  for(const key of Object.keys(progressionAllowed) as (keyof Progression)[]) {
    if(!progressionAllowed[key].includes(input.progression[key])) throw new Error('INVALID_PROGRESSION_COMPONENT');
  }
  if(input.zeroRiskGate && !zeroGates.has(input.zeroRiskGate)) throw new Error('INVALID_GATE');
  const flags=[...new Set(input.riskFlags)];
  if(flags.some(f=>!Object.hasOwn(RISK_WEIGHTS,f))) throw new Error('UNKNOWN_RISK_FLAG');
  const riskComponents=flags.map(f=>({code:f,points:RISK_WEIGHTS[f as RiskFlag]}));
  const LS=clamp(input.leadComponents.reduce((a,b)=>a+b,0));
  const rawRisk=riskComponents.reduce((a,b)=>a+b.points,0);
  const RR=input.zeroRiskGate?0:clamp(rawRisk);
  const p=input.progression;
  const PS=clamp(p.Q+p.T+p.V+p.C+p.P+p.N-p.S-p.R-p.A);
  const RP=priority(LS,RR,PS);
  return {LS,RR,PS,RP,priority:priorityBand(RP),rawRisk,riskComponents};
}
export type Context = {
  coverage:number; stage:string; gate?:Gate; cooldown?:boolean; sensitive?:boolean;
  obligationOverdue?:boolean; provenStagnation?:boolean; recoveryEligible?:boolean;
};
export function decision(input:ScoreInput,ctx:Context) {
  if(!Number.isFinite(ctx.coverage)||ctx.coverage<0||ctx.coverage>1) throw new Error('INVALID_COVERAGE');
  const gate=ctx.gate||input.zeroRiskGate||(['BLOCKED','DUPLICATE','WON'].includes(ctx.stage)?ctx.stage:undefined);
  const scores=calculateScores({...input,zeroRiskGate:gate});
  let suppressionReason:string|null=null;
  if(gate) suppressionReason=gate;
  else if(ctx.cooldown) suppressionReason='COOLDOWN';
  else if(ctx.coverage<.5) suppressionReason='LOW_COVERAGE';
  else if(!ctx.obligationOverdue&&!ctx.provenStagnation&&!ctx.recoveryEligible) suppressionReason='NO_PROVEN_OBLIGATION';
  const queueEligible=!suppressionReason;
  let action='WAIT',level='L0';
  if(!gate&&!ctx.cooldown) {
    if(ctx.sensitive) { action='ESCALATE';level='L4'; }
    else if(ctx.coverage<.5) { action='QUALIFY';level='L2'; }
    else if(queueEligible) {
      level='L2';
      if(scores.priority==='CRITICAL') {action='ESCALATE';level='L4';}
      else if(input.riskFlags.includes('POST_VISIT_OVERDUE')) action='ASK_FEEDBACK';
      else if(input.riskFlags.includes('PROPOSAL_FOLLOWUP_OVERDUE')) action='FOLLOW_UP';
      else if(input.riskFlags.includes('NO_FIRST_BROKER_RESPONSE')) action='CONTACT';
      else if(ctx.recoveryEligible) action='REACTIVATE';
      else action='QUALIFY';
    }
  }
  return {...scores,queueEligible,suppressionReason,action,level,humanRequired:action==='ESCALATE'};
}
export type ReviewStatus='PENDING'|'ACCEPTED'|'EXECUTED'|'DISMISSED';
export type Review={status:ReviewStatus;note?:string;at?:string};
export function transitionReview(current:Review,next:ReviewStatus,allowed:boolean,note='',at=new Date().toISOString()):Review {
  if(!allowed) throw new Error('REVIEW_NOT_ACTIONABLE');
  const valid=current.status==='PENDING'&&(next==='ACCEPTED'||next==='DISMISSED') || current.status==='ACCEPTED'&&(next==='EXECUTED'||next==='DISMISSED');
  if(!valid) throw new Error('INVALID_REVIEW_TRANSITION');
  if((next==='EXECUTED'||next==='DISMISSED')&&note.trim().length<8) throw new Error('EVIDENCE_REQUIRED');
  if(note.length>1200) throw new Error('NOTE_TOO_LONG');
  return {status:next,note:note.trim()||undefined,at};
}
export function rejectExternalAutomation(level:string) {
  if(level==='L3') throw new Error('AUTOMATION_DISABLED');
  if(!['L0','L1','L2','L4'].includes(level)) throw new Error('INVALID_LEVEL');
}
export function csvCell(value:unknown) {
  let text=String(value??'');
  if(/^[\s]*[=+@-]|^[\t\r]/.test(text)) text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
