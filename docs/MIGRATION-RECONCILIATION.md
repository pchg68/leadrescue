# Reconciliação do banco com o GitHub

## Estado observado em 17/09/2026

A conexão Neon foi restabelecida. A branch `dev-auth-workspace` contém sete migrations no diário `_leadrescue_migrations`; este checkout contém cinco. Seus hashes 001–005 conferem com o diário após normalização de finais de linha para LF. `_prisma_migrations` não existe. Foram confirmadas 17 tabelas com FORCE RLS e runtime com LOGIN sem SUPERUSER/BYPASSRLS/CREATEROLE/CREATEDB.

Fontes a recuperar antes de aplicar ou baselinar migrations:

| Migration | SHA-256 registrado |
| --- | --- |
| `202609120006_csv_import` | `08837380ab212b8c9204f0c45cc7f2acd9bbda0d55ea970fed1d6bb9e663a7d8` |
| `202609120007_manual_qualification` | `7c62e2d696c451a4d83c2e6c822945963ac5172365f686fc8721f605e5b98391` |

Sites registra a versão 9, commit `7b7bc2186b121b9e5ee1f024ba519c3d5ac6c0c6`, com deployment concluído. O banco contém `leadrescue_import` e `leadrescue_save_manual`. O histórico da tarefa original relata importação limitada a 500 registros e qualificação manual. Isso corrige o diagnóstico inicial baseado na cópia antiga do GitHub; não comprova o fluxo autenticado atual nem o contrato completo de 50 mil linhas. Recuperação: [issue #5](https://github.com/pchg68/leadrescue/issues/5).

## Verificação somente de leitura

Na branch explicitamente selecionada, exportar o resultado desta consulta como array JSON para um arquivo ignorado, por exemplo `.sites-runtime/ledger.json`:

```sql
SELECT name, checksum, method
FROM public._leadrescue_migrations ORDER BY name;
```

```sh
node scripts/verify-migration-ledger.mjs .sites-runtime/ledger.json
```

O comando não se conecta ao banco e não escreve SQL. Retorna código 1 para fontes ausentes, hashes diferentes ou entrada inválida. `pending` indica migrations locais não registradas; não autoriza aplicá-las. Um resultado compatível compara arquivos com o diário, não demonstra equivalência do schema ou autenticidade/frescor do snapshot.

`scripts/migration-ledger.mjs` agora exige esse snapshot, recusa divergência e recusa baseline inicial sem evidência já registrada. Ele apenas gera SQL, não o executa. O operador deve conferir o estado remoto novamente imediatamente antes de qualquer aplicação. Não usar esse gerador para criar `_prisma_migrations` ou como instalador de banco vazio.

## Ordem de continuidade

1. Recuperar fontes/testes das versões 8/9 e conferir os hashes originais. Não reconstruir arquivos originais a partir de hashes ou apenas da definição de funções SQL.
2. Integrar ao GitHub preservando documentação e CI; reexecutar testes.
3. Criar branch Neon isolada, comparar schema real e testar a reconciliação via Prisma Migrate, sem reaplicar SQL já executado.
4. Validar autenticação, perfis e importação com dados sintéticos antes de promover alterações.

O Site permanece ambiente de teste. A direção comercial é aplicação web independente com domínio/login próprios, preservando PostgreSQL e GitHub como base. Provedor definitivo, autenticação, processamento de mensagens e orçamento ainda exigem implementação/validação; não houve migração de hospedagem nesta etapa.
