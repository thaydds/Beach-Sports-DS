# Uma identidade. Com nome completo.

Avatar representa uma pessoa sem interação própria. Use name com nome completo; ao lado de um nome visível, use decorative para evitar repetição. Inter é fornecida pelo consumidor.

```tsx
import { Avatar } from '@beachsports/components';
<Avatar size="md" initials="AN" name="André Nunes" />
<Avatar size="sm" decorative initials="IO" />
<Avatar size="lg" name="Participante" content="fallback" />
```

| Prop              | Contrato                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| size              | sm 32, md 44, lg 64; padrão sm. Os mestres canônicos usam LG 64, apesar da referência introdutória a 56.                       |
| name / decorative | Nome completo obrigatório, exceto com decorative=true. Nunca deriva o nome acessível das iniciais.                             |
| initials          | Uma ou duas unidades de grafema, preservando acentos; vazio ou mais de duas usa fallback. Não gera iniciais a partir de nomes. |
| content           | initials / fallback; padrão initials. Fallback força ícone genérico.                                                           |
| src               | Imagem do consumidor; object-fit cover. Erro recupera iniciais ou ícone; uma nova URL pode ser tentada.                        |
| ref / atributos   | Span passivo, sem style, onClick, tabIndex ou estados de botão.                                                                |

Os exemplos de Card importam este Avatar: não existe desenho local duplicado. Geometria size/32,44,64, radius/pill, borda subtle, accent/soft e accent/fg. SM usa Typography Label/S; MD Label/M; LG Display/M. A caixa acompanha a escala de fonte raiz nas engines com divisão tipada, preservando proporção com o texto.

Fallback usa os SVGs originais do Figma em 16/22/32. O ícone ocupa metade da caixa, sem inventar token size/22. Não há fotos inventadas: a imagem é fornecida pelo consumidor. Sem variante de tema, interação ou status. Se houver ação, o controle externo fornece semântica, alvo e foco.

[Figma — Avatar](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P?node-id=2098-57263).

## Composição com partidas e classificação

As stories de Ranking e ScoreMatch reutilizam o Avatar público como identidade decorativa ao lado do nome. A densidade define seu tamanho; a inicial continua sendo fornecida pelo consumidor.
