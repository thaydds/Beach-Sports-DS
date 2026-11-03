# Status legível. Sem ação implícita.

Badge comunica status ou categoria com texto e ícone decorativo opcional. Não é botão, filtro ou escolha alternável.

```tsx
import { Badge } from '@beachsports/components';
<Badge label="Ao vivo" tone="info" />
<Badge label="Vencedor" tone="success" size="md" />
```

| Prop            | Contrato                                                                         |
| --------------- | -------------------------------------------------------------------------------- |
| label           | Texto obrigatório completo.                                                      |
| tone            | neutral / info / success / warning / danger; padrão neutral.                     |
| size            | sm / md; padrão sm. Mínimos 24/28, padding horizontal 8/10, vertical 4, gap 4/6. |
| icon            | ReactElement decorativo opcional de 12/16. Ausência elimina slot e gap.          |
| ref / atributos | Span nativo sem style, onClick ou tabIndex. Sem anúncio automático.              |

Reutiliza Typography Label/S ou Label/M e text/primary em todos os tons, preservando contraste. Neutral usa bg/sunken, os outros usam status/*-soft. Sem tokens novos, sombra, hover, foco ou disabled. Exemplos de tons usam SVGs originais do Figma.

Texto quebra e cresce além da altura mínima, sem truncamento. Coleções devem permitir wrap. Cor e ícone não substituem texto. Não use danger como botão de excluir. O consumidor pode fornecer role="status" em atualizações relevantes; não transforme toda badge em região viva.

[Figma — Badge](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P?node-id=2098-55656).
