# @beachsports/components

Base da biblioteca React do Beach Sports DS, com TypeScript e CSS Modules.
Ainda não há componentes exportados; implementação e publicação são próximas etapas.

```sh
pnpm add @beachsports/components @beachsports/tokens react react-dom
```

Importe os tokens uma vez na aplicação:

```ts
import '@beachsports/tokens/css/tokens.css';
```

Light é o padrão. Para Dark, aplique `data-theme="dark"` ao `<html>`;
remova o atributo para voltar ao Light. Os futuros componentes consumirão
CSS vars sem conhecer o tema. O consumidor fornece a fonte Inter.

`pnpm storybook` inicia a documentação no workspace. `pnpm build:components`
produz ESM, CJS e declarações. Não há stylesheet agregado enquanto não houver componentes.
