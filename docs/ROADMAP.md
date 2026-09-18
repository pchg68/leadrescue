# Roadmap e continuidade

Atualizado em 18/09/2026. O GitHub concentra tarefas, critérios de aceite, decisões e evidências. Nenhuma funcionalidade está concluída somente porque existe uma tela.

Atualização: PR #4 integrado e CI da main aprovado. A inspeção Neon revelou código posterior à transferência: versões 8/9 do Sites e migrations 006/007. A [recuperação #5](https://github.com/pchg68/leadrescue/issues/5) precede as etapas 2/3 abaixo. Não reimplementar importação ou baselinar o banco enquanto essas fontes estiverem ausentes. Consulte [procedimento e verificador](MIGRATION-RECONCILIATION.md).

1. Fundação de continuidade e CI — #1: integrada pelo PR #4.
2. [Histórico Prisma e autenticação — #2](https://github.com/pchg68/leadrescue/issues/2): validar banco existente em branch isolada, reconciliar histórico sem reaplicar migrations e comprovar perfis reais. Sprint 0 continua aberto.
3. [Importação persistente — #3](https://github.com/pchg68/leadrescue/issues/3): após recuperar as versões 8/9, validar no servidor, storage privado, lotes/linhas, deduplicação, idempotência, evento/outbox e retry.
4. [LeadRescue Compliance — #7](https://github.com/pchg68/leadrescue/issues/7): implementar proveniência, avaliação jurídica, gate de campanha, supressão, retenção, transparência de IA, handoff e relatório. Os gates que impedem ação indevida precedem WhatsApp e IA em produção.
5. Piloto assistido: uma imobiliária, campanha limitada, métricas definidas em [PRODUCT-STRATEGY.md](PRODUCT-STRATEGY.md), revisão humana e relatório final.

Depois, seguir Sprints 3–6 da seção 17 da especificação: motor determinístico completo; gestão de exceções; relatórios e IA opcional; observabilidade, privacidade, backup/restore, carga e piloto.

## Regras de sequência

- A recuperação #5 e a reconciliação #2 bloqueiam novas migrations.
- Importação persistente é pré-requisito para aplicar os gates por lead/campanha.
- Supressão, autorização, auditoria, idempotência e handoff bloqueiam disparos reais.
- Multiagente, A2A, memória autoevolutiva e RAG generalizado permanecem fora do MVP.
- Mudança de escopo exige issue e ADR, com impacto no piloto e nas métricas.

## Protocolo para retomar

- Ler README, este roadmap e a issue escolhida; atualizar `main` e trabalhar em branch `codex/...`.
- Conferir PRs abertos antes de duplicar trabalho. Registrar mudanças de escopo na issue.
- Cada PR descreve problema, comportamento final, testes e limites; referencia a issue.
- Atualizar documentação/ADR no mesmo PR que muda comportamento ou arquitetura.
- Após integração, atualizar os critérios de aceite; deploy tem registro separado de commit e resultado.
- Chats são apoio temporário: decisões aceitas e pendências precisam estar no repositório.

Não há prazo de entrega presumido nem milestone concluído. Criar milestones quando houver um conjunto de entregas e critérios acordados.
