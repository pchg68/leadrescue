# Setup e validação

## Clone limpo

Requer Git, Node >=22.13.0 (CI usa 24.16.0) e pnpm 11.19.0. Execute na raiz do clone:

```sh
npm install --global pnpm@11.19.0
pnpm install --frozen-lockfile
pnpm run test:contracts
pnpm exec prisma validate
pnpm run test:schema
pnpm test
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run dev
```

O lockfile é `pnpm-lock.yaml`; não usar `npm ci`, não gerar package-lock. `pnpm run install:ci` equivale à instalação congelada e funciona sem Bash. Preservar as políticas de supply chain e os scripts permitidos em `pnpm-workspace.yaml`. O primeiro download requer rede, inclusive engines Prisma.

Um clone limpo assume o perfil portable, sem depender de arquivos do plugin. Desenvolvimento inicia em loopback na porta 5173; o terminal informa o endereço. `/demo` usa dados sintéticos. O login simulado portable não conecta automaticamente uma conta ao Neon.

## Configuração

Use `.env.example` como lista de variáveis, sem versionar valores. `ENABLE_COMMERCIAL_API=false` é o padrão seguro para executar testes e demo. Para operação conectada, configurar `DATABASE_URL` do papel restrito `leadrescue_app` no ambiente do servidor e ativar a flag após verificar banco e memberships. `DIRECT_DATABASE_URL` é exclusiva de operações administrativas. Os comandos de teste não precisam dessas credenciais nem de acesso ao banco real.

As cinco migrations são aplicadas a um banco PGlite novo em cada execução de backend. Não executar bootstrap ou SQL inicial no banco remoto existente como parte do setup local.

## O que os checks comprovam

| Comando | Evidência |
| --- | --- |
| `test:contracts` | Cinco arquivos correspondem aos apêndices, sem reescrita |
| `test:schema` | Catálogos da migration inicial + alinhamento 004 equivalem ao Prisma; não compara todas as funções/RLS |
| `test` | Domínio/CSV/telefones, check de drift, handlers e migrations/RLS em banco sintético |
| `typecheck`, `lint` | Verificações estáticas |
| `build` | Artefato de produção compilável; não publica |

CI executa esses gates em PRs e pushes para main. E2E no Site, conexão HTTP Neon, histórico Prisma remoto e backup/restore são pendências explícitas.
