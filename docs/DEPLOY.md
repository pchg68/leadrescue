# Operação e deploy

## Destino existente

O handoff registra o Site privado `https://leadrescue.pc-2ce8.chatgpt.site` e a branch Neon `dev-auth-workspace` (`br-purple-wind-aupmizsb`), projeto `sparkling-thunder-81871969`. Esses registros não foram revalidados no ambiente remoto nesta auditoria. O código e o Site não se sincronizam automaticamente.

## Procedimento

1. Escolher commit revisado no GitHub com CI aprovado. Verificar acesso ao Site existente e ao banco antes da publicação; não criar substitutos automaticamente.
2. Confirmar em leitura schema, diário de checksums e memberships. Para mudanças de banco, usar branch isolada e plano de roll-forward; resolver issue #2 antes de tratar Prisma Migrate como fonte operacional.
3. Configurar segredos no provedor: `DATABASE_URL` com `leadrescue_app` e flag comercial somente quando validada. Credencial owner nunca entra no runtime. Preservar a identidade específica do Site.
4. Gerar `pnpm run build`. Para publicar no Sites, usar o fluxo do provedor sobre esse mesmo código, preservando audiência privada e o Site existente. `pnpm start` apenas executa o Worker local; não publica.
5. Validar login, primeiro acesso, memberships, listagem/detalhe, 401 sem sessão e negação de acesso cruzado/inativo. Registrar commit, versão/deployment, data, verificações e resultado em issue/PR, sem segredos/PII.
6. Em falha de aplicação, republicar versão previamente validada. Não executar downgrade destrutivo automático; mudanças de dados exigem roll-forward ou restore previamente testado.

## Limites atuais

Não há deploy automático neste workflow, nem backup verificado ou piloto liberado. Fora do Sites, adaptar autenticação para um provedor confiável e bloquear cabeçalhos de identidade forjados. Ver [arquitetura](ARCHITECTURE.md), [roadmap](ROADMAP.md) e [registro Neon histórico](NEON.md).
