# LeadRescue — continuidade e transferência para GitHub

Data: 12/09/2026. Código de origem: d5a9986 (8 commits do Sites).
Destino: https://github.com/pchg68/leadrescue (privado).

## Estado atual

- Aplicação privada: https://leadrescue.pc-2ce8.chatgpt.site
- Login ChatGPT e primeiro acesso confirmados pelo proprietário na conversa.
- Cadastro de imobiliária e consulta de leads com permissões por organização/perfil.
- Preparação e revisão de CSV com seleção de 245 países/territórios, normalização e múltiplos telefones.
- Teste de 500 contatos: 424 sem erros, 76 com erros e 26 possíveis duplicidades. Apenas resumo agregado está no código; a planilha pessoal não integra o repositório.
- Importação persistente ainda não implementada no código transferido. Foi solicitada, mas a última alteração salva é a normalização internacional.
- Não há envio automático de mensagens nem piloto comercial concluído.

## Conteúdo transferido

Código completo rastreado, dependências e lockfile, testes, contratos, cinco migrations, documentação técnica e especificação original. O arquivo archive/leadrescue-sites-history.bundle conserva o histórico Git original com seus oito commits; a branch main do GitHub recebe uma cópia consolidada por API. Não representa sincronização automática futura.

Para recuperar o histórico original em outra pasta:

```sh
git clone archive/leadrescue-sites-history.bundle leadrescue-historico
```

## Banco e segredos

O código não contém cópia dos registros do Neon ou senhas. O banco existente deve ser preservado e reconectado, não recriado.
Projeto Neon: sparkling-thunder-81871969. Branch usada pela aplicação: br-purple-wind-aupmizsb (dev-auth-workspace). Banco: neondb. Consulte docs/NEON.md; suas notas antigas de bloqueio são históricas.
O diário aplicado é _leadrescue_migrations, separado de _prisma_migrations. Não reaplicar migrations sem verificar o estado atual.
DATABASE_URL deve usar o papel restrito leadrescue_app; DIRECT_DATABASE_URL é exclusiva de operações administrativas. Consulte .env.example. Valores reais devem permanecer no gerenciador de segredos.
Não foi executado backup dos dados do Neon nesta transferência.

## Retomada na conta Business

1. Conectar GitHub e autorizar pchg68/leadrescue no workspace de destino.
2. Abrir o repositório e ler este documento, a especificação original e docs/STATUS.md.
3. Conectar a conta Neon que possui o projeto acima e verificar acesso à branch existente.
4. Conferir acesso ao Site original e aos seus segredos no destino. A transferência do código não transfere a propriedade do Site, as conversas ou a conta ChatGPT.
5. Validar o login no destino antes de alterar vínculos: a identidade fornecida pelo Sites é específica do Site. Não substituir IDs de usuários nem liberar cabeçalhos de identidade enviados pelo cliente.
6. Retomar a confirmação e gravação dos lotes CSV, com validação no servidor, deduplicação no banco, idempotência, isolamento entre imobiliárias e testes.

A portabilidade automática do Site e das conversas para Business não foi confirmada. Preserve o acesso atual até verificar a retomada. Fora do Sites, o login depende de adaptação a um provedor confiável; copiar o código por si só não ativa a autenticação.

## Execução

Requer Node >=22.13.0 e pnpm 11.19.0. Preservar pnpm-lock.yaml. Configurar o perfil de execução adequado conforme README.md e a habilidade Sites disponível no novo ambiente.
Testes de domínio: node --experimental-strip-types --test tests/engine.test.mjs
Testes de importação: node --experimental-strip-types --test tests/csv.test.mjs tests/phones.test.mjs
Testes backend: node scripts/test-backend.mjs

As notas antigas em README.md e docs/STATUS.md descrevem etapas anteriores. Use as atualizações datadas mais recentes e este documento como guia de continuidade, validando o estado do ambiente antes de modificar o banco.
