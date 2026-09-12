import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculateScores,priority,priorityBand,decision,transitionReview,rejectExternalAutomation,csvCell} from '../lib/leadrescue/engine.ts';
const fixtures=JSON.parse(readFileSync(new URL('../contracts/fixtures.json',import.meta.url),'utf8'));
for(const c of fixtures.scoreCases)test('Contrato numérico '+c.id,()=>{
  const result=calculateScores(c);
  for(const key of ['LS','RR','PS','RP','priority'])assert.equal(result[key],c.expected[key],key);
});
for(const c of fixtures.bandCases)test('Fronteira de prioridade '+c.rp,()=>assert.equal(priorityBand(c.rp),c.expected));
test('Exemplo original RP 84,50',()=>{const c=fixtures.formulaCase;assert.equal(priority(c.LS,c.RR,c.PS),c.RP);});
const critical=fixtures.scoreCases[1];
const eligible={stage:'QUALIFYING',coverage:1,obligationOverdue:true};
test('Proteções prevalecem sobre o risco e conservam RP bruto',()=>{
  for(const gate of ['DO_NOT_CONTACT','CONTACT_IN_FUTURE','BLOCKED','DUPLICATE','WON','BOUGHT_ELSEWHERE']){
    const d=decision(critical,{...eligible,gate});assert.equal(d.RR,0);assert.equal(d.RP,63);assert.equal(d.queueEligible,false);assert.equal(d.action,'WAIT');
  }
});
test('Estágio terminal é protegido sem gate explícito',()=>{for(const stage of ['WON','BLOCKED','DUPLICATE'])assert.equal(decision(critical,{...eligible,stage}).queueEligible,false);});
test('Cobertura limitada nunca prova abandono',()=>{const d=decision(critical,{...eligible,coverage:2/6});assert.equal(d.queueEligible,false);assert.equal(d.suppressionReason,'LOW_COVERAGE');assert.equal(d.action,'QUALIFY');});
test('Sem obrigação, potencial alto não entra na fila',()=>{assert.equal(decision(critical,{stage:'QUALIFIED',coverage:1}).queueEligible,false);});
test('Cooldown suprime contato',()=>{const d=decision(critical,{...eligible,cooldown:true});assert.equal(d.action,'WAIT');assert.equal(d.queueEligible,false);});
test('Aceitação não equivale a execução e execução exige evidência',()=>{
  const pending={status:'PENDING'};
  assert.throws(()=>transitionReview(pending,'EXECUTED',true,'ação externa fictícia'));
  const accepted=transitionReview(pending,'ACCEPTED',true);assert.equal(accepted.status,'ACCEPTED');
  assert.throws(()=>transitionReview(accepted,'EXECUTED',true,''));
  const executed=transitionReview(accepted,'EXECUTED',true,'Registro fictício de ligação');assert.equal(executed.status,'EXECUTED');
  assert.throws(()=>transitionReview(executed,'ACCEPTED',true));
  assert.throws(()=>transitionReview(pending,'ACCEPTED',false));
});
test('Dispensar exige motivo e encerra revisão',()=>{assert.throws(()=>transitionReview({status:'PENDING'},'DISMISSED',true));const r=transitionReview({status:'PENDING'},'DISMISSED',true,'Motivo sintético');assert.equal(r.status,'DISMISSED');assert.throws(()=>transitionReview(r,'ACCEPTED',true));});
test('L3 é rejeitado',()=>assert.throws(()=>rejectExternalAutomation('L3'),/AUTOMATION_DISABLED/));
test('Flags repetidas não multiplicam risco',()=>{assert.equal(calculateScores({...critical,riskFlags:['SLA_OVERDUE','SLA_OVERDUE']}).RR,30);});
test('Entradas inválidas não geram scores silenciosos',()=>{assert.throws(()=>calculateScores({...critical,riskFlags:['FAKE']}));assert.throws(()=>calculateScores({...critical,leadComponents:[NaN,25,20,15,10]}));assert.throws(()=>calculateScores({...critical,zeroRiskGate:'FAKE'}));assert.throws(()=>priority(100,NaN,0));});
test('CSV neutraliza fórmulas e escapa aspas',()=>{assert.equal(csvCell('=HYPERLINK("x")'),'"\'=HYPERLINK(""x"")"');assert.equal(csvCell('texto "citado"'),'"texto ""citado"""');assert.equal(csvCell('  +CMD'),'"\'  +CMD"');});
