# Auditoria Figma × Beach Sports DS

O Figma é a fonte da verdade. O repositório acompanha seu export; diferenças
no código não autorizam renomear ou modificar o arquivo de design.

Este plugin serve para **exportar evidências e comparar**, sem alterar
variáveis, estilos, componentes, tokens canônicos ou versões publicadas.

## Executar no Figma Desktop

1. Abra o arquivo [volei app](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=0-1).
2. Use **Plugins → Development → Import plugin from manifest…** e escolha
   `tools/figma-audit/plugin/manifest.json` deste checkout.
3. Execute **Beach Sports DS — Audit** em Development e clique em **Preparar exportação**.
4. Aguarde a leitura e clique em **Baixar figma.snapshot.json**.
5. Copie o JSON para `design/figma/figma.snapshot.json` no repositório.

O manifest aceita Design e Dev Mode, com a capability `inspect`. Se uma versão
anterior mostrar `editor type does not include "dev"`, feche o plugin e reimporte
este manifest atualizado. O exportador inclui descendentes ocultos de instâncias
mesmo no Dev Mode, restaurando a configuração de travessia ao concluir ou falhar.

O plugin não precisa de build, GitHub, token de API ou servidor intermediário.
Os três arquivos em `plugin/` são o plugin completo. O manifest não contém ID
de publicação; se o Figma exigir um ID ao registrar o plugin local, crie um plugin
em Development → New plugin… e use o ID atribuído pelo Figma neste manifest.
Não publique na Community para executar esta auditoria.

## Comparar no repositório

```sh
pnpm tokens:audit design/figma/figma.snapshot.json design/figma/audit
```

O comando lê as quatro fontes DTCG de cada tema diretamente de
`packages/tokens/src`, sem executar o build ou sobrescrever os tokens.
Produz `audit.json` e `audit.md`. Retorna **0** quando não encontrou diferenças
de tokens, **1** quando há diferenças de tokens
e **2** quando a entrada ou execução é inválida. **0 não é certificação de paridade.**
A fixture `fixtures/figma-token-export.json` é uma projeção das 294 variáveis e
coleções do export real, com SHA-256 de origem. Não contém nós ou estilos e não
substitui o export completo para a auditoria de componentes.

```sh
pnpm test:figma-audit
pnpm exec nx run figma-audit:lint
```

Os testes usam dados de exemplo e uma API Figma simulada. Não são evidências
do arquivo real. O Nx inclui testes/lint da ferramenta no fluxo affected existente;
**a comparação com o snapshot ainda não é um bloqueio de CI**. Adicionaremos essa
regra depois de revisar o primeiro export e definir exceções e correspondências.

## Contrato de exportação v1

| Campo                                            | Conteúdo                                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `schemaVersion`, `exporterVersion`, `exportedAt` | Formato, versão do exportador e instante de leitura                                                        |
| `file`                                           | Nome e fileKey quando a API o disponibiliza; `null` não é uma identificação verificada                     |
| `coverage`                                       | Todas as páginas, leitura completa/incompleta, avisos e limites                                            |
| `pages`                                          | IDs e nomes das páginas para separar DS, documentação, originais e produto na revisão                      |
| `collections`                                    | IDs/keys, nomes, modos, defaultModeId, IDs das variáveis e origem local/remota                             |
| `variables`                                      | IDs/keys, nomes, tipos, valores por modo, aliases preservados, escopos e codeSyntax                        |
| `styles`                                         | Estilos locais de texto, paint/effect e estilos externos referenciados, com vínculos                       |
| `nodes`                                          | Hierarquia por IDs; geometria, pinturas, efeitos, vínculos, modos, variantes e propriedades de componentes |
| `nodes[].textSegments`                           | Intervalos com tipografia, estilos e vínculos próprios; sem `characters`                                   |
| `nodes[].mainComponent`                          | ID/key/nome/origem do master de cada instância                                                             |

O export percorre todas as páginas, incluindo nós ocultos. `masterId` identifica
os descendentes de cada master. Variáveis locais são completas; dependências
remotas são apenas as referenciadas, não um inventário de bibliotecas externas.
Valores mistos são representados por `{ "mixed": true }`; intervalos de texto
preservam as diferenças internas. Falha de travessia aborta a exportação.
Referências indisponíveis ficam nos avisos, sem marcar a leitura como completa.
Definições de propriedades são lidas no `COMPONENT_SET` ou no componente sem
variantes. Cada variante aponta para seu conjunto por `componentSetId` e
`componentPropertyDefinitionsOwnerId`, sem invocar o getter proibido pela API.
Outras propriedades de nós indisponíveis são registradas por nó/campo nos avisos;
o export é preservado, mas a cobertura fica incompleta.

Nomes de nós/component properties podem conter conteúdo do arquivo; revise o
JSON antes de publicá-lo. O plugin não exporta imagens nem o texto dos segmentos.
Ele nega acesso de rede no manifest e só entrega o JSON para download local.

## O que já é comparado

- Nomes por conversão determinística: `space/16` e `space.16` → `--ds-space-16`.
  Nomes CSS já canônicos são preservados. Colisões não são aceitas.
  `mapping.json` declara os namespaces das coleções: palette → palette,
  color → color, typography → type; spacing/sizing já contêm seus caminhos.
  A mesma regra resolve nomes dos aliases; `codeSyntax.WEB` é conferido contra
  o nome resultante, sem ser usado para esconder divergências de nome.
- Presença nos dois lados, tipos, valores e identidade do alias imediato, mesmo
  quando dois aliases resolvem para a mesma cor ou dimensão.
- Light/Dark separadamente; aliases resolvidos através de coleções, com detecção
  de ciclos, dependências ausentes e modos desconhecidos.
- Dimensões px ↔ FLOAT; cores hex ↔ RGBA sem arredondamento de oito bits.
  Tolerância numérica: `0.00001`. Percentuais não viram px sem contexto.
- Candidatos para revisão nos masters: geometria literal não zero, cores sólidas
  sem vínculo e propriedades tipográficas sem vínculo direto nos intervalos.
  Um styleId é registrado para inspeção; não é aceito como prova de tokenização.

Coleções com modos chamados Light/Dark usam esses modos. Coleções de um único
modo podem atender valores compartilhados, exceto cores semânticas `color/*`.
Outro mapeamento não é inferido. Modos adicionais ficam no JSON para revisão,
mas a implementação só compara os dois temas publicados pelo repositório.

## O que a primeira auditoria ainda precisa fechar

1. Os 294 tokens originais estão representados no código. Quinze nomes públicos
   antigos permanecem como aliases explícitos de compatibilidade, sem exigir
   equivalentes no Figma. O comparador valida que apontam para tokens canônicos
   presentes no export e não permite usar essa marca para esconder tokens do Figma.
2. Comparar os estilos de texto exportados campo a campo com os 12 estilos do
   contrato; revisar aliases/vínculos desses estilos. Esta correspondência ainda
   não é automatizada pelo comparador.
3. Definir exceções explícitas para geometria estrutural, ícones, zeros, efeitos,
   proporções e valores derivados. Esta etapa não exige tokenizar todo número.
4. Mapear masters/variantes/slots para React/Storybook, especialmente Card.
5. Revisar composições de produto com instâncias oficiais e usos semânticos dos
   tokens. Cópias manuais e instâncias destacadas não podem ser comprovadas só
   pela ausência de `mainComponent`.
6. Validar visualmente e por interação estados, temas, acessibilidade e responsividade.

O relatório tem estado fixo **audit-only**: não aprova a base, não carimba o Figma
e não sincroniza alterações. O SHA-256 identifica o contrato comparado; não prova
vínculos nem equivalência visual. A leitura não é transacional: evite editar o
arquivo durante a exportação e exporte novamente após mudanças. Sem nova
exportação, o CI não detecta mudanças posteriores no Figma.

## Referências da API

- [Variáveis e vínculos por intervalo](https://developers.figma.com/docs/plugins/working-with-variables/)
- [Carregamento explícito de páginas](https://developers.figma.com/docs/plugins/migrating-to-dynamic-loading/)
- [Manifest e restrições de rede](https://developers.figma.com/docs/plugins/manifest/)

## Compatibilidade e direção do fluxo

Figma → export → atualização do código → validação → release. O plugin Align de
escrita foi retirado; não é parte deste fluxo. Nenhuma alteração de design é
necessária para validar os tokens do export original contra este repositório.

Os quinze aliases legados usam a extensão `org.beachsports.compatibility` nas
fontes DTCG. Eles mantêm nomes/valores públicos já existentes, mas não fazem parte
dos 294 nomes canônicos do Figma. A extensão precisa apontar por alias para um
token canônico do mesmo tipo; nomes presentes no Figma não podem ser ocultados
como legado. Os testes conferem os 272 valores anteriormente publicados em
Light/Dark e os 588 pares token/modo do export real.

As lacunas de vínculos dos masters são relatadas separadamente e continuam
pendentes; não bloqueiam a constatação de igualdade dos tokens, nem justificam
modificar o Figma automaticamente. Os candidatos de vínculo ficam no relatório e não geram código de erro quando
a comparação dos tokens está alinhada. `tokenStatus` distingue a correspondência
com o snapshot; `status: audit-only` preserva o limite de certificação.

## Auditoria dos componentes

O relatório [Figma → componentes](../../docs/figma-component-audit.md) identifica
os 14 conjuntos/379 variantes e a correspondência com as APIs React. A projeção
versionada em `design/figma/component-contract.json` preserva os IDs do export,
as combinações reais, a geometria e os papéis de cor dos roots, os 12 estilos de
texto e as partes do Card. Não equivale ao export completo.

```sh
node tools/figma-audit/components.mjs /caminho/figma.snapshot.json design/figma/component-contract.json
pnpm test:figma-audit
```

O extrator somente lê o Figma exportado. Ele rejeita sobrescrever sua entrada e
compara os seis campos e cinco vínculos dos estilos com o contrato Light/Dark.
Os testes da ferramenta e os testes de browser consomem a projeção, com inputs
Nx explícitos. As verificações de roots do browser cobrem cores, raio e alturas
fixas aplicáveis; não são comparação automática de pixels de todas as 379 variantes.
Button Icon e FormField compartilham as implementações ButtonBase/Input verificadas;
os estados e as composições têm também os testes de comportamento existentes.

O arquivo `component-binding-review.json` conserva os candidatos do export desta
revisão por componente, classificando bordas vinculadas por lado, ícones, foco
derivado e valores literais do Card. Não é gerado pelo extrator da projeção.
Um novo export exige repetir a revisão dos candidatos; nenhum desses artefatos
altera o Figma nem certifica automaticamente a acessibilidade da base.
