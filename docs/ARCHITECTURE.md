# Arquitetura atual

Estado do código auditado em 17/09/2026. A especificação completa descreve também funcionalidades futuras; não equivale ao que está implementado.

## Fluxo implementado

Navegador → páginas React/Vinext → Route Handlers → identidade ChatGPT fornecida pelo dispatcher → consultas HTTP Neon → transação com verificação do papel e membership → PostgreSQL com FORCE RLS.

- `/`: `connected-workspace.tsx`, primeiro acesso, seleção de imobiliária, lista/detalhe.
- `/api/v1/workspaces`: consulta memberships e cria primeira imobiliária por funções SQL restritas.
- `/api/v1/leads` e `/api/v1/leads/[id]`: leitura com tenant validado; corretores limitados aos próprios leads; paginação por UUID.
- `/importar`: preparação local de CSV, mapeamento, normalização internacional e relatório. Não envia lotes ao banco.
- `/demo`: motor determinístico com fixtures sintéticas e revisão apenas na sessão.

## Organização do código

| Caminho | Responsabilidade |
| --- | --- |
| `app/` | Páginas, autenticação e endpoints |
| `components/leadrescue/` | Interface específica do produto |
| `components/ui/`, `vendor/` | Componentes e estilos do starter |
| `lib/leadrescue/` | CSV, telefones, motor e acesso ao banco |
| `contracts/` | Cinco apêndices extraídos da especificação, preservados |
| `prisma/migrations/` | Cinco migrations SQL, incluindo RLS, identidade e workspaces |
| `tests/` | Domínio, CSV, telefones, handlers e PostgreSQL embarcado |
| `scripts/` | Execução, instalação e validação |
| `db/`, `drizzle/`, `examples/d1/` | Estrutura opcional herdada; não é o banco comercial |
| `archive/` | Bundle com histórico original do Sites |

## Contratos de segurança

O runtime usa exclusivamente `leadrescue_app`. O contexto expira no commit/rollback; identidade é resolvida no servidor, nunca concedida por email ou tenant enviado pelo cliente. RLS protege organização; filtros adicionais protegem leads de corretores. Respostas privadas usam `no-store` e erros não expõem SQL/credenciais.

Autenticação de produção depende do dispatcher Sites. Um host alternativo precisa de um provedor confiável e de adaptação explícita; aceitar cabeçalhos públicos como identidade é inseguro. A autenticação simulada portable serve somente ao desenvolvimento em loopback.

## Persistência e limites

Prisma define o contrato e auxilia a validação; o acesso em produção usa SQL parametrizado com `@neondatabase/serverless`. O diário `_leadrescue_migrations` existente é distinto do histórico Prisma. Estado remoto é histórico até ser revalidado na issue #2.

Ainda faltam ingestão/eventos/outbox, importação persistente, jobs, motor completo a partir de eventos, auditoria comercial, backup/restore verificado e aceite do piloto. Testes PGlite não substituem testes do protocolo HTTP Neon, autenticação publicada ou E2E.
