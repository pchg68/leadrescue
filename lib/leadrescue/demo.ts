import fixtures from '@/contracts/fixtures.json';
import { decision, type Context, type ScoreInput } from './engine';

// Presentation labels are synthetic; numeric inputs come unchanged from Appendix E.
const labels = [
  ['Cadastro incompleto','Novo','Revisar dados','Somente dados parciais; a ausência de histórico não comprova abandono.'],
  ['Alto interesse sem avanço','Em análise','Gestor','Combinação numérica crítica: atraso, espera e intenção alta. Revisão humana obrigatória.'],
  ['Pedido de não contato','Proposta','Contato bloqueado','O bloqueio prevalece sobre qualquer prioridade; o estágio comercial é preservado.'],
  ['Visita em preparação','Visita agendada','Acompanhamento','Há progressão e próxima ação definida. Não há obrigação vencida no cenário.'],
  ['Visita sem feedback','Visita realizada','Corretor','A visita foi concluída no cenário, mas o prazo de feedback venceu.'],
  ['Tentativas sem resposta','Contatado','Em pausa','Três tentativas sem resposta: sugestões de contato ficam em cooldown.'],
  ['Funil em progressão','Proposta','Acompanhamento','Marcos de avanço e próxima ação presentes; pontuação alta não exige resgate.'],
  ['Acúmulo de fatores de risco','Em análise','Gestor','Teste isolado de saturação do risco em 100; não representa uma conversa real.'],
  ['Contato combinado para depois','Nutrição','Aguardar','O compromisso futuro suprime a fila e zera o risco até o retorno.'],
  ['Conversas sem progressão','Qualificação','Corretor','Estagnação comprovada e repetição improdutiva marcada no cenário sintético.'],
];
export const DEMO_CLOCK=fixtures.clock;
export const demoCases=fixtures.scoreCases.map((source,index)=>{
  const input:ScoreInput={leadComponents:source.leadComponents,riskFlags:source.riskFlags,progression:source.progression,zeroRiskGate:'zeroRiskGate' in source?source.zeroRiskGate:undefined};
  const ctx:Context={coverage:index===0?2/6:1,stage:index===2||index===6?'PROPOSAL':index===8?'NURTURE':'QUALIFYING',cooldown:index===5,obligationOverdue:[1,4,7].includes(index),provenStagnation:index===9};
  const [name,stage,owner,summary]=labels[index];
  return {id:source.id,code:'S'+String(index+1).padStart(2,'0'),name,stage,owner,summary,input,ctx,analysis:decision(input,ctx)};
});
export type DemoCase=typeof demoCases[number];
export const bandLabels:Record<string,string>={LOW:'Baixa',MEDIUM:'Média',HIGH:'Alta',CRITICAL:'Crítica'};
export const actionLabels:Record<string,string>={WAIT:'Aguardar',ESCALATE:'Encaminhar ao gestor',QUALIFY:'Revisar qualificação',ASK_FEEDBACK:'Solicitar feedback',FOLLOW_UP:'Revisar acompanhamento',CONTACT:'Revisar primeiro contato',REACTIVATE:'Avaliar reativação'};
export const suppressionLabels:Record<string,string>={DO_NOT_CONTACT:'Não contatar',CONTACT_IN_FUTURE:'Contato futuro',COOLDOWN:'Pausa após tentativas',LOW_COVERAGE:'Dados insuficientes',NO_PROVEN_OBLIGATION:'Sem pendência comprovada',BLOCKED:'Bloqueado',DUPLICATE:'Duplicado',WON:'Concluído',BOUGHT_ELSEWHERE:'Comprou em outro lugar'};
export const flagLabels:Record<string,string>={SLA_OVERDUE:'Prazo de atendimento vencido',NO_FIRST_BROKER_RESPONSE:'Primeira resposta ausente',CUSTOMER_WAITING:'Cliente aguarda resposta',POST_VISIT_OVERDUE:'Feedback da visita atrasado',PROPOSAL_FOLLOWUP_OVERDUE:'Acompanhamento da proposta atrasado',HIGH_INTENT_STAGNANT:'Alta intenção sem avanço',THREE_UNANSWERED_ATTEMPTS:'Três tentativas sem resposta',EXPLICIT_DISINTEREST:'Desinteresse explícito'};
