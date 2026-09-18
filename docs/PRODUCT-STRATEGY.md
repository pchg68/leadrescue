# Estratégia de produto e recorte do MVP

Atualizado em 18/09/2026. Este documento registra a direção comercial validada para o LeadRescue e orienta decisões de escopo.

## Tese do produto

O LeadRescue é uma solução especializada em recuperar leads imobiliários inativos por campanhas mensuráveis. Ele complementa o CRM; não pretende substituí-lo nem operar como chatbot imobiliário genérico.

O núcleo deve ser uma máquina de estados e regras de negócio que utiliza IA em tarefas delimitadas. O modelo não controla livremente campanha, cadência, autorização jurídica, disponibilidade de imóveis ou compromissos comerciais.

## Cliente e resultado

Cliente inicial: imobiliárias e equipes de corretores com base histórica não trabalhada.

Resultado vendido:

- base importada e higienizada;
- leads classificados como aptos ou bloqueados;
- campanha documentada;
- respostas, reativações, qualificações e handoffs mensurados;
- relatório operacional e jurídico ao final.

O piloto deve validar disposição de pagamento, taxa de reativação, carga operacional e custo por lead antes de escalar automações ou planos.

## Escopo do MVP

1. Importação CSV, antes de múltiplos conectores.
2. Um controlador e isolamento multi-tenant comprovado.
3. Campanha como entidade versionada e auditável.
4. Máquina de estados persistente.
5. Integração oficial com WhatsApp.
6. Ferramentas limitadas para consultar dados estruturados.
7. Opt-out e lista de supressão.
8. Handoff obrigatório para corretor humano.
9. Painel operacional e métricas por campanha.
10. LeadRescue Compliance conforme [COMPLIANCE.md](COMPLIANCE.md).

O estoque deve ser consultado em fonte estruturada ou no CRM. RAG pode auxiliar manuais e conteúdo não estruturado, mas não é a fonte de verdade para preço, disponibilidade, localização, quantidade de quartos ou situação do imóvel.

## Fora do MVP

- substituição integral do CRM;
- arquitetura multiagente;
- protocolo A2A;
- memória autoevolutiva;
- agentes autônomos sem supervisão;
- RAG vetorial para toda a base;
- BYOK obrigatório;
- negociação ou intermediação pelo agente;
- promessa de disponibilidade ou fechamento automatizado.

Itens fora do MVP exigem evidência de necessidade obtida nos pilotos e ADR próprio.

## Estados mínimos

`imported -> legal_review -> eligible | blocked -> queued -> contacted -> replied -> qualified | nurture | opted_out | closed`

Transições relevantes devem registrar ator, horário, política aplicada, motivo e versão. Timers precisam ser persistentes e idempotentes.

## Métricas do piloto

- leads importados, aptos e bloqueados;
- entregabilidade;
- respostas;
- opt-outs e reclamações;
- leads reativados;
- leads qualificados;
- handoffs e visitas agendadas;
- tempo humano por campanha;
- custo de mensageria, IA e suporte;
- receita e margem bruta por campanha.

“Lead reativado” e “lead qualificado” devem possuir definições estáveis e auditáveis antes do piloto.

## Modelo comercial a validar

Começar como serviço assistido: taxa de configuração/campanha, piso mensal quando recorrente e componente variável baseado em evento claramente definido. Não assumir margem de 60% até medir onboarding, suporte, aquisição, impostos, BSP, conectores, incidentes e revisão humana.

## Gates de produto

Uma campanha somente pode sair de rascunho quando:

- fonte e finalidade dos dados estiverem registradas;
- avaliação jurídica resultar em autorização válida;
- template e identidade do controlador estiverem aprovados;
- audiência for deduplicada contra a lista de supressão;
- cadência, janela de envio e limites estiverem configurados;
- handoff e responsável humano estiverem definidos;
- métricas e retenção estiverem configuradas.

## Ordem de implementação

A recuperação das versões 8/9 e a reconciliação do banco precedem novas migrations. Depois da fundação, implementar importação persistente e, sobre ela, os controles da [issue #7](https://github.com/pchg68/leadrescue/issues/7). WhatsApp e IA só entram quando autorização, estados, idempotência, supressão e auditoria já puderem impedir ações indevidas.
