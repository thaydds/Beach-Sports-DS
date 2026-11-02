# Auditoria do Beach Sports DS

## Acompanhamento da revisão

Os achados abaixo registram o estado anterior às correções. Em 2026-11-02 foram
implementados os itens 1 a 4: CI com build do Storybook e formatação, testes de
contrato dos tokens/declarações/tabelas, guia de consumo e suíte Chromium de
acessibilidade/layout/interações com relatórios e capturas. As capturas são
evidências para revisão; não há comparação automática de pixels com baselines.
O item 5 (processo de contribuição) permanece adiado por decisão da usuária.

Validação após as correções: 32 testes unitários/de contrato; matriz de seis
páginas × dois temas × dois viewports; interações de busca, clipboard,
tipografia, persistência do tema e foco por teclado. A sincronização da toolbar
do manager é verificada em desktop, onde está visível.

---

Data: 2026-11-02. Escopo: implementação local, tokens, documentação Storybook,
testes e configuração de CI. Critérios: skills locais `design-system` e
`storybook-codex`. Esta revisão não altera implementação nem valores de tokens.

## Resultado

A fundação é coerente para a fase atual. O catálogo visual já demonstra os
tokens reais, mas ainda faltam proteções automatizadas da documentação e um
processo mínimo de evolução. Não é necessário refazer o monorepo.

Não foram encontrados bloqueios nos comandos executados. Isso não certifica
acessibilidade completa, compatibilidade de consumidores ou paridade com o
estado atual do Figma.

## Inventário

| Camada              | Estado verificado                                                                   |
| ------------------- | ----------------------------------------------------------------------------------- |
| Tokens              | 5 fontes DTCG; 272 variáveis no Light; 34 papéis semânticos por tema                |
| Cores               | 69 primitivos; catálogo com comparação Light/Dark, busca e cópia                    |
| Tipografia          | 12 estilos visuais; texto editável; Inter local com licença                         |
| Geometria           | 21 espaçamentos, 14 tamanhos, 9 raios, 3 traços, 2 alvos e 2 tokens de foco         |
| Biblioteca          | Entry vazio; nenhum componente de produto exportado                                 |
| Documentação        | 5 páginas MDX; componentes internos fora do entry da biblioteca                     |
| Padrões e templates | Ainda não implementados; coerente com o escopo inicial                              |
| Governança          | Registro de decisões e Conventional Commits; processo de contribuição ainda ausente |
| Adoção              | Sem aplicação consumidora nesta fase; não há métricas verificadas                   |

Os cinco JSONs foram comparados byte a byte com os arquivos originais recebidos
do Personal Designer: todos idênticos. O catálogo lê os artefatos públicos do
pacote de tokens. A separação entre palette e papéis semânticos está preservada.

## Achados priorizados

### 1. Alta — CI não valida a compilação do Storybook

Evidência: `.github/workflows/ci.yml:48` executa apenas `lint typecheck test build`.
O target da biblioteca em `packages/components/project.json` compila o entry
de `src`; a compilação MDX e do site acontece em `build-storybook`, que não faz
parte desse CI. O workflow de Pages está condicionado a `DEPLOY_DOCS`.

Consequência: erros em MDX ou na integração do Storybook podem chegar à main
com o CI verde. O build local atual passou; o achado é a ausência da proteção.

Recomendação: incluir `build-storybook` nos targets afetados do CI, mantendo
deploy como decisão separada. Incluir também a verificação de formatação.

### 2. Média — acessibilidade e aparência não têm verificação contínua em browser

Evidência: `packages/components/docs/ui/FoundationDocs.test.tsx:76` testa quatro
páginas em jsdom, desliga contraste e não parametriza a auditoria por tema.
`TechnicalReference` não participa dessa matriz. Não há suíte de browser ou
baseline visual versionada no projeto. Configurar `a11y.test: 'error'` no
preview, isoladamente, não adiciona um runner ao CI.

Consequência: contraste, overflow, foco visível e comportamento entre temas
podem regredir sem falha nos testes atuais.

Recomendação: suíte pequena em browser cobrindo as cinco páginas, Light/Dark,
desktop/mobile, teclado, busca e cópia; criar capturas estáveis dos casos
relevantes. Não é necessário contratar Chromatic para começar.

### 3. Média — testes dos tokens concentram-se em cores

Evidência: os nove testes de `packages/tokens/test/tokens.test.ts` verificam
palette, paridade de papéis e resolução de aliases no CSS. Não conferem os
valores de fundação/tipografia nem a equivalência dos exports JS/TS/JSON.

Consequência: uma regressão no gerador fora da camada de cores pode passar.

Recomendação: comparar valores e nomes de fundação/tipografia com as fontes
e verificar equivalência dos artefatos públicos. Preferir verificações de
contrato a snapshots extensos ou somente contagens fixas.

### 4. Média — documentação de consumo e fonte de verdade precisam de clareza

Evidência: `docs/tokens.md:4` ainda aponta os JSONs em `../tokens/`; no
monorepo estão em `packages/tokens/src/`. O texto se declara fonte de verdade,
enquanto o catálogo visual deriva dos JSONs e a referência técnica deriva
de um Markdown mantido separadamente. Os READMEs já explicam importação e
tema, mas não há um guia completo no Storybook para criar um componente.

Consequência: uma pessoa nova pode seguir um caminho inexistente ou atualizar
apenas uma das representações do contrato.

Recomendação: corrigir o caminho, explicitar a cadeia Figma → export DTCG →
artefatos e conferir automaticamente as tabelas técnicas contra os dados.
Adicionar guia curto com CSS Modules, semântica vs palette, fonte Inter,
tipografia completa, foco e exemplos de quando usar cada grupo de tokens.
As exceções de tracking percentual e nomes de font-style já estão registradas
em `docs/decisions.md`; torná-las fáceis de encontrar no guia.

### 5. Média — falta o processo mínimo de contribuição e evolução

Evidência: há `docs/decisions.md`, configuração de release e mensagens
convencionais, mas não há guia de contribuição, critérios de aceite,
roadmap/changelog ou política de depreciação no código do projeto.

Consequência: ferramentas de release não resolvem quem aprova uma alteração
de API ou um token novo, nem como comunicar mudanças incompatíveis.

Recomendação: documentar responsáveis de design e engenharia, proposta e revisão
de componentes, aceite de acessibilidade, versionamento e depreciação. Confirmar
responsáveis com o time; esta auditoria não atribui pessoas ou prazos.

## Fragmentação e drift

- Não há duplicação de bibliotecas de componentes de produto: elas ainda não existem.
- Os componentes editoriais são internos e não fazem parte da API publicada.
- CSS Modules e variáveis CSS são o caminho da biblioteca; Tailwind foi removido.
- Dimensões editoriais em rem/em e estilos inline que exibem tokens não constituem,
  por si só, novos tokens de produto ou um motivo para refazer a documentação.
- Há risco de drift entre tabelas Markdown e fontes DTCG; a comparação automática
  dessas representações ainda não existe.
- Não foram inspecionados os nós atuais do Figma nem consumidores em produção.
  A fidelidade comprovada nesta revisão é com os cinco exports locais recebidos.
- Não inventar motion, sombras ou breakpoints só para preencher uma checklist.
  Novos fundamentos devem partir de uma necessidade real e revisão de design.

## Validações executadas

| Verificação                                                          | Resultado                          |
| -------------------------------------------------------------------- | ---------------------------------- |
| `pnpm exec nx run-many -t lint typecheck test build --skip-nx-cache` | Passou; 18 testes no total         |
| `pnpm build:storybook`                                               | Passou                             |
| `pnpm format:check`                                                  | Passou                             |
| Comparação binária das cinco fontes com os exports recebidos         | Idênticas                          |
| Inspeção da página inicial no browser local                          | Renderização confirmada em desktop |

Avisos observados: entry vazio na biblioteca (esperado nesta fase), chunks
grandes no Storybook e avisos de canvas em jsdom. A execução passou, mas o jsdom
não substitui verificações de contraste e layout em browser. Não foi repetida
nesta auditoria a matriz visual completa que havia sido executada anteriormente.

O helper `storybook_audit.py` foi executado no repositório e em `src`. Na raiz
incluiu templates das skills e artefatos em cache; em `src` classificou testes,
declarações e o entry como componentes. Não reconhece as páginas MDX como stories
de produto. A nota zero e as listas de stories ausentes não são diagnósticos
válidos desta fase e não foram utilizadas como indicador de qualidade.

## Ordem recomendada

1. Proteger o build do Storybook no CI e os contratos dos tokens nos testes.
2. Corrigir a orientação sobre fontes e preparar o guia de consumo/contribuição.
3. Implementar Button como referência: API, variantes necessárias, estados,
   conteúdo longo, teclado, foco e temas; stories CSF tipadas e interação real.
4. Acrescentar a suíte de browser e uma seleção pequena de capturas visuais,
   aproveitando o Button para estabelecer o padrão dos próximos componentes.

Os itens são recomendações. Nenhuma correção, commit, push ou publicação foi
realizada como parte desta auditoria.
