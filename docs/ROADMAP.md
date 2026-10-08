# Roadmap e continuidade

Atualizado em 08/10/2026. O GitHub concentra tarefas, critérios de aceite, decisões e evidências. Nenhuma funcionalidade está concluída somente porque existe uma tela.

PRs #4, #6, #8 e #9 estão integrados. A V9 já inclui CSV persistente, cadastro manual e qualificação. A última execução do CI da main (35790280803) falhou no lint; os checks posteriores foram pulados. Corrigir e validar todos os checks antes de promover outro commit.

As fontes de 006/007 estão presentes, mas seus hashes diferem dos registrados historicamente no banco. A issue #5 passa a acompanhar a comparação dos originais e a reconciliação documental, sem reaplicar SQL ou substituir checksums para contornar divergência. A issue #2 continua bloqueando novas migrations e promoção comercial.

1. Fundação de continuidade e CI — #1: integrada pelo PR #4.
2. [Histórico Prisma e autenticação — #2](https://github.com/pchg68/leadrescue/issues/2): validar banco existente em branch isolada, reconciliar histórico sem reaplicar migrations e comprovar perfis reais. Sprint 0 continua aberto.
3. [Importação persistente — #3](https://github.com/pchg68/leadrescue/issues/3): validação no servidor, persistência por lote, deduplicação e idempotência já estão implementadas para 500 registros/2 MiB. Validar o fluxo autenticado e completar histórico de lotes na UI, storage privado e processamento assíncrono/outbox/retomada conforme a necessidade de volume.
4. [LeadRescue Compliance — #7](https://github.com/pchg68/leadrescue/issues/7): implementar proveniência, avaliação jurídica, gate de campanha, supressão, retenção, transparência de IA, handoff e relatório. Os gates que impedem ação indevida precedem WhatsApp e IA em produção.
5. Piloto assistido: uma imobiliária, campanha limitada, métricas definidas em [PRODUCT-STRATEGY.md](PRODUCT-STRATEGY.md), revisão humana e relatório final.

Depois, seguir Sprints 3–6 da seção 17 da especificação: motor determinístico completo; gestão de exceções; relatórios e IA opcional; observabilidade, privacidade, backup/restore, carga e piloto.

## Regras de sequência

- A divergência de hashes #5 e a reconciliação #2 bloqueiam novas migrations. Recuperar SQL original e comparar com diário atual; código presente não comprova alinhamento com o banco.
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
