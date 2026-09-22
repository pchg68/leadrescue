> Documento histórico preservado. Para estado atual, consulte [README](../README.md), [roadmap](ROADMAP.md) e [auditoria](AUDIT-2026-09-17.md). Notas abaixo podem se contradizer por descreverem etapas diferentes.

# Integração controlada da V9 no GitHub — 22/09/2026

- Integração manual concluída sem sobrescrever a main: importação CSV persistente, cadastro manual, qualificação comercial editável, API de importação e idempotência/duplicidade.
- Migrations adicionadas ao repositório: `202609120006_csv_import` (`f456bc5009af91824ee614130b9b859545d9555dc20899e69b13e9127d1ae0dd`) e `202609120007_manual_qualification` (`e8fe90d26708cce446544526b5fba607676b121ba06c1fe613f7b05f4488127b`).
- Estado esperado do diário `_leadrescue_migrations`: entradas `001`–`007` com checksums correspondentes; nenhuma migration foi aplicada automaticamente em banco real por esta integração.
- A suíte integrada (main + V9) e o build de produção foram validados neste branch.
- Pendências de compliance/LGPD registradas em TODO de código:
  - `lead.created` ainda replica e-mail/telefone em histórico append-only, exigindo estratégia de minimização/expurgo.
  - há prazo de retenção para lotes de importação, mas sem processo automático de expurgo.

# LeadRescue — continuação em 12/09/2026

## Telefones internacionais e múltiplos

Janela pesquisável com 245 países/territórios, país padrão explicitamente escolhido, formato E.164 com metadados estritos libphonenumber-js 1.13.12. Telefones completos separados por barra, ponto e vírgula, vírgula, barra vertical, quebra de linha ou “e”; ramais preservados, sem inferir DDD ou nono dígito. Prévia e relatório de todos os números, erros individuais e duplicatas após normalização. Continua sendo preparação local, sem persistência de leads.

Mesmo teste dos 500, com BR selecionado: 424 sem erros, 76 com erros, 26 possíveis duplicidades, 18 células com múltiplos telefones, 388 números válidos e 76 inválidos. 54 registros sem telefone; 500 sem data original. Dashboard atualizado com este resumo estático. Onze testes CSV/telefone cobrem múltiplos países, listas parcialmente inválidas, ramais, duplicatas normalizadas e limites. Dados pessoais não incorporados ao Site.

## Teste de 500 contatos no dashboard

Baseline anterior à normalização: primeiros 500 registros (linhas 2–501) da aba Contatos únicos de listas_de_email_organizadas(1).xlsx; 79 sem erros, 421 com erro de telefone, zero duplicidades detectadas, 500 sem data original. Zero leads gravados. Resultado novo acima substitui o baseline no dashboard.

## Revisão de CSV — etapa de preparação

Nova rota autenticada `/importar`, acessível por “Preparar CSV de leads”. Leitura local UTF-8 incremental, vírgula/ponto e vírgula, prévia de 20 registros, mapeamento de seis campos de identificação/data, revisão de todas as linhas, avisos de duplicidades internas e relatório CSV sanitizado. Exemplo fictício incluído na própria tela. Limites: 20 MiB, 50 mil registros, 100 colunas, 16 KiB/célula.

Sete testes passaram, incluindo 50 mil registros, Unicode e aspas divididos em chunks, encoding inválido, datas impossíveis e fórmulas em exportação. Typecheck e build verificados nesta entrega.

Escopo explícito: preparação no navegador, sem upload privado, job, persistência de lote, comparação com o banco ou commit de leads. Datas nesta etapa exigem ISO com horário/fuso; campos adicionais e formatos locais continuam pendentes. A importação completa da seção 6 ainda não está concluída. Nenhuma modificação de dados do Neon nesta etapa. GitHub adiado a pedido do usuário.

## Ativação concluída — 11/09/2026 20:18 UTC

Limite da verificação: requisições automatizadas ao Site publicado retornaram 401 na proteção de acesso. Não foi confirmado o fluxo completo com sessão ChatGPT do usuário; requer seu primeiro acesso. O teste HTTP direto ao Neon passou, e a publicação foi confirmada pelo provedor.

O bloqueio anterior foi superado após retomada autorizada. Migration 005 e diário `_leadrescue_migrations` aplicados atomicamente na branch `br-purple-wind-aupmizsb`: 001–004 como baseline verificada, 005 como SQL aplicado, com checksums. Não equivale a histórico Prisma Migrate.

Papel `leadrescue_app` habilitado para LOGIN com senha aleatória armazenada somente como segredo no Sites. A conexão HTTP real autenticada com esse papel passou na verificação de privilégios e listagem de membership sintética. DATABASE_URL e ENABLE_COMMERCIAL_API configurados, revisão de ambiente 1.

Versão 4 publicada privadamente com sucesso: deployment `appgdep_6aa461f2f8208191b51820009ac52d27`, URL https://leadrescue.pc-2ce8.chatgpt.site. Primeiro cadastro da imobiliária deve ser feito pelo usuário autenticado; nenhum vínculo real foi criado automaticamente. Importação de leads permanece pendente. Notas anteriores de bloqueio são históricas.

## Interface autenticada — preparada, ativação bloqueada

- Tela principal preparada para login ChatGPT, criação da primeira imobiliária, seleção de memberships ativas, lista paginada e detalhe de leads via API. Demonstração preservada em `/demo`.
- Nova migration 005 cria funções restritas de listagem e primeiro acesso. Repetir criação não duplica organização nem eleva perfil de um corretor; vínculo inativo não recupera acesso. Validada localmente com 29 testes passando, incluindo os anteriores.
- Branch criada para esta etapa: `dev-auth-workspace` (`br-purple-wind-aupmizsb`), filha de `dev-prisma-validation`. A migration 005 NÃO foi aplicada no Neon.
- A atualização por conector, incluindo diário de checksums, foi rejeitada pela revisão automática por limite de uso da sessão. Não foi executada por outra via após a rejeição. Prisma resolve havia falhado antes com erro genérico de schema engine, tanto na conexão pooled quanto direta; nenhum sucesso de baseline Prisma foi confirmado.
- `scripts/migration-ledger.mjs` é uma proposta de diário SQL separado, NÃO é `_prisma_migrations` e NÃO foi aplicado. Não executar sem conferir previamente a baseline da branch; preferir concluir Prisma resolve em ambiente com conexão disponível.
- Nenhuma credencial runtime configurada; API permanece desativada por padrão. Fluxo HTTP com login real e Neon, publicação e primeiro acesso do usuário ainda pendentes. A integração não está operacional no endereço publicado.

Retomada: verificar liberação do limite, inspecionar estado da branch, concluir histórico, aplicar migration 005, provisionar leadrescue_app com LOGIN sem privilégios administrativos, configurar segredo no Site e validar autenticação completa antes de publicar. Não reutilizar credencial de neondb_owner no runtime.

## Prisma autorizado e verificado — atualização final

Usuário autorizou os scripts de `prisma` e `@prisma/engines`. Ambos executados com sucesso; `prisma validate` passou. A consulta opcional de atualização foi desativada para permitir validação local sem acesso de telemetria.

`scripts/verify-prisma-schema.mjs` gera SQL canônico com Prisma 7.10.0 e compara catálogos PostgreSQL. Detectou uma divergência: String[] permite array SQL nulo, enquanto o materializador inicial criou `ApiKey.scopes NOT NULL`. A nova migration `202609110004_prisma_alignment` corrige isso sem reescrever migrations anteriores. Autenticação futura por API key deve negar permissões quando scopes for NULL ou vazio.

Comparação após correção: 324 elementos coincidentes (colunas, índices e enums), tanto em PostgreSQL local quanto no Neon `dev-prisma-validation`. Os quatro índices extras do Neon pertencem às constraints complementares. Histórico Prisma Migrate, CI e autenticação integrada ao Site continuam pendentes. As notas anteriores sobre bloqueio dos scripts/diff pendente ficam superadas por esta atualização.

## Fundação PostgreSQL — atualização mais recente

- Projeto Neon LeadRescue criado; banco PostgreSQL 18.6 em branch isolada `dev-foundation`. Identificadores e retomada em `docs/NEON.md`.
- Instaladas 19 tabelas, constraints do contrato e RLS obrigatório nas 17 tabelas comerciais; duas organizações e quatro leads fictícios.
- Papel da aplicação sem privilégios administrativos, sem propriedade de tabelas e sem associação a outros papéis. Identidade usa função restrita e membership ativa.
- Rotas GET `/api/v1/leads` e `/api/v1/leads/[id]` implementadas, com identidade do servidor ChatGPT, tenant validado, autorização transacional, paginação e erros sem detalhes internos.
- 27 testes locais de API/PostgreSQL passaram; verificações de escopo em `tests/neon-foundation.sql` passaram no Neon sob `leadrescue_app`. Build do Site passou.
- Nenhuma credencial de banco foi configurada no Site. API comercial desativada por padrão; interface ainda usa demonstração. Login real → membership → banco no ambiente publicado ainda não foi validado.
- Prisma 7.10.0: instalação bloqueou scripts de `prisma` e `@prisma/engines` pela política `strictDepBuilds` do pnpm. Nenhum script bloqueado foi executado. SQL inicial foi materializado por parser restrito; comparação canônica com Prisma e registro via Prisma Migrate continuam pendentes. Não promover esta branch a produção antes desse gate.

Próxima ação: concluir instalação autorizada do Prisma, verificar o diff do schema, reconciliar histórico de migrations em nova branch de validação e configurar credencial runtime e identidade real antes da importação CSV. Sprint 0 ainda aberto.

## Histórico da demonstração (10/09/2026)

## Entregue nesta etapa

- Cinco contratos extraídos sem alterações dos apêndices A–E do documento fornecido.
- Demonstração privada em React/TypeScript com dez cenários numéricos sintéticos.
- Cálculos LS/RR/PS/RP, fronteiras, proteção de contato e elegibilidade com contexto explícito de demonstração.
- Fila, busca/filtro, detalhe do cálculo, radar e exportação CSV dos cenários exibidos.
- Revisão humana simulada: PENDING → ACCEPTED → EXECUTED; dispensa com motivo. Memória da sessão, sem persistência.
- Testes automatizados de componentes, gates e transições. Não substituem os 48 testes de integração/aceite.

## Decisão de arquitetura ADR-001 (estado da entrega inicial)

A demonstração usa o starter React/Vinext do Sites para uma publicação privada acessível. É uma superfície de validação separada do backend comercial. Os contratos PostgreSQL/Prisma foram preservados: D1 não substitui o PostgreSQL, nenhuma migration foi aplicada e não existe banco de leads neste build. Não existem rotas de ingestão ou adaptadores de envio.

Os cenários da UI derivam dos componentes do Apêndice E e recebem nomes e contexto de demonstração; não são eventos reais nem reproduções de conversas. Cobertura 1 ou 2/6 é uma entrada sintética. A decisão demonstrada é um subconjunto do motor futuro e não faz extração de features a partir de eventos. Uma revisão não recalcula scores nem cria resultados de venda. Os números são fixtures, não eficácia medida.

## Plano original de encerramento do Sprint 0

1. Disponibilizar PostgreSQL de desenvolvimento e provedor de autenticação nos ambientes corretos.
2. Fixar versão Prisma compatível, gerar migration inicial a partir do schema e aplicar SQL complementar em banco vazio.
3. Seed de duas organizações; provar RLS, FKs compostas e restrições com runtime sem privilégios administrativos.
4. Instalar CI para migrations, auth e contratos; só então iniciar API/eventos/outbox do Sprint 1.

Sprint 0 permanece aberto. Calendário útil e SLA ainda não implementados. Importação CSV real, armazenamento privado, autenticação multiempresa, idempotência, replay, jobs, auditoria histórica, privacidade, backup, carga e IA continuam pendentes. O piloto comercial não está liberado.

## Verificação e limites

Resultado em 10/09/2026: 28 testes de domínio passaram; typecheck TypeScript passou sem erros; build de produção concluído com sucesso.

Executar `node --experimental-strip-types --test tests/engine.test.mjs`, typecheck TypeScript e build do Sites. Nenhum dado real foi usado. Não foram solicitados testes em navegador; validação visual e integração WebMCP em contexto suportado não realizadas. A integração opcional WebMCP apenas lista e abre cenários, sem aceitar ou executar recomendações.
