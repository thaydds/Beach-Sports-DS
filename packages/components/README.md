# @beachsports/components

Biblioteca React do Beach Sports DS, com TypeScript e CSS Modules.
O workspace exporta `Button`, `IconButton`, `Typography`, `Card`, `Avatar`,
`Badge`, `Chip`, `Input`, `FormField`, `Checkbox`, `ScoreMatch`, `Ranking`,
`RankingItem`, `PlayerCard`, `MatchCard`, `Loading`, `Modal` e seus tipos. Novas exportações
chegam ao npm pelo fluxo de release; confira o CHANGELOG da versão instalada.

```sh
pnpm add @beachsports/components @beachsports/tokens react react-dom
```

Importe os tokens e o stylesheet uma vez na aplicação:

```ts
import '@beachsports/tokens/css/tokens.css';
import '@beachsports/components/styles.css';
import { Button } from '@beachsports/components';
```

Light é o padrão. Para Dark, aplique `data-theme="dark"` ao `<html>`;
remova o atributo para voltar ao Light. Os componentes consomem
CSS vars sem conhecer o tema. O consumidor fornece a fonte Inter.

`pnpm storybook` inicia a documentação no workspace. `pnpm build:components`
produz ESM, CJS, declarações e `dist/styles.css`. O CSS da biblioteca não instala
reset global nem distribui a fonte. A aplicação fornece Inter.

```tsx
<Button variant="primary" size="md" onClick={salvar}>Salvar</Button>
<Button icon={<MeuIcone />} iconPosition="right">Continuar</Button>
```

`MeuIcone` é fornecido pela aplicação. Veja a API e os estados em
[Button](../../docs/components/button.md) e no Storybook, em **Componentes**.

Para formulários, componha `FormField` (que já usa `Input` e `Typography`),
`Checkbox` e `Button`. Evite reconstruir controles nos exemplos e aplicações.

Para partidas e classificação, use `ScoreMatch` e `Ranking` com `RankingItem`.
Resultados, pontos, posições e desempates são fornecidos pelo produto.

Para carregamento de regiões, use [Loading](../../docs/components/loading.md), sem texto visual.
Para diálogos, componha [Modal](../../docs/components/modal.md) com os controles existentes.
