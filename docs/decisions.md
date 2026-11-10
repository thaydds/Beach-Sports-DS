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

- O push inicial executou CI. O bloqueio inicial de Pages por `DEPLOY_DOCS` foi
  removido após a usuária informar que concluiu sua configuração; o workflow
  agora pode executar em pushes na `main` e manualmente.

## Documentação visual

- As páginas visuais são componentes internos de documentação em `packages/components/docs/ui`,
  fora do entry publicado da biblioteca. Não implementam componentes de produto.
- As amostras leem os artefatos públicos gerados pelo Style Dictionary. Nenhum JSON DTCG foi alterado.
- A palette aparece somente como catálogo documental. Componentes de produto continuam restritos a papéis semânticos.
- A fonte Inter variável é servida localmente, com a licença OFL original, apenas na documentação.
- A composição editorial usa dimensões responsivas próprias da documentação; não cria tokens de produto.
- O tracking das amostras converte percentuais canônicos em `em` para a renderização, sem modificar valores fonte.
- A referência técnica continua gerada de `docs/tokens.md`; o catálogo visual deriva dos artefatos, sem segunda tabela manual.

## Proteções da documentação

- CI inclui formatação, build do Storybook e `components:test-browser` além dos
  targets originais. A base de pushes usa o SHA anterior ao push inteiro.
- Playwright com Chromium e axe verifica seis páginas em Light/Dark nos
  viewports 1440×1000 e 393×852. O relatório inclui resultados axe e capturas;
  falhas preservam traces. Não há comparação automática de pixels com baselines.
- Busca, clipboard, texto longo, persistência de tema e foco são testados em
  browser; a sincronização do manager é verificada em desktop. O browser roda
  sobre o Storybook estático em uma porta separada (6007), sem reutilizar um
  servidor preexistente.
- Declarações TypeScript são verificadas por um consumidor compilado em memória;
  CSS, JS e JSON são comparados com os valores resolvidos das fontes DTCG. As
  tabelas técnicas de cores, geometria e tipografia também têm testes de paridade.
- `docs/consumption.md` alimenta a página **Comece aqui / Como usar**. Documentos
  usados nos testes e no build integram os inputs do Nx para invalidar caches.

## Releases dos pacotes

- Tokens e componentes usam `projectsRelationship: independent`, tags
  `{projectName}@{version}` e changelog por pacote. A configuração inicial
  `fixed` foi substituída para atender à cadência independente solicitada.
- `updateDependents: never` impede incrementos automáticos no outro pacote.
  Atualizações de contrato e da faixa de tokens nos componentes são explícitas.
- A preparação inicialmente manual foi substituída pela automação documentada abaixo.
- Pages é um fluxo de deploy da documentação, sem alterar versões dos pacotes.
  `STORYBOOK_BASE_PATH` faz parte do hash de build para evitar reutilizar o
  artefato local com base `/` no deploy com base `/Beach-Sports-DS/`.
- Procedimento técnico em `docs/releases.md`.

## Automação de release com revisão

- Release Please 17.11.2 prepara PRs independentes de tokens e componentes e cria
  tags/GitHub Releases após o merge. Nx permanece responsável por build e testes.
  Os scripts manuais `release:plan:*` foram removidos para evitar dois fluxos de
  versionamento concorrentes; a configuração Nx independente permanece compatível.
- `release.yml` espera o CI de push na main ter sucesso e verifica o SHA atual.
  `GITHUB_TOKEN` cuida das PRs; um dispatch explícito valida suas branches no CI.
- A publicação npm usa OIDC em jobs separados, com checkout da tag aprovada.
  Tokens precedem componentes quando ambos são publicados na mesma execução.
  `retry_tag` permite retomar uma publicação após falha sem criar nova versão.
- A dependência foi fixada em `workspace:^0.1.0`, convertida pelo pnpm no pack,
  para não aumentar silenciosamente o mínimo de tokens com a versão local.
- A confiança OIDC, a permissão para nomes no npm e a autorização de PRs pelo bot
  dependem das contas externas. Não foram configuradas nem presumidas existentes.
- A primeira versão continua 0.1.0; o manifesto de releases começa vazio. Um
  commit somente de documentação/automação não força publicação dos pacotes.

## Primeiro componente: Button e IconButton

- `Button` e `IconButton` agora são exports públicos. O build agrega apenas seus
  estilos em `dist/styles.css`, exposto por `@beachsports/components/styles.css`.
  O consumidor importa tokens e stylesheet e fornece a fonte Inter. O reset do
  Storybook não é incorporado ao pacote. As notas anteriores sobre entry vazio
  e ausência de CSS agregado descrevem o estado do bootstrap.
- A API aprovada usa `variant` para preservar o nome nativo `style`, que não é
  exposto para customizar o visual interno. Um único `icon` e `iconPosition`
  representam os exemplos esquerda/direita do Figma. `IconButton` exige `label`.
- Estados hover/pressed/focus são nativos. Loading preserva o foco e a largura;
  disabled tem prioridade. Sem ícone, o spinner fica centralizado; com ícone,
  ocupa seu slot. A mensagem de loading do Button acrescenta informação ao
  nome da ação para preservar o texto visível no nome acessível (WCAG 2.5.3).
- Alturas de 44/48/56 são mínimas no Button para suportar texto longo; IconButton
  mantém caixas quadradas. Cores e dimensões usam os tokens existentes. A borda
  Secondary de 1,5 px vem de `stroke/icon`, conforme o Figma, sem novo token.
- SVGs de spinner e chevron são exports originais dos nós 2089:1013 e 2087:2969,
  aplicados como máscaras de cor herdada. Apenas spinner integra o pacote.
  A fonte visual e as diferenças entre notas e exemplos estão em
  `docs/components/button.md`. Os arquivos SVG foram preservados sem edição.
- Transições de cor de 150 ms e ciclo do spinner de 900 ms são constantes locais
  de implementação, removidas com reduced motion; não criam tokens de movimento.
- Stories são excluídas da emissão de declarações. A documentação do Button é
  um input explícito do build Storybook para invalidar seu cache.

## Loading e Modal — export de 10 nov 2026

- Loading tem somente spinner SM/MD/LG16/24/32, action/default e stroke/control. Nome
  acessível não visual; sem Label/Show label/Orientation. Button loading permanece intacto.
- Modal segue slots Content/Actions, título e descrição configuráveis. Busy é estado
  operacional genérico; Default/Saving/Error são composições documentadas, sem API do Volley.
- Dialog nativo preserva herança de tema e fornece top layer; complemento explícito
  contém Tab, scroll e dispensa enquanto busy. Sem dependências ou polyfill novos.
- Lacuna do Figma mantida e documentada: text/primary a48% no backdrop, sem novo token
  canônico. Max-width480 é recomendação de layout com exceção localizada no Stylelint.
- Fonte, geometria, limites e orientação de uso em docs/components/loading.md e modal.md.

## Um executor de acessibilidade por página

- No E2E, a fixture injeta um marcador antes de inicializar qualquer frame. O
  Storybook usa `globals.a11y.manual` somente nesse contexto; os testes continuam
  executando AxeBuilder e verificando violações. Não há alteração de regras ou
  repetição automática de auditorias que falharam.
- O Storybook normal mantém auditoria automática e `a11y.test: error`. Isso evita
  `Axe is already running` quando a auditoria automática do addon concorre com
  a auditoria explícita do Playwright após uma navegação.
- As verificações de geometria do Chip medem pill/seleção/remoção no mesmo layout
  e aguardam as mesmas tolerâncias existentes. Leituras separadas de boundingBox
  podiam combinar medidas de antes/depois de uma mudança de fonte/layout. Nenhum
  estilo ou comportamento do Chip foi alterado.
