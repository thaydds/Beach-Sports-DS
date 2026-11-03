# RankingItem

Linha passiva do Ranking. Representa **uma pessoa**, com posição e pontuação
fornecidas pelo produto. Use dentro de Ranking ou de um tbody de tabela com
cabeçalhos compatíveis; uma tr isolada não é HTML válido.

## Propriedades

| Prop               | Tipo / padrão                            | Regra                                                                      |
| ------------------ | ---------------------------------------- | -------------------------------------------------------------------------- |
| `position`         | string ou número obrigatório             | Dado do domínio, sem numeração pelo índice.                                |
| `playerName`       | string obrigatória                       | Nome completo da pessoa, sem truncamento.                                  |
| `points`           | string ou número obrigatório             | Exibe o valor recebido, inclusive zero.                                    |
| `density`          | compact ou comfortable                   | Herda de Ranking; fora dele, compact. Pode ser explícita.                  |
| `emphasis`         | default ou highlighted / default         | Realce informativo, sem mudar posição ou seleção.                          |
| `currentPlayer`    | string opcional, por exemplo Você        | Independente do destaque; ausente recolhe sua linha.                       |
| `secondaryInfo`    | string opcional                          | Apoio textual que não substitui o nome.                                    |
| `avatar`           | `{ initials?, src?, content? }` opcional | Reutiliza Avatar decorativo SM/MD conforme densidade.                      |
| `className`, `ref` | layout e ref da tr                       | Aceita atributos nativos passivos; sem onClick, tabIndex ou aria-selected. |

São quatro combinações: duas densidades × dois destaques. Os dados opcionais
não multiplicam variantes. Omitir Avatar, marcador ou informação secundária
remove suas regiões e gaps. Não são criadas iniciais nem nomes de exemplo no
componente de produção.

Compact usa padding vertical `space/12`, Avatar SM de 32 e altura mínima 56.
Comfortable usa `space/16`, Avatar MD de 44 e mínimo 72; com Avatar, a linha tem
76 na escala padrão. Texto adicional ou ampliado aumenta a altura. A borda
inferior `stroke/subtle` é contabilizada dentro do padding. Gaps são `space/12`
na identidade e `space/4` entre textos.

Posição, nome e pontos usam Typography Label/M; o marcador usa Label/S e
`accent/fg`, e o apoio usa Body/S com `text/secondary`. A superfície destacada
usa `accent/soft`; a comum usa `bg/surface`, com divisória `border/subtle`.
A leitura segue posição, nome, marcador/apoio e pontos. O nome é o cabeçalho
semântico da linha. Não há ação ou live region implícita.

Em larguras estreitas dentro de Ranking, o Avatar decorativo pode sumir para
preservar os dados textuais. Em larguras ainda menores, o layout em blocos
preserva a ordem posição–nome–pontos e mostra o rótulo dos pontos. Posições
empatadas e ordem recebida são mantidas.
Veja o guia de Ranking para composição, responsividade e exemplo de uso.

[RankingItem no Figma](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2101-76704).
Nenhum token foi criado ou alterado. Disponível no workspace; a publicação npm
acompanha a release de components.
