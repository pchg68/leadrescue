# LeadRescue Compliance

Atualizado em 18/09/2026. Requisitos de produto para incorporar governança jurídica às campanhas de recuperação de leads imobiliários.

Este módulo fornece controles, evidências e fluxos de aprovação. Ele não garante conformidade automática, não substitui análise jurídica do caso concreto e não transforma uma base legal indicada pelo cliente em autorização presumida.

## Princípios

- proteção de dados e supervisão humana por padrão;
- decisão jurídica antes do disparo;
- minimização de dados enviados ao modelo;
- bloqueio seguro quando faltarem evidências;
- versionamento de políticas, decisões e conteúdos;
- isolamento por controlador/tenant;
- rastreabilidade sem reter dados excessivos;
- IA limitada à triagem e comunicação autorizada.

## 1. Registro de origem e finalidade

Cada lead deve estar vinculado a um controlador e registrar, quando aplicável:

- campanha ou empreendimento de origem;
- data e canal da coleta;
- finalidade original;
- aviso/política vigente na coleta;
- base legal indicada e sua justificativa;
- evidência de consentimento, quando aplicável;
- data da última interação;
- oposição, opt-out ou restrição anterior;
- decisão de elegibilidade para reativação.

Campos jurídicos mínimos ausentes impedem `queued` e `contacted`.

## 2. Avaliação de legítimo interesse

Quando essa hipótese for indicada, a campanha deve possuir avaliação versionada contendo:

1. finalidade específica;
2. interesse ou benefício legítimo;
3. expectativa razoável do titular;
4. compatibilidade com a coleta original;
5. tempo transcorrido;
6. natureza e necessidade dos dados;
7. impacto potencial;
8. volume e frequência de contatos;
9. salvaguardas;
10. oposição facilitada;
11. conclusão e responsável pela aprovação.

Estados da avaliação:

- `draft`;
- `approved`;
- `approved_with_restrictions`;
- `rejected`;
- `expired`.

A campanha só pode ser ativada com decisão aprovada e não expirada. A aprovação com restrições deve ser traduzida em parâmetros técnicos, não apenas texto.

## 3. Supressão e opt-out

A lista de supressão deve prevalecer sobre importações e campanhas:

- escopo por controlador;
- normalização e hash do identificador quando adequado;
- data, canal e origem da oposição;
- motivo padronizado;
- bloqueio antes de enfileirar e novamente antes de enviar;
- reversão somente após nova manifestação documentada do titular;
- ator, justificativa e trilha de auditoria da reversão.

O registro mínimo necessário para impedir novo contato não deve ser apagado pelo mesmo expurgo aplicado à conversa.

## 4. Retenção e minimização

Prazos devem ser configuráveis por finalidade e categoria:

| Categoria | Regra |
| --- | --- |
| Conversa completa | Prazo limitado e configurável |
| Resumo e resultado | Retenção contratual definida |
| CPF e documentos | Fora do fluxo de qualificação e da inferência |
| Dados financeiros sensíveis | Não enviar ao modelo |
| Opt-out | Registro mínimo preservado na supressão |
| Logs técnicos | Retenção curta e pseudonimização |
| Métricas | Preservação somente quando efetivamente agregadas/anonimizadas |

Expurgos automáticos devem gerar evento auditável com escopo, contagem, horário e política aplicada, sem reproduzir o dado eliminado.

## 5. Transparência e governança da IA

A primeira mensagem deve identificar:

- que o atendimento é automatizado;
- a imobiliária/controlador responsável;
- o motivo do contato;
- como falar com uma pessoa;
- como impedir novas mensagens;
- onde consultar o aviso de privacidade.

Registrar por interação:

- modelo/provedor;
- versão da política e do prompt;
- ferramentas consultadas;
- dados/categorias usados no score;
- justificativa resumida da qualificação;
- intervenção e aprovação humana;
- resultado e transição de estado.

Prompts e políticas são artefatos versionados. Alteração sugerida pela IA exige revisão humana, aprovação e possibilidade de rollback.

## 6. Fornecedores e transferências

Manter inventário com fornecedor, função, categorias tratadas, país/região, suboperadores, retenção, uso para treinamento, contrato aplicável e mecanismo de transferência. A aplicação deve permitir configuração que minimize conteúdo e pseudonimize dados antes da inferência.

Nenhum segredo, documento pessoal ou base de leads é versionado no GitHub.

## 7. Triagem versus intermediação

O agente pode:

- confirmar interesse;
- coletar preferências;
- consultar imóveis cadastrados;
- apresentar opções por filtros objetivos;
- organizar informações;
- agendar ou encaminhar contato.

O agente deve bloquear e realizar handoff quando houver:

- negociação de preço ou condição;
- proposta vinculante;
- compromisso em nome da imobiliária;
- garantia de disponibilidade;
- recomendação jurídica ou de investimento;
- análise financeira sensível;
- pedido de tratamento excepcional;
- conflito, reclamação relevante ou dúvida sobre autorização do contato.

A ferramenta de estoque precisa declarar dados e horário da última atualização. A resposta não pode converter dado desatualizado em garantia.

## 8. Modelo mínimo de dados

Entidades ou equivalentes:

- `LegalAssessment`;
- `CampaignPolicyVersion`;
- `LeadProvenance`;
- `SuppressionEntry`;
- `RetentionPolicy`;
- `ProcessingVendor`;
- `AIInteractionTrace`;
- `HumanHandoff`;
- `ComplianceReport`;
- `AuditEvent`.

Toda entidade de negócio deve possuir `organization_id` ou chave equivalente e proteção multi-tenant no banco e na aplicação.

## 9. Gate de ativação

`activateCampaign` deve falhar de forma fechada se qualquer condição for falsa:

- avaliação válida;
- finalidade e controlador definidos;
- template aprovado;
- política ativa;
- audiência deduplicada e checada contra supressão;
- retenção definida;
- responsável por handoff definido;
- canal oficial configurado;
- versões de política/prompts fixadas;
- auditoria disponível.

O worker de envio repete os checks críticos imediatamente antes do envio para cobrir alterações posteriores ao enfileiramento.

## 10. Relatório por campanha

O relatório deve incluir escopo, versões, avaliação aplicada, universo importado, aptos, bloqueados, supressões, mensagens, respostas, handoffs, incidentes, expurgos e métricas. Deve distinguir evidência técnica de conclusão jurídica e registrar aprovações humanas.

## 11. Segurança e testes

Testes mínimos:

- isolamento entre organizações;
- bloqueio sem avaliação;
- restrições convertidas em parâmetros;
- opt-out entre campanhas do mesmo controlador;
- corrida entre fila e opt-out;
- idempotência de envio;
- expurgo e preservação mínima da supressão;
- handoff para intenções proibidas;
- versionamento e rollback de políticas;
- relatório sem exposição desnecessária de dados.

Implementação rastreada na [issue #7](https://github.com/pchg68/leadrescue/issues/7). Referências normativas específicas devem ser revisadas e atualizadas antes do uso comercial.
