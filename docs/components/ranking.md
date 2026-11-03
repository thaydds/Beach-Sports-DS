# Ranking

Classificação individual com título, descrição, colunas e quantidade variável
de jogadores. Cada linha usa **RankingItem**, com posição, pessoa e pontos
associados. Use ScoreMatch para resultado de uma partida entre equipes.

## Uso

```tsx
import '@beachsports/tokens/css/tokens.css';
import '@beachsports/components/styles.css';
import { Ranking, RankingItem } from '@beachsports/components';

<Ranking
  title="Ranking de jogadores"
  description="Pontos acumulados na temporada"
  density="compact"
>
  <RankingItem position="1" playerName="André" points="120" avatar={{ initials: 'AN' }} />
  <RankingItem
    position="2"
    playerName="Iolanda"
    points="110"
    emphasis="highlighted"
    currentPlayer="Você"
    avatar={{ initials: 'IO' }}
  />
</Ranking>;
```

## Propriedades

| Prop               | Tipo / padrão                  | Regra                                                                                            |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `title`            | string obrigatória             | Título independente dos dados da coleção.                                                        |
| `description`      | string opcional                | Período, contexto e unidade dos pontos. Ausente não reserva espaço.                              |
| `density`          | compact, comfortable / compact | Propagada aos RankingItem por contexto.                                                          |
| `children`         | ReactNode                      | Slot de RankingItem, inclusive arrays ou fragments; quantidade variável, sem cinco linhas fixas. |
| `columnLabels`     | `{ position, player, points }` | Rótulos padrão: Posição, Jogador e Pontos.                                                       |
| `as`, `titleAs`    | section e h2 por padrão        | Semântica do painel e título.                                                                    |
| `className`, `ref` | layout e ref da raiz           | Painel passivo, sem onClick ou tabIndex.                                                         |

Não ordena, calcula pontos, numera pelo índice nem inventa desempates. A ordem
dos filhos e os valores de cada RankingItem são preservados. Posições podem se
repetir. Zero itens mantém título e cabeçalhos; o produto fornece seu contexto
de ausência de dados fora do tbody. Não insira texto ou div diretamente no slot
de linhas: ele corresponde a um tbody nativo.

## Estrutura e geometria

Reutiliza Card para superfície, borda e raio e Typography para título e textos.
A comparação por colunas usa uma **tabela HTML real**: caption visível com
título/descrição, th com scope=col e nomes de jogadores em th com scope=row.
Assim, os pontos continuam associados à pessoa e aos cabeçalhos. Não há
segunda lista escondida nem sequência de posição gerada automaticamente.

Painel compacto usa `space/16`; comfortable usa `space/24`. O padding desconta
a borda interna, sem alterar tokens. Título Heading/L e descrição Body/M têm
gap `space/8`. Cabeçalho usa Label/S e padding vertical `space/8`, com separação
`space/16` antes das linhas. Posição e pontos reservam `size/56` cada; padding
horizontal `space/16` e gaps `space/12` mantêm alinhamento com as linhas.

O nome ocupa a coluna flexível e quebra em vez de reduzir a fonte ou cortar
conteúdo. Abaixo de **24rem úteis**, apenas o Avatar opcional decorativo é
ocultado, recolhendo seu gap. É uma regra local para preservar o espaço de
leitura, sem novo token. Nome, posição, pontos e informações textuais permanecem.
Abaixo de **20rem úteis**, as linhas passam a blocos: posição, nome e pontos
continuam na mesma ordem de leitura. O cabeçalho permanece acessível e os pontos
ganham seu rótulo visual localizado. A tabela mantém papéis e associações semânticas.
Textos ampliados continuam usando a escala de Typography e aumentam a altura.

## Acessibilidade e composição

O título nomeia a região; caption e cabeçalhos dão contexto à tabela. As linhas
são passivas: destaque não adiciona aria-selected, tabindex, cursor de ação,
hover ou navegação de grid. Current player é texto independente do destaque.
Avatar ao lado do nome é decorativo.

Não há anúncio automático de mudanças. Caso a coleção mude por uma ação do
usuário, a aplicação pode apresentar um resumo em role=status sem deslocar
o foco. A story de quantidade variável mantém o foco no Button que altera a
coleção. Os dados de exemplo reproduzem os cinco nomes/pontos dos masters;
isso não fixa a quantidade na biblioteca.

## Origem

[Ranking no Figma](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2101-76049).
Veja também o guia de RankingItem no Storybook para a API das linhas.
Os exemplos de Avatar, Badge e Card mostram as novas composições com os mesmos
componentes públicos. Nenhum token, dependência ou versão foi alterado; npm
recebe as exportações pelo fluxo de release.
