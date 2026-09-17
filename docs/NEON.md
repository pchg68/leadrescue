> Documento histórico preservado. Para estado atual, consulte [README](../README.md), [roadmap](ROADMAP.md) e [auditoria](AUDIT-2026-09-17.md). Notas abaixo podem se contradizer por descreverem etapas diferentes.

# Ambiente de desenvolvimento — 11/09/2026

Atualização de ativação (20:18 UTC): branch `br-purple-wind-aupmizsb` agora contém migration 005 e diário de cinco migrations com checksums. Runtime leadrescue_app habilitado para LOGIN; segredo configurado no Sites, sem credencial administrativa no runtime. Versão 4 publicada usando essa branch. Não resetar/excluir a branch: passou a atender a aplicação privada. As notas de bloqueio abaixo são histórico.

Branch mais recente: `dev-auth-workspace` (`br-purple-wind-aupmizsb`), criada de `br-damp-silence-au750k1b`. A tentativa de aplicar migration 005 e diário SQL foi rejeitada por limite de uso na revisão automática. Tratar a branch como contendo somente o estado herdado até 004; verificar antes de retomar. Login runtime e segredos do Site não foram configurados. Migração 005 e interface correspondentes foram testadas somente localmente.

## Branch de validação Prisma

Nova branch `dev-prisma-validation`, ID `br-damp-silence-au750k1b`, filha de `br-still-bread-aup8nltp`. É a branch mais recente para retomada. Recebeu somente a migration `202609110004_prisma_alignment`, que remove NOT NULL de ApiKey.scopes para reproduzir o SQL canônico do Prisma. Nenhum registro removido.

Após autorização dos scripts pelo usuário, Prisma 7.10.0 validou o schema. A comparação reproduzível `node scripts/verify-prisma-schema.mjs` confirmou 324 entradas de catálogo iguais após a correção. O catálogo da nova branch Neon também foi comparado: todas as 324 entradas esperadas presentes e iguais, mais quatro índices das constraints complementares. Ainda não foi criado `_prisma_migrations`; reconciliar com Prisma Migrate antes da ativação. A branch original continua intacta. As pendências de instalação e comparação registradas abaixo são histórico e foram resolvidas.

| Recurso | Identificador |
| --- | --- |
| Organização | org-cool-mud-68674769 |
| Projeto LeadRescue | sparkling-thunder-81871969 |
| Branch de desenvolvimento | br-still-bread-aup8nltp (`dev-foundation`) |
| Branch principal preservada | br-morning-cloud-aukavmwa (`main`) |
| Banco | neondb |
| PostgreSQL observado | 18.6 |

Aplicados em uma transação, via conector Neon, exclusivamente na branch de desenvolvimento:

1. `prisma/bootstrap-roles.sql`.
2. `prisma/migrations/202609100001_initial/migration.sql`.
3. `prisma/migrations/202609100002_constraints/migration.sql`.
4. `prisma/migrations/202609100003_identity/migration.sql`.

Cada arquivo foi encapsulado em um bloco DO para executar como uma instrução. Não foi usado Prisma Migrate e não existe histórico `_prisma_migrations`. Não reaplicar estes arquivos neste banco. Antes de promover, verificar schema contra Prisma em branch nova e reconciliar o histórico de forma explícita. O materializador inicial é provisório e não substitui essa comparação.

Seed sintético: `tests/fixtures/database-seed.mjs`, aplicado uma vez em transação. Nenhum dado de cliente real. `tests/neon-foundation.sql` passou em transação precedida de `SET LOCAL ROLE leadrescue_app`; verifica isolamento de gestores, corretores, ausência de vínculo e negação de acesso cruzado/inativo. Inspeção confirmou 19 tabelas, 17 com FORCE RLS, duas organizações, quatro leads e zero memberships de papéis para leadrescue_app.

`leadrescue_app` e `leadrescue_identity` continuam NOLOGIN. Somente o operador recebeu SET membership nesses papéis para instalar/testar; o runtime nunca pode receber membership no papel identity. Senhas não foram criadas ou gravadas. A aplicação verifica seu papel antes de cada consulta.

Para ativar o runtime após os gates: provisionar login não administrativo para leadrescue_app, configurar DATABASE_URL como segredo no Sites, vincular o subject ChatGPT verificado a uma membership ativa e então ativar ENABLE_COMMERCIAL_API. Nunca usar neondb_owner na aplicação. DIRECT_DATABASE_URL pertence somente ao operador local/CI.

Pendências: diff Prisma, histórico de migrations, CI, teste HTTP com autenticação real e integração da interface. Não representa liberação de piloto comercial.
