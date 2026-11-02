# @beachsports/tokens

Tokens DTCG do Beach Sports DS. Versão inicial preparada; publicação pendente.

```sh
pnpm add @beachsports/tokens
```

```ts
import '@beachsports/tokens/css/tokens.css';
import { tokens, semanticColorRoles } from '@beachsports/tokens';
```

Light é o padrão. Para Dark, aplique `data-theme="dark"` ao `<html>`;
remova o atributo para voltar ao Light. Cada tema expõe os mesmos 34 papéis.
O CSS resolve aliases em build. JSON resolvido e declarações TypeScript estão em `dist/`.

Não edite os cinco JSONs de `src/`: são cópias fiéis do export do design.
Para compilar no workspace: `pnpm exec nx run tokens:build`.
