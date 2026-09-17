# LeadRescue

Gerenciador de leads imobiliários em construção. Este repositório é a fonte de verdade para código, contratos, decisões e continuidade.

## Estado em 17/09/2026

**Atualização após acesso ao Neon:** o Site de teste está na versão 9, adiante desta cópia de código. O banco registra importação CSV e qualificação manual (migrations 006/007), ausentes no GitHub. Recuperar essas fontes na [issue #5](https://github.com/pchg68/leadrescue/issues/5) antes de novas migrations. Os itens abaixo descrevem o código atualmente versionado, não toda a versão publicada. Veja [reconciliação](docs/MIGRATION-RECONCILIATION.md).

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

1. Fundação/CI #1 integrada à main pelo PR #4, com CI aprovado.
2. [Recuperar código das versões 8/9 #5](https://github.com/pchg68/leadrescue/issues/5) e [reconciliar histórico Prisma/autenticação #2](https://github.com/pchg68/leadrescue/issues/2).
3. [Validar e completar importação CSV #3](https://github.com/pchg68/leadrescue/issues/3) após recuperar a implementação existente.

Cada incremento deve incluir testes, documentação e PR relacionado à issue. Decisões e pendências ficam no GitHub; não é necessário recuperar chats para retomar. O CI não publica automaticamente nem acessa segredos de produção.
