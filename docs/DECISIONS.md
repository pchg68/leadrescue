# Decisões de arquitetura e continuidade

## ADR-001 — Superfície Sites e contrato PostgreSQL (histórica, 10/09/2026)

A interface inicial usa React/Vinext do Sites. PostgreSQL permanece como banco comercial; D1 não o substitui. Demonstração e operação conectada são superfícies distintas. Origem: docs/STATUS.md, seção ADR-001, preservada como histórico.

## ADR-002 — GitHub como fonte de verdade (17/09/2026)

Código, lockfile, migrations, especificação, decisões, roadmap e evidências de validação ficam versionados. Issues registram trabalho pendente; PRs registram revisão/integração. O histórico de chats não é pré-requisito de continuidade. Segredos e dados pessoais ficam fora do Git. O bundle original e documentos históricos são preservados.

## ADR-003 — Automatizar a fundação antes de persistir CSV (17/09/2026)

Contexto: a importação persistente é a próxima função do handoff, mas CI e reconciliação Prisma ainda estão pendentes. A especificação §§17/19.1 exige validação da fundação.

Decisão: este incremento entrega CI sem segredos remotos, com instalação congelada, lint/typecheck, equivalência dos cinco contratos, comparação canônica Prisma, testes de domínio e isolamento/migrations em PGlite, e build. Todas as pastas de migrations são descobertas em ordem, evitando ignorar migrations futuras.

Consequência: a aplicação não ganha importação persistente neste incremento. PGlite não prova conectividade Neon ou autenticação Sites. Reconciliação do banco, PostgreSQL remoto e E2E seguem na issue #2; CSV segue na #3. Não declarar Sprint 0/piloto encerrados pelo sucesso do CI.

## ADR-004 — Campanha determinística com compliance incorporado (18/09/2026)

Contexto: a proposta mais defensável é recuperar leads imobiliários inativos, não substituir CRM nem oferecer chatbot genérico. Contato automatizado sem proveniência, supressão, retenção e supervisão cria risco técnico, comercial e jurídico.

Decisão:

- campanha é a unidade auditável;
- a máquina de estados e regras controla o fluxo;
- IA atua somente dentro de ferramentas e políticas versionadas;
- avaliação jurídica válida, supressão, retenção, auditoria e handoff são gates técnicos;
- o worker repete verificações críticas antes de enviar;
- estoque estruturado/CRM é a fonte de verdade para atributos objetivos;
- negociação, proposta vinculante, garantia, aconselhamento e situações sensíveis geram handoff;
- multiagente, A2A, memória autoevolutiva e RAG geral ficam fora do MVP.

Consequências:

- a [issue #7](https://github.com/pchg68/leadrescue/issues/7) passa a integrar a sequência do produto;
- WhatsApp e IA em produção dependem dos gates que podem bloquear ações;
- o sistema produz evidências e apoia governança, mas não promete conformidade automática;
- mudanças de política exigem aprovação, nova versão e rollback;
- pilotos devem medir resultado, custo humano, opt-out, incidentes e margem real.

Detalhes: [estratégia](PRODUCT-STRATEGY.md) e [compliance](COMPLIANCE.md).
