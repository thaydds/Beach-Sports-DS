# Beach Sports DS

Design system do Beach Sports: tokens em [DTCG](https://tr.designtokens.org/) compilados para CSS custom properties, TypeScript e JSON, e uma biblioteca de componentes React com CSS Modules.

Monorepo [Nx](https://nx.dev) com pnpm workspaces.

## Stack

| Camada    | Escolha                                             |
| --------- | --------------------------------------------------- |
| Monorepo  | Nx + pnpm workspaces                                |
| Linguagem | TypeScript strict (`noUncheckedIndexedAccess`)      |
| Tokens    | Style Dictionary 5, duas passagens Light/Dark       |
| UI        | React 19 + CSS Modules (sem Tailwind na biblioteca) |
| Build     | Vite library mode (ESM + CJS + `.d.ts`)             |
| Docs      | Storybook 9 (react-vite + MDX)                      |
| Testes    | Vitest + Testing Library + vitest-axe               |
| Release   | `nx release` (a partir da primeira publicação)      |

Node 24 (`.nvmrc`). O pnpm é fornecido pelo corepack na versão fixada em `packageManager`.

## Estrutura

```
apps/                     # vazio; o app do produto entra depois do publish
packages/tokens/          # JSONs DTCG → dist/css, dist/ts, dist/json
packages/components/      # componentes React + Storybook
docs/decisions.md         # decisões e desvios do Figma
```

## Comandos

```bash
corepack enable pnpm      # uma vez por máquina
pnpm install

pnpm build                # tokens + components
pnpm build:tokens         # grupo tokens → packages/tokens/dist
pnpm test                 # Vitest de todos os projetos
pnpm lint                 # ESLint + Stylelint (fronteiras e contrato de tokens)
pnpm typecheck            # tsc --noEmit por projeto
pnpm exec tsc -b           # project references (após pnpm build)
pnpm format               # Prettier
pnpm storybook            # Storybook em http://localhost:6006
pnpm build:storybook      # site estático em packages/components/storybook-static
```

Alvos individuais: `nx run tokens:build`, `nx run components:test`, `nx run components:storybook`.

CI verifica formatação e roda `nx affected -t lint typecheck test build build-storybook test-browser`. O workflow separado do Storybook publica a documentação no GitHub Pages a cada push na `main` ou execução manual. Ele não versiona nem publica pacotes npm.

## Tokens

Os cinco JSONs em `packages/tokens/src/` são cópias fiéis dos arquivos exportados do Figma — não edite valores ali. O build gera:

- `dist/css/tokens.css` — `:root` (Light) + `[data-theme="dark"]` (os 34 papéis semânticos)
- `dist/ts/tokens.ts`, `tokens.d.ts`, `tokens.js` — os mesmos nomes do CSS, tipados
- `dist/json/resolved.json` — árvore com aliases resolvidos

Tema: claro é o padrão; escuro é opt-in com `data-theme="dark"` no `<html>`.

## Storybook

```bash
pnpm build:tokens
pnpm storybook
```

A base de revisão é **393×852**. A toolbar **Tema** alterna Light/Dark pelo mesmo decorator global que aplica `data-theme`.

## Licença

MIT © Thay Santos

Decisões e limites desta rodada estão em [docs/decisions.md](docs/decisions.md).
O código fica no GitHub; publicação dos pacotes e deploy da documentação são etapas posteriores.

## Skills do projeto

As skills [design-system](.agents/skills/design-system/SKILL.md) e
[storybook-codex](.agents/skills/storybook-codex/SKILL.md) ficam em `.agents/skills/`,
com referências, templates, licenças e versões upstream fixadas.
Veja [a origem e as adaptações](.agents/skills/README.md).

## Guia de consumo

Leia [Como usar os tokens com CSS Modules](docs/consumption.md), também disponível
no Storybook em **Comece aqui → Como usar**. O guia explica temas, fonte Inter,
tipografia completa, foco e a cadeia de atualização a partir do Figma.

## Testes no navegador

```sh
pnpm exec playwright install chromium # uma vez por máquina
pnpm test:browser
pnpm exec playwright show-report packages/components/playwright-report
```

O target constrói o Storybook e serve o resultado estático na porta 6007,
separada do ambiente de desenvolvimento na 6006. A porta 6007 deve estar livre.
Chromium verifica todas as seis páginas em Light/Dark e nos viewports desktop
(1440×1000) e mobile (393×852), incluindo axe com contraste, overflow, busca,
cópia, persistência do tema e foco por teclado.

Capturas completas e resultados axe ficam no relatório HTML; falhas preservam
traces e screenshots. O CI instala Chromium e publica esses artefatos por 14 dias.
As capturas servem para revisão: não há comparação automática de pixels com
baselines. As verificações automáticas de aparência cobrem overflow e foco;
axe não substitui avaliação manual com tecnologias assistivas.

Os testes de tokens comparam fontes DTCG com CSS, JS, declarações TypeScript e
JSON; também conferem as tabelas de cores, geometria e tipografia da referência.
O cache Nx considera os documentos usados nesses testes e no build do Storybook.

## Releases independentes

Tokens e componentes têm versões, tags e changelogs separados. Uma release de
`tokens` não aumenta a versão de `components`, e vice-versa. A atualização da
dependência de tokens em componentes é explícita quando necessária.

Para simular a primeira release de cada pacote, sem publicar ou alterar arquivos:

```sh
pnpm release:plan:tokens 0.1.0 --first-release
pnpm release:plan:components 0.1.0 --first-release
```

Depois da primeira release, omita `--first-release`; a simulação pode usar
Conventional Commits ou receber `patch`, `minor`, `major` ou uma versão exata.
O fluxo técnico completo está em [Releases e deploy da documentação](docs/releases.md).
Ainda não há workflow de publicação npm automática nem autenticação npm validada.
