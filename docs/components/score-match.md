# ScoreMatch

Painel passivo de uma partida, com metadados, status, duas equipes, placares e
listas completas de jogadores. Use Ranking para classificação individual; um
placar não representa pontos acumulados de campeonato.

## Uso

```tsx
import '@beachsports/tokens/css/tokens.css';
import '@beachsports/components/styles.css';
import { ScoreMatch } from '@beachsports/components';

<ScoreMatch
  title="Partida #014"
  metadata="01/11/2026 · Quadra 1 · set único"
  density="expanded"
  state="finished"
  winnerLabel="Time A · Vencedor"
  teamA={{ name: 'Time A', score: 25, players: 'André e Iolanda', avatar: { initials: 'AN' } }}
  teamB={{ name: 'Time B', score: 21, players: 'Lana e Sabrina', avatar: { initials: 'LA' } }}
  action={{ label: 'Mais ações da partida #014', onClick: abrirAcoes }}
/>;
```

## Propriedades

| Prop                | Tipo / padrão                              | Regra                                                                                             |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `title`, `metadata` | string obrigatória                         | Identificação, data/local/regra da mesma partida.                                                 |
| `teamA`, `teamB`    | `{ name, score, players, avatar? }`        | Nome e jogadores são textos; score aceita string ou número, sem cálculo ou formatação automática. |
| `density`           | `compact`, `expanded` / compact            | Muda apresentação, mantendo todos os dados.                                                       |
| `state`             | `live`, `finished` / live                  | Live mostra “Ao vivo”; Finished mostra “Finalizada”.                                              |
| `winnerLabel`       | string obrigatória em finished             | Resultado confirmado, fornecido pelo produto. Proibida em live pela API.                          |
| `position`          | string opcional                            | Classificação conhecida; nunca derivada do placar.                                                |
| `description`       | string, padrão de placar provisório        | Contexto exibido no rodapé em live. String vazia omite.                                           |
| `action`            | props de IconButton, sem size/variant/icon | Ação opcional com label obrigatório; usa o ellipsis exportado do Figma, ghost SM de 44.           |
| `children`          | ReactNode opcional                         | Extra content do rodapé, sem espaço reservado quando ausente.                                     |
| `as`, `titleAs`     | article e h2 por padrão                    | Semântica do painel e nível do título independentes da aparência.                                 |
| `className`, `ref`  | layout e ref da raiz                       | O painel não recebe onClick nem tabIndex.                                                         |

Avatar aceita as opções `initials`, `src` e `content` do Avatar existente. Só
aparece em expanded quando os dados são fornecidos. Não são geradas iniciais a
partir de nomes. Próximo aos nomes, os avatares são decorativos.

## Composição e layout

Reutiliza **Card, Typography, Badge, Avatar e IconButton**. Sem clones de suas
superfícies, textos, status, identidades ou alvos de ação. Card fornece borda
`border/strong`, superfície `bg/surface` e raio `radius/16`.

Compact usa padding/gap `space/16`; expanded usa `space/24`. O padding considera
a borda interna para manter a distância externa do Figma. Header tem gap
`space/12`, textos/status têm gap `space/8`. Equipes têm gap interno `space/12`;
as colunas e o separador usam `space/16`. Placar usa Display/M ou Display/L;
título Heading/M, equipes Label/M e metadados/jogadores Body/S via Typography.

As duas equipes dividem a largura disponível. Abaixo de **17rem úteis** no
contêiner, os blocos empilham preservando a ordem equipe → placar → jogadores.
É uma regra local de layout equivalente a 320 CSS px na escala de referência,
sem criar token de breakpoint. Textos quebram, o painel cresce e nenhum nome
fica oculto por truncamento. Foco dos controles não sofre clipping.

## Resultado e acessibilidade

O componente não calcula vencedor, set, posição nem encerramento. Mesmo um
placar 25 × 21 continua provisório em live. A aplicação só deve fornecer
finished e winnerLabel depois de confirmar o resultado na fonte autoritativa.
O componente apresenta o texto recebido; não valida regras esportivas.

O título nomeia o painel. Badge de status é informativo, sem live region
automática. A leitura segue metadados/status, Time A com placar/jogadores, Time B
com placar/jogadores e resultado. A ação superior tem nome acessível próprio e
alvo de 44; excluir ou editar permanece uma ação separada do resultado.
Para atualizações ao vivo, o produto pode usar um resumo moderado em role=status,
como no exemplo de confirmação. O painel não anuncia cada renderização nem move foco.

## Origem e decisões

[ScoreMatch no Figma](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-56586).
Quatro combinações: duas densidades × dois estados. O contrato e a matriz do
guia definem Live como “Ao vivo”; um texto residual “A confirmar” em um master
foi interpretado conforme esse contrato explícito. Finished só mostra o
vencedor fornecido. Ícones são exports originais usados como máscaras currentColor.
Nenhum token, versão ou dependência foi alterado. Novas exportações chegam ao npm
pela próxima release; o Storybook usa o workspace.

## Score content — edição de placar

O slot nativo do Figma Live (Compact/Expanded) aceita Body composto com Inputs reais do DS.
No React, `scoreContent={{ A: <Input ... />, B: <Input ... /> }}` substitui somente
os valores nas colunas de cada time; preserva labels, jogadores, ação, metadados e footer.
Finished não aceita scoreContent e sempre apresenta os números de teamA/teamB.
`statusLabel` permite “Em andamento” sem mudar o estado estrutural nem inferir resultado.

Os exemplos usam Input real em uma caixa56×56 com tokens size/56, sem card “Placar”
separado. Regras de inteiros, empate, confirmação e persistência pertencem à aplicação.
Fonte atual conferida em10nov2026: instância2184:17980, slot2184:26846, Body com
Inputs2184:27032 e2184:27037. [Figma](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P?node-id=2184-17980).

O Body com scoreContent preserva as duas colunas também em320px, pois Inputs56 cabem nessa composição. O fallback numérico existente continua com a regra de empilhamento anterior.
