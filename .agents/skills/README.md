# Skills do Beach Sports DS

Cópias locais das skills usadas neste projeto:

- [design-system](design-system/SKILL.md): arquitetura, fundamentos e governança do DS.
- [storybook-codex](storybook-codex/SKILL.md): stories, documentação e auditorias do Storybook.

Cada diretório inclui arquivos de apoio, `LICENSE` e `SOURCE.md` com a origem e
as adaptações. Os commits upstream estão fixados em [sources.json](sources.json).
O conteúdo original do entrypoint está em `references/UPSTREAM-SKILL.md`.

A stack e os contratos do projeto continuam prevalecendo: Nx, pnpm, React,
CSS Modules, Storybook 9 e tokens exportados do design. Templates devem ser
adaptados a essas versões; não são componentes ou stories da biblioteca.
Skills auxiliares mencionadas pelo upstream não foram instaladas automaticamente.

As cópias de terceiros ficam fora do lint e da formatação do código do produto,
para preservar os arquivos importados. Atualizações devem revisar o novo commit
upstream e atualizar `sources.json`; não baixar automaticamente a branch `main`.
