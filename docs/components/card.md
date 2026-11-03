# Conteúdo agrupado. Ações explícitas.

Card é um contêiner passivo para conteúdo relacionado. Combina Typography, conteúdo livre e controles existentes. Não é um botão, link ou menu. Não use para tornar toda uma superfície clicável.

## Uso

```tsx
import { Card, Button, Typography } from '@beachsports/components';

<Card
  as="article"
  title="Jogadores confirmados"
  density="comfortable"
  description="Confira os participantes."
  footer={<Button size="sm">Confirmar</Button>}
>
  <Typography variant="text-s" tone="secondary">
    3 jogadores
  </Typography>
</Card>;
```

Importe os estilos dos tokens e da biblioteca uma vez, conforme Como usar, e forneça Inter.

## API

| Prop                    | Valores / padrão               | Comportamento                                                         |
| ----------------------- | ------------------------------ | --------------------------------------------------------------------- |
| surface                 | outlined / raised; outlined    | Superfície e borda sem sombra                                         |
| density                 | compact / comfortable; compact | Padding e gaps 16/24; título Heading M/L                              |
| as                      | div / article / section; div   | Semântica conforme contexto                                           |
| title / description     | ReactNode opcional             | Descrição secondary; omitir remove seu espaço                         |
| titleAs                 | h1–h6 / p; h2                  | Hierarquia escolhida pelo consumidor                                  |
| action                  | ReactNode opcional             | Controle no topo direito; use IconButton SM Ghost com nome específico |
| children                | ReactNode opcional             | Conteúdo do domínio                                                   |
| footer                  | ReactNode opcional             | Ações substituíveis, com quebra de linha e gap 12                     |
| ref / atributos nativos | HTMLElement                    | ARIA e atributos nativos; sem style, onClick ou tabIndex              |

Slots ausentes não produzem wrappers vazios. Cabeçalho desaparece se título, descrição e ação forem omitidos; não há flags show duplicando a presença do conteúdo. Os exemplos importam Avatar da biblioteca; não há implementação local de avatar no Card. O corpo e o rodapé não impõem conteúdo padrão.

## Tokens e comportamento

Outlined usa bg/surface + border/strong; Raised usa bg/raised + border/subtle. Ambos usam stroke/subtle, radius/16, padding/gap 16 ou 24; título/descrição têm gap 8 e cabeçalho/ação têm gap 16. Sem sombra inventada, hover ou foco no Card. Cores acompanham Light/Dark automaticamente.

Largura ocupa o container e altura acompanha o conteúdo. A largura de 520 do master é demonstrativa; 280 é recomendação de layout, não min-width rígido. Textos longos quebram, rodapé permite wrap, overflow permanece visível para preservar o foco dos controles. O consumidor define grid, largura e espaçamento externo.

## Acessibilidade e ações

Título recebe id único e nomeia o contêiner; aria-label ou aria-labelledby explícitos têm prioridade. Defina titleAs conforme a hierarquia da página. Somente controles internos participam da ordem de tabulação. Use action com IconButton size="sm" variant="ghost", nome contextual e estado controlado pelo consumidor. Menu, exclusão e confirmação não integram Card: exclusão deve usar intenção destructive e confirmação no contexto apropriado.

[Figma — Card](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P?node-id=2098-55960). O SVG ellipsis dos exemplos foi exportado sem edição do master; não integra o pacote publicado.

## Composição de participantes

Os exemplos importam Avatar MD da biblioteca, preservando nome completo e fallback. A story “Avatar, Chip e Badge da biblioteca” também demonstra seleção controlada com Chip e status textual com Badge. Essas peças pertencem ao corpo consumidor; Card continua sem dependência de domínio ou conteúdo padrão.
