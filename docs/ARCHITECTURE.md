# Arquitetura atual

Atualizado em 08/10/2026 com base na main integrada em 22/09/2026. A validação remota do banco e da autenticação permanece pendente. A especificação completa descreve também funcionalidades futuras; não equivale ao que está implementado.

## Fluxo implementado

Navegador → páginas React/Vinext → Route Handlers → identidade ChatGPT fornecida pelo dispatcher → consultas HTTP Neon → transação com verificação do papel e membership → PostgreSQL com FORCE RLS.

- `/`: `connected-workspace.tsx`, primeiro acesso, seleção de imobiliária, lista/detalhe.
- `/api/v1/workspaces`: consulta memberships e cria primeira imobiliária por funções SQL restritas.
- `/api/v1/leads` e `/api/v1/leads/[id]`: leitura com tenant validado; corretores limitados aos próprios leads; paginação por UUID.
- `/importar`: preparação local, mapeamento, normalização internacional e confirmação de importação persistente por `/api/v1/imports`, limitada a 500 registros e 2 MiB por requisição.
- `POST /api/v1/leads` e `PATCH /api/v1/leads/[id]`: cadastro manual e qualificação, com idempotência, controle de versão e conflitos. Salvar não libera contato nem calcula automaticamente a prioridade.
- `/demo`: motor determinístico com fixtures sintéticas e revisão apenas na sessão.

## Organização do código

| Caminho | Responsabilidade |
| --- | --- |
| `app/` | Páginas, autenticação e endpoints |
| `components/leadrescue/` | Interface específica do produto |
| `components/ui/`, `vendor/` | Componentes e estilos do starter |
| `lib/leadrescue/` | CSV, telefones, motor e acesso ao banco |
| `contracts/` | Cinco apêndices extraídos da especificação, preservados |
| `prisma/migrations/` | Sete migrations SQL, incluindo RLS, identidade, workspaces, CSV e qualificação manual |
| `tests/` | Domínio, CSV, telefones, handlers e PostgreSQL embarcado |
| `scripts/` | Execução, instalação e validação |
| `db/`, `drizzle/`, `examples/d1/` | Estrutura opcional herdada; não é o banco comercial |
| `archive/` | Bundle com histórico original do Sites |

## Contratos de segurança

O runtime usa exclusivamente `leadrescue_app`. O contexto expira no commit/rollback; identidade é resolvida no servidor, nunca concedida por email ou tenant enviado pelo cliente. RLS protege organização; filtros adicionais protegem leads de corretores. Respostas privadas usam `no-store` e erros não expõem SQL/credenciais.

Autenticação de produção depende do dispatcher Sites. Um host alternativo precisa de um provedor confiável e de adaptação explícita; aceitar cabeçalhos públicos como identidade é inseguro. A autenticação simulada portable serve somente ao desenvolvimento em loopback.

## Persistência e limites

Prisma define o contrato e auxilia a validação; o acesso em produção usa SQL parametrizado com `@neondatabase/serverless`. O diário `_leadrescue_migrations` existente é distinto do histórico Prisma. Estado remoto é histórico até ser revalidado na issue #2.

CSV e cadastro manual já persistem leads e eventos. Ainda faltam processamento/outbox operacional, jobs, motor completo a partir de eventos, controles completos de campanha/compliance, backup/restore verificado e aceite do piloto. Os hashes locais de 006/007 divergem dos registros históricos do banco; conferir diário atual e SQL original antes de qualquer reconciliação. Testes PGlite não substituem testes do protocolo HTTP Neon, autenticação publicada ou E2E.
