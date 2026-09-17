# LeadRescue

Gerenciador de leads imobiliários em construção. Este repositório é a fonte de verdade para código, contratos, decisões e continuidade.

## Estado em 17/09/2026

- Interface conectada com identidade ChatGPT, imobiliárias, memberships e consulta paginada/detalhe de leads.
- Preparação de CSV no navegador: mapeamento, revisão, múltiplos telefones internacionais e relatório. **Ainda não grava lotes ou leads.**
- Demonstração separada em `/demo`, com dados sintéticos e revisão na sessão.
- Cinco migrations PostgreSQL e testes de isolamento por organização/perfil.
- Incremento atual: CI e documentação de continuidade, rastreados na [issue #1](https://github.com/pchg68/leadrescue/issues/1).

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
| [Roadmap](docs/ROADMAP.md) | Ordem de continuidade e issues |
| [Decisões](docs/DECISIONS.md) | ADRs e justificativas |
| [Setup](docs/SETUP.md) | Instalação, configuração e testes |
| [Deploy](docs/DEPLOY.md) | Publicação e recuperação |
| [Especificação MVP](docs/LeadRescue-MVP-Build-Specification.md) | Requisitos completos, incluindo escopo futuro |
| [Contratos](contracts/) | Apêndices originais verificáveis |

Histórico preservado: [transferência](MIGRACAO-GITHUB.md), [status anterior](docs/STATUS.md), [Neon](docs/NEON.md), [README original do runtime](docs/RUNTIME-LEGACY.md) e [bundle Git original](archive/leadrescue-sites-history.bundle). Notas históricas não substituem o estado atual acima.

## Próximos passos

1. Integrar e acompanhar a [fundação/CI #1](https://github.com/pchg68/leadrescue/issues/1).
2. [Reconciliar histórico Prisma e revalidar autenticação #2](https://github.com/pchg68/leadrescue/issues/2).
3. [Importação persistente de CSV #3](https://github.com/pchg68/leadrescue/issues/3), com validação no servidor, idempotência, deduplicação e isolamento.

Cada incremento deve incluir testes, documentação e PR relacionado à issue. Decisões e pendências ficam no GitHub; não é necessário recuperar chats para retomar. O CI não publica automaticamente nem acessa segredos de produção.
