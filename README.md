# LeadRescue

Gerenciador de leads imobiliários em construção. Este repositório é a fonte de verdade para código, contratos, decisões e continuidade.

## Estado em 22/09/2026

Integração controlada da V9 concluída neste repositório (sem sobrescrita cega da main): importação CSV persistente, cadastro manual, qualificação comercial editável, API de importação, controle de duplicidades/idempotência, migrations 006/007 e testes correspondentes. Veja [reconciliação](docs/MIGRATION-RECONCILIATION.md).

- Interface conectada com identidade ChatGPT, imobiliárias, memberships e consulta paginada/detalhe de leads.
- Preparação e confirmação de CSV com persistência por lote (até 500 registros), com revisão local e deduplicação por imobiliária.
- Demonstração separada em `/demo`, com dados sintéticos e revisão na sessão.
- Sete migrations PostgreSQL (001–007) e testes de isolamento por organização/perfil, importação e qualificação.
- Fundação de CI integrada; estratégia do produto e LeadRescue Compliance agora estão especificados no GitHub.

O Sprint 0 e o piloto comercial continuam abertos. O handoff registra ativação privada e primeiro acesso; a disponibilidade atual do Site/banco não foi revalidada nesta auditoria. Não há envio automático de mensagens.

## Começar

Node >=22.13.0 e pnpm 11.19.0 (CI: Node 24.16.0):

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run dev
```

Acesse o endereço local informado no terminal; `/demo` não depende do banco. Consulte [setup e todos os checks](docs/SETUP.md) e [.env.example](.env.example). Não inclua segredos ou dados pessoais no Git.

## Mapa do projeto

| Documento | Uso |
| --- | --- |
| [Auditoria](docs/AUDIT-2026-09-17.md) | Baseline, lacunas, stack e evidências |
| [Arquitetura](docs/ARCHITECTURE.md) | Componentes, fluxo e limites |
| [Estratégia do produto](docs/PRODUCT-STRATEGY.md) | Posicionamento, recorte do MVP, métricas e gates |
| [LeadRescue Compliance](docs/COMPLIANCE.md) | Controles jurídicos, supressão, retenção, IA e handoff |
| [Roadmap](docs/ROADMAP.md) | Ordem de continuidade e issues |
| [Decisões](docs/DECISIONS.md) | ADRs e justificativas |
| [Setup](docs/SETUP.md) | Instalação, configuração e testes |
| [Deploy](docs/DEPLOY.md) | Publicação e recuperação |
| [Especificação MVP](docs/LeadRescue-MVP-Build-Specification.md) | Requisitos completos, incluindo escopo futuro |
| [Contratos](contracts/) | Apêndices originais verificáveis |

Histórico preservado: [transferência](MIGRACAO-GITHUB.md), [status anterior](docs/STATUS.md), [Neon](docs/NEON.md), [README original do runtime](docs/RUNTIME-LEGACY.md) e [bundle Git original](archive/leadrescue-sites-history.bundle). Notas históricas não substituem o estado atual acima.

## Próximos passos

1. Fundação/CI #1 integrada à main pelo PR #4, com CI aprovado.
2. [Reconciliar histórico Prisma/autenticação #2](https://github.com/pchg68/leadrescue/issues/2) e validar próximos ajustes de migração sem reaplicar SQL já executado.
3. [Completar evolução da importação CSV #3](https://github.com/pchg68/leadrescue/issues/3) (histórico de lotes na interface, resolução assistida de duplicidades e fluxo assíncrono para grandes volumes).
4. [Implementar LeadRescue Compliance #7](https://github.com/pchg68/leadrescue/issues/7) sobre a base reconciliada, antes de habilitar disparos reais.

Cada incremento deve incluir testes, documentação e PR relacionado à issue. Decisões e pendências ficam no GitHub; não é necessário recuperar chats para retomar. O CI não publica automaticamente nem acessa segredos de produção.
