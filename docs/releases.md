# Releases e deploy da documentação

## Três fluxos distintos

| Alvo                      | Versão                                        | Tag                    | Publicação                                |
| ------------------------- | --------------------------------------------- | ---------------------- | ----------------------------------------- |
| `@beachsports/tokens`     | Própria em `packages/tokens/package.json`     | `tokens@{version}`     | npm, selecionando `--projects=tokens`     |
| `@beachsports/components` | Própria em `packages/components/package.json` | `components@{version}` | npm, selecionando `--projects=components` |
| Storybook                 | Não altera versões npm                        | Não cria tag de pacote | GitHub Pages                              |

O Nx está configurado com `projectsRelationship: independent`, changelog por
projeto e sem changelog global. O número inicial igual (`0.1.0`) não implica
que os pacotes devam continuar na mesma versão.

`version.updateDependents: never` impede que versionar tokens aumente
automaticamente a versão dos componentes. Os comandos de release devem sempre
selecionar o projeto; um comando sem filtro pode selecionar os dois pacotes.
Os comandos de simulação abaixo já fixam o filtro.

## Simulação sem efeitos externos

```sh
pnpm release:plan:tokens 0.1.0 --first-release
pnpm release:plan:components 0.1.0 --first-release
```

Os scripts usam `--dry-run --skip-publish`: mostram versão e changelog previstos
sem gravar arquivos, criar tags, fazer push ou publicar. `--first-release` é
necessário enquanto não existe uma tag anterior do pacote.

Depois da primeira release:

```sh
pnpm release:plan:tokens patch
pnpm release:plan:components minor
```

Sem um argumento de versão, o Nx calcula o incremento a partir dos commits
convencionais relevantes ao projeto desde a sua própria tag. O escopo da mensagem
ajuda a leitura, mas não substitui os arquivos modificados na determinação do
projeto. Mudanças apenas de documentação não devem ser chamadas de `feat` ou
`fix` para forçar uma versão de produto.

## Preparar uma release real

Este fluxo ainda é manual. Não existe workflow de publicação npm automática.
A autenticação npm e a disponibilidade do escopo precisam ser verificadas antes
da primeira publicação; ter GitHub Pages funcionando não configura o npm.

Exemplo para a primeira release de tokens:

```sh
pnpm exec nx release 0.1.0 --projects=tokens --first-release --skip-publish
```

Esse comando real prepara os arquivos locais. A configuração mantém commit,
tag, push e staging automáticos desativados. Revise o diff com a árvore sem
outras alterações pendentes, valide o pacote e registre somente os arquivos
da release, incluindo o lockfile quando alterado.

```sh
pnpm build:tokens
pnpm exec nx run tokens:test
git add packages/tokens/package.json packages/tokens/CHANGELOG.md pnpm-lock.yaml
git commit -m "chore(release): tokens 0.1.0"
git tag tokens@0.1.0
```

Depois da revisão e da configuração npm, a publicação usa o mesmo filtro:

```sh
pnpm exec nx release publish --projects=tokens --first-release
```

Faça push do commit e da tag correspondente como etapa explícita. Para
componentes, troque projeto, caminho e tag; use o target `build:components`, que
também constrói os tokens necessários. Nas releases seguintes, use a próxima
versão e omita `--first-release`. Esses comandos são instruções para a futura
publicação; nenhuma publicação é executada pelos scripts `release:plan:*`.

## Dependência de tokens nos componentes

Componentes declaram `@beachsports/tokens` com `workspace:^`. O protocolo é
preservado no workspace e o pnpm o converte em uma faixa npm ao empacotar.

Independência de versões não significa compatibilidade automática:

- Uma release de componentes pode continuar usando os tokens publicados que
  atendam ao seu contrato; não precisa gerar uma release de tokens.
- Uma release de tokens não muda o pacote de componentes já publicado.
- Se componentes precisarem de um token novo ou de uma mudança incompatível,
  atualize explicitamente a faixa mínima de tokens e faça uma release de
  componentes também. Não anuncie suporte a uma versão que não contém esse token.
- Em versões `0.x`, um incremento minor pode sair da faixa anterior, como
  `^0.1.0` versus `0.2.0`. A decisão de atualização deve considerar isso.

Antes de publicar componentes, confira o manifest empacotado: com `workspace:^`,
a faixa resulta da versão local dos tokens no momento do empacotamento. Essa
versão de tokens precisa já existir no npm. Se for preciso manter um mínimo
anterior, registre-o explicitamente com um protocolo como `workspace:^0.1.0`
após validar compatibilidade, sem forçar uma release desnecessária de tokens.

## Storybook no GitHub Pages

A configuração de Pages foi informada como concluída pela usuária. O workflow
`deploy-docs.yml` está habilitado para push na `main` e execução manual,
sem depender da variável `DEPLOY_DOCS`. A origem de publicação no GitHub deve
ser **GitHub Actions**.

O workflow compila o site com `STORYBOOK_BASE_PATH=/Beach-Sports-DS/`, envia o
artefato estático e faz o deploy. O cache Nx inclui essa variável para separar
builds locais e de Pages. Nenhum comando de release npm roda nesse workflow.

Endereço esperado: <https://thaydds.github.io/Beach-Sports-DS/>.
O primeiro deploy depende do envio das alterações para a `main`; habilitar o
workflow localmente não executa um deploy remoto.
