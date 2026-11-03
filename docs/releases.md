# Releases automáticas dos pacotes

## Fluxo de revisão e publicação

1. Um push na `main` executa o CI. O Storybook segue seu deploy separado.
2. Depois do CI bem-sucedido, `release.yml` analisa os commits convencionais e
   abre ou atualiza uma PR por pacote que precise de release.
3. A PR contém somente a versão, o changelog e a entrada do pacote no manifesto.
   O CI é disparado explicitamente na branch da PR para validar esse resultado.
4. A pessoa responsável revisa e faz o merge da PR. Não há auto-merge.
5. Após o CI desse merge passar, Release Please cria a tag e a GitHub Release.
   O job npm faz checkout dessa tag, constrói, testa, empacota e publica somente
   o pacote correspondente.

| Pacote                    | Tag                | PR e changelog               |
| ------------------------- | ------------------ | ---------------------------- |
| `@beachsports/tokens`     | `tokens@0.1.0`     | Independentes de componentes |
| `@beachsports/components` | `components@0.1.0` | Independentes de tokens      |
| Storybook                 | Sem tag npm        | Apenas deploy no Pages       |

Release Please, fixado no lockfile, é o motor da automação de versões e changelogs.
Nx continua responsável pelo grafo, builds e verificações. Sua configuração
independente permanece para compatibilidade, mas não execute releases reais
manuais pelo Nx em paralelo com o fluxo automático.

## Cálculo das versões

| Commit                    | Depois de 1.0 | Antes de 1.0 |
| ------------------------- | ------------- | ------------ |
| `fix`                     | Patch         | Patch        |
| `feat`                    | Minor         | Minor        |
| `!` ou `BREAKING CHANGE:` | Major         | Minor        |
| `docs`, `chore`           | Sem release   | Sem release  |

Os arquivos alterados determinam o pacote. O escopo do commit, sozinho, não
transfere uma alteração de componentes para tokens. Não há plugin que aumente
a versão de dependentes automaticamente.

Mudanças apenas em `docs/`, `.storybook/` e `e2e/` de componentes são excluídas,
mesmo que alguém use `feat` indevidamente. Arquivos de documentação na raiz não
pertencem a nenhum dos pacotes. Quando o mesmo commit modifica código e docs,
o código ainda pode gerar release. Registre mudanças reais de produto com
commits convencionais e mantenha o título de squash equivalente ao que se
pretende publicar, inclusive o indicador de incompatibilidade.

A primeira versão automática é `0.1.0`. O histórico anterior ao commit de
bootstrap registrado em `release-please-config.json` não é reprocessado. O
manifesto começa vazio porque não há releases comprovadas no registro deste
setup. Alterações somente na automação não inventam uma release dos pacotes.

## GitHub: configuração inicial

Em **Settings → Actions → General → Workflow permissions**, habilite
**Allow GitHub Actions to create and approve pull requests**. A automação usa
`GITHUB_TOKEN`, com permissões restritas ao job que prepara releases. Ela não
aprova nem faz merge das próprias PRs.

O token padrão tem restrições para disparar outros workflows. Por isso o script
faz `workflow_dispatch` do `ci.yml` na branch da PR. Esse disparo é permitido
com `GITHUB_TOKEN` e evita depender de um token pessoal. O CI disparado na
branch de release não abre novas releases, pois a preparação só aceita o CI
bem-sucedido de um push na `main` atual.

O workflow recusa publicar com base em CI de fork, branch diferente ou SHA
antigo. Execuções antigas são ignoradas quando existe um commit mais novo na
`main`; o CI desse novo commit será o próximo ponto de preparação.

## npm: configuração inicial necessária

A publicação usa **Trusted Publishing (OIDC)**, sem `NPM_TOKEN` permanente.
Não foi acessada uma conta npm nem configurada essa confiança nesta implementação.
É necessário ter permissão para os nomes `@beachsports/tokens` e
`@beachsports/components` e configurar cada pacote no npm.

Para cada pacote, em **Settings → Trusted publishing**, configure:

| Campo                | Valor                              |
| -------------------- | ---------------------------------- |
| Provider             | GitHub Actions                     |
| Organization or user | `thaydds`                          |
| Repository           | `Beach-Sports-DS`                  |
| Workflow filename    | `release.yml`                      |
| Environment          | `npm`                              |
| Allowed action       | Permitir `npm publish` diretamente |

O environment `npm` é usado pelos dois jobs. Configure suas proteções conforme
as regras do projeto; não foi adicionada uma segunda aprovação obrigatória no
código. Os jobs possuem `id-token: write`; o job que altera PRs não recebe essa
permissão. O npm CLI precisa suportar Trusted Publishing (11.5.1 ou superior).
Node 24 é usado pelo workflow.

**Pacotes ainda inexistentes:** a configuração de Trusted Publishing exige
acesso às configurações do pacote no npm. Quando não houver pacote para
configurar, a primeira publicação precisa de um bootstrap autenticado. Faça isso
somente para um artefato já revisado, com a mesma versão e conteúdo da tag
aprovada; depois configure OIDC. Não publique placeholders ou a biblioteca vazia
para obter um nome.

Preferencialmente prepare o acesso npm antes de fazer merge da primeira PR de
release. Se a tag e GitHub Release já tiverem sido criadas e a primeira publicação
falhar por ausência de confiança OIDC, a criação da tag **não significa** que o
pacote esteja publicado no npm. Conclua o bootstrap do pacote aprovado e use a
retomada descrita abaixo. Nenhuma credencial deve ser colocada no repositório.

Componentes dependem dos tokens: publique a fundação antes de aprovar a primeira
publicação da biblioteca de componentes. Nesta fase a biblioteca de componentes
continua sem componentes exportados; a automação não transforma isso em produto.

## Contrato entre tokens e componentes

A dependência usa uma faixa explícita: `workspace:^0.1.0`. Ao empacotar com pnpm,
ela vira `^0.1.0` no manifest npm. Assim, publicar tokens `0.2.0` não muda
silenciosamente a dependência do próximo pacote de componentes.

Se um componente exigir tokens novos, atualize essa faixa explicitamente e
registre uma alteração de produto em componentes. A PR de componentes deve
mostrar a dependência correspondente. Uma release de tokens isolada não altera
nem publica componentes.

Antes da publicação, o script inspeciona o `.tgz`: nome e versão devem coincidir
com a tag, os protocolos locais devem ter sido resolvidos e o pacote deve ser
público. Para componentes, a faixa requerida de tokens precisa existir no npm.
Quando ambos forem publicados na mesma execução, tokens são publicados primeiro;
uma falha nesse job impede a publicação de componentes.

## Retomada após falha

Primeiro use **Re-run failed jobs** na execução original. Se já tiver sido criada
uma GitHub Release e for necessário iniciar outra execução, use **Run workflow**
de **Release packages** na `main`, preenchendo `retry_tag`, por exemplo
`tokens@0.1.0`.

A retomada exige uma GitHub Release existente e uma tag ancestral da `main`.
Ela seleciona apenas esse pacote, sem criar outra versão ou release. Uma versão
já existente no npm é ignorada. Erros de rede e autenticação não são interpretados
como versão ausente; o job falha. Não remova tags para tentar publicar uma mesma
versão com conteúdo diferente.

O `workflow_dispatch` normal, sem `retry_tag`, recalcula as PRs pendentes e também
exige CI bem-sucedido no SHA atual da `main`.

## Validação local

```sh
pnpm test:release
pnpm exec nx run release-automation:lint
pnpm format:check
```

Os testes usam a implementação real do Release Please com GitHub simulado, sem
criar PRs ou publicar. Cobrem cálculo semântico, PRs independentes, docs-only,
primeira versão e validação do manifest empacotado. Não substituem o teste real
de autenticação nas contas externas.

`pnpm release:preview` oferece uma leitura das propostas pela API dentro de um
ambiente GitHub já configurado; usa `--dry-run` e não escreve. Não solicita tokens
em argumentos nem imprime credenciais. Os antigos scripts manuais
`release:plan:tokens` e `release:plan:components` foram removidos para deixar claro
qual automação é responsável pelas versões.

## Referências

- [Release Please: manifesto de monorepo](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md)
- [GitHub: disparos com GITHUB_TOKEN](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [npm: Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
