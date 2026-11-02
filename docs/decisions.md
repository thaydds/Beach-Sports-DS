# Decisões e desvios

Registro do que foi decidido nesta base e do que diverge do `PROMPT-monorepo.md` / `tokens.md`.
Nenhum valor de token foi alterado.

## Versões

O documento fixa **Storybook 9** e **ESLint 9**. Foram preservadas as versões
já instaladas e confirmadas no registry npm. Os peers de `@nx/storybook@21.6.11`
aceitam Storybook `>=7 <10`; `@storybook/react-vite@9.1.21` aceita Vite 5, 6 ou 7.
Não foi feita migração de major.

| Pacote     | Versão  | Motivo                                                  |
| ---------- | ------- | ------------------------------------------------------- |
| nx         | 21.6.11 | linha instalada compatível com Storybook 9 (peer `<10`) |
| storybook  | 9.1.21  | pin do documento                                        |
| eslint     | 9.39.5  | pin do documento                                        |
| typescript | 5.9.3   | versão instalada, compatível com o toolchain            |
| vite       | 7.3.7   | faixa suportada por Storybook 9 (`^5 \|\| ^6 \|\| ^7`)  |
| vitest     | 3.2.7   | faixa suportada por `@nx/vite`/Storybook 9              |
| pnpm       | 10.34.9 | fixado em `packageManager`; corepack provisiona         |

## Tokens

1. **`dist/ts` publica também `tokens.js`.** O contrato pede `tokens.ts` + `tokens.d.ts`; como
   `tokens.ts` não é executável em runtime, o build emite o mesmo objeto em ESM (`tokens.js`) e
   aponta `exports.import` para ele. `tokens.ts` e `tokens.d.ts` continuam no `dist/`.
2. **`letter-spacing-percent` não é atribuível a CSS.** Os valores canônicos são percentuais
   (`-1%`, `2%`), mas `letter-spacing` aceita apenas `<length>` — `%` é inválido na propriedade.
   O token é emitido fielmente (`--ds-type-*-letter-spacing-percent`) e o `letter-spacing` em px
   também. A implementação de componentes deve converter o percentual para `em`
   (`2%` → `0.02em`) ou usar o px. **Decisão pendente com o time**: criar tokens em `em` ou
   declarar o px como valor de implementação.
3. **`type.font-style` carrega nomes do Figma** (`Regular`, `Semi Bold`), não keywords CSS
   (`normal`, `italic`). São tokens documentais; não devem ser aplicados direto em `font-style`.
4. **Aliases resolvidos no build.** O CSS final não tem `var()` encadeado: cada papel recebe o
   hex do tema. O teste de paridade valida os 34 caminhos e a resolução de cada alias.
5. **`dist/json/resolved.json` separa `color.light` e `color.dark`.** Os dois temas usam os
   mesmos caminhos DTCG; sem separação as chaves colidiriam, como no build.
6. **Saída opcional Tailwind removida por decisão da usuária.** O build gera apenas CSS,
   TypeScript/JavaScript e JSON. A biblioteca usa CSS Modules e não utiliza Tailwind.

## Ferramentas

1. **Build dos tokens em `build.ts` + `sd.config.ts`.** O `sd.config.ts` só descreve as duas
   passagens do Style Dictionary (sem hex e sem lista de tokens); `build.ts` compõe o CSS final e
   emite TS/JSON. Roda com type stripping nativo do Node 24.
2. **`@nx/eslint:lint` em vez de `eslint` puro nos targets.** É o que deixa o
   `@nx/enforce-module-boundaries` com o grafo de projetos disponível; sem o executor a regra é
   apenas ignorada com warning.
3. **`@nx/storybook` para `storybook` e `build-storybook`.** O base path `/Beach-Sports-DS/` é
   aplicado no `viteFinal` a partir de `STORYBOOK_BASE_PATH` (o workflow de deploy define a env);
   localmente fica `/`. O Storybook 9 gera o `iframe.html` com o base absoluto e o manager com
   caminhos relativos, que funcionam em project site.
4. **Título do Storybook em `manager.ts` + `manager-head.html`.** `brandTitle` no tema do manager
   e `<title>Beach Sports DS</title>` na aba.
5. **`components` depende de `@beachsports/tokens` via `workspace:^`.** É o que garante o link do
   workspace e a ordem `tokens:build → components:build` no grafo do Nx.
6. **`components` ainda não publica `styles.css`.** Sem componentes não há CSS agregado; o
   `exports` correspondente entra com o primeiro componente (`Button`), junto do agregador.
7. **Testes de axe em jsdom desligam `color-contrast`.** O jsdom não implementa canvas; contraste
   é verificado pelo `addon-a11y` no Storybook (browser real), com `test: 'error'`.
8. **`apps/` fica vazio** (`.gitkeep` para persistir a pasta no Git). `tools/` contém a geração da documentação. O generator de componente é da etapa 10 do
   documento e não entrou neste bootstrap.

## Fechamento da infraestrutura

- `pnpm lint` executa também Stylelint; rejeita hex, rgb/hsl, px e referências
  `--ds-palette-*` em CSS Modules. Os overrides continuam limitados aos estilos globais.
- Hooks Husky são instalados via `prepare`; o commit inicial passa por lint-staged e commitlint.
- A documentação Tokens é gerada de `docs/tokens.md` por `components:docs-tokens`
  antes de iniciar ou compilar Storybook. Não é versionada uma segunda tabela.
- O viewport padrão usa `initialGlobals.viewport`, conforme a API do Storybook 9.
- Project references TypeScript ligam as declarações dos dois pacotes. Tokens são
  gerados primeiro; depois `pnpm exec tsc -b` verifica as referências.
- Os `$description` de raiz dos JSONs são descartados apenas em memória pelo parser
  de build para evitar colisões de metadados. Os cinco arquivos fonte permanecem idênticos.
- Contraste e variantes de componentes aguardam a implementação dos componentes;
  a presente rodada entrega apenas infraestrutura, sem componentes nem stories de produto.

- `nx release version 0.1.0 --first-release --dry-run` passou sem alterar arquivos,
  criar tags, commits ou acessar publicação. O Nx 21 ainda emite um aviso genérico
  sobre ausência de `swc-node`/`ts-node`; os targets usam Node 24 nativo ou ferramentas
  com loader próprio e foram executados com sucesso. Nenhum loader extra foi adicionado.
- O Vite avisa que o entry de componentes está vazio, como esperado nesta rodada.
  O build de docs avisa sobre chunks maiores que 500 kB. Não bloqueiam os builds.

- O push inicial executa CI. O workflow de Pages depende de `vars.DEPLOY_DOCS == 'true'`,
  para manter o deploy pendente até sua configuração e autorização.

## Documentação visual

- As páginas visuais são componentes internos de documentação em `packages/components/docs/ui`,
  fora do entry publicado da biblioteca. Não implementam componentes de produto.
- As amostras leem os artefatos públicos gerados pelo Style Dictionary. Nenhum JSON DTCG foi alterado.
- A palette aparece somente como catálogo documental. Componentes de produto continuam restritos a papéis semânticos.
- A fonte Inter variável é servida localmente, com a licença OFL original, apenas na documentação.
- A composição editorial usa dimensões responsivas próprias da documentação; não cria tokens de produto.
- O tracking das amostras converte percentuais canônicos em `em` para a renderização, sem modificar valores fonte.
- A referência técnica continua gerada de `docs/tokens.md`; o catálogo visual deriva dos artefatos, sem segunda tabela manual.
