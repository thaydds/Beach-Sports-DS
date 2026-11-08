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
| Release   | Release Please + publicação npm via OIDC            |

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

## Auditoria Figma × tokens

O [plugin de auditoria](tools/figma-audit/README.md) exporta variáveis, modos,
aliases, estilos e vínculos sem alterar o Figma. `pnpm tokens:audit` compara
o JSON exportado com os tokens canônicos e gera um relatório para revisão.
O snapshot representa o momento da exportação; ainda não há certificação de
paridade nem bloqueio de CI baseado em uma base aprovada.

## Releases automáticas e independentes

Depois de um push na `main` com CI aprovado, a automação abre ou atualiza uma PR
de release por pacote alterado. O merge dessa PR, seguido de CI aprovado, cria a
tag e publica apenas o pacote correspondente. Não há auto-merge.

Release Please interpreta `fix`, `feat` e mudanças incompatíveis; antes de 1.0,
estas últimas incrementam o minor. Documentação não gera release npm. Tokens e
componentes têm tags, versões e changelogs separados. A dependência de tokens é
explícita, sem incremento automático de dependentes.

```sh
pnpm test:release
```

O workflow está preparado no código. Sua ativação requer permissão para criar PRs
no GitHub e Trusted Publishing configurado **em cada pacote npm**, além do
bootstrap inicial quando o pacote ainda não existe. Nenhuma credencial npm foi
configurada por este setup. Veja [configuração, bootstrap e retomada](docs/releases.md).
