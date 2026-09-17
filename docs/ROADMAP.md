# Roadmap e continuidade

Atualizado em 17/09/2026. O GitHub concentra tarefas, critérios de aceite, decisões e evidências. Nenhuma funcionalidade está concluída somente porque existe uma tela.

Atualização: PR #4 integrado e CI da main aprovado. A inspeção Neon revelou código posterior à transferência: versões 8/9 do Sites e migrations 006/007. A [recuperação #5](https://github.com/pchg68/leadrescue/issues/5) precede as etapas 2/3 abaixo. Não reimplementar importação ou baselinar o banco enquanto essas fontes estiverem ausentes. Consulte [procedimento e verificador](MIGRATION-RECONCILIATION.md).

1. [Fundação de continuidade e CI — #1](https://github.com/pchg68/leadrescue/issues/1): documentação atual, instalação reproduzível, contratos, schema, testes e build em PRs. Implementação nesta branch; conclusão depende da integração do PR.
2. [Histórico Prisma e autenticação — #2](https://github.com/pchg68/leadrescue/issues/2): validar banco existente em branch isolada, reconciliar histórico sem reaplicar migrations e comprovar perfis reais. Sprint 0 continua aberto.
3. [Importação persistente — #3](https://github.com/pchg68/leadrescue/issues/3): validação no servidor, storage privado, lotes/linhas, deduplicação, idempotência, evento/outbox e retry. Próximo incremento funcional registrado no handoff.

Depois, seguir Sprints 3–6 da seção 17 da especificação: motor determinístico completo; gestão de exceções; relatórios e IA opcional; observabilidade, privacidade, backup/restore, carga e piloto.

## Protocolo para retomar

- Ler README, este roadmap e a issue escolhida; atualizar `main` e trabalhar em branch `codex/...`.
- Conferir PRs abertos antes de duplicar trabalho. Registrar mudanças de escopo na issue.
- Cada PR descreve problema, comportamento final, testes e limites; referencia a issue.
- Atualizar documentação/ADR no mesmo PR que muda comportamento ou arquitetura.
- Após integração, atualizar os critérios de aceite; deploy tem registro separado de commit e resultado.
- Chats são apoio temporário: decisões aceitas e pendências precisam estar no repositório.

Não há prazo de entrega presumido nem milestone concluído. As três issues formam a sequência inicial; criar milestones quando houver um conjunto de entregas e critérios acordados.
