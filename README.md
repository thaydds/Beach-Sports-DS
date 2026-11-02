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

CI roda `nx affected -t lint typecheck test build`. O workflow de deploy do Storybook fica preparado, mas só executa quando a variável de repositório `DEPLOY_DOCS` estiver definida como `true`, após a configuração do GitHub Pages.

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
