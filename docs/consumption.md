# Do token ao componente.

O Beach Sports DS oferece tokens, Button e IconButton no workspace. A publicação
no npm depende do fluxo de release. Os exemplos abaixo explicam como consumir
os estilos e o contrato compartilhado.

## 1. Abra o workspace

Use Node 24 e a versão do pnpm fixada no `packageManager`.

```sh
corepack enable pnpm
pnpm install
pnpm build:tokens
pnpm storybook
```

O Storybook abre em `http://127.0.0.1:6006`. Explore Cores, Tipografia e Espaço e
geometria para escolher tokens; consulte o Contrato dos tokens para os detalhes.

## 2. Importe os tokens uma vez

No ponto de entrada da aplicação ou do ambiente de desenvolvimento:

```tsx
import '@beachsports/tokens/css/tokens.css';
import '@beachsports/components/styles.css';
import { Button } from '@beachsports/components';
```

O Storybook já importa os tokens e renderiza os estilos dos componentes. Os pacotes são conectados
por pnpm workspaces. A instalação pelo npm será possível depois da publicação.

O consumidor também deve carregar a fonte Inter, por exemplo com um `@font-face`
apontando para seu arquivo local licenciado, nos pesos usados (400, 600 e 700).
O pacote de tokens declara a família, mas não distribui a fonte. O Storybook
possui sua própria cópia local licenciada exclusivamente para a documentação.

```tsx
<Button onClick={salvar}>Salvar</Button>
```

O CSS agregado da biblioteca contém apenas estilos dos componentes. O consumidor
mantém seu próprio reset. Consulte **Componentes / Button** e **IconButton** no
Storybook para variantes, ícones, loading e exemplos de formulário.

## 3. Escolha o token pela função

| Necessidade                  | Grupo                    | Exemplos                                                  |
| ---------------------------- | ------------------------ | --------------------------------------------------------- |
| Fundo e conteúdo de ação     | `color/action`           | `--ds-color-action-default`, `--ds-color-action-fg`       |
| Fundo e texto de conteúdo    | `color/bg`, `color/text` | `--ds-color-bg-surface`, `--ds-color-text-primary`        |
| Limite funcional de controle | `color/border`           | `--ds-color-border-control`                               |
| Erro ou informação           | `color/status`           | `--ds-color-status-danger`, `--ds-color-status-info-soft` |
| Separação entre elementos    | `space`                  | `--ds-space-8`, `--ds-space-16`                           |
| Dimensão de uma caixa        | `size`                   | `--ds-size-24`, `--ds-size-48`                            |
| Cantos e contornos           | `radius`, `stroke`       | `--ds-radius-12`, `--ds-stroke-control`                   |
| Área interativa e foco       | `target`, `focus`        | `--ds-target-min`, `--ds-focus-width`                     |
| Texto                        | `type`                   | `--ds-type-body-m-font-size`                              |

Use papéis semânticos de cor em componentes. A palette é matéria-prima do design:
não use `--ds-palette-blue-500` para simular uma ação. O mesmo papel pode ter cores
diferentes nos dois temas. Status também precisa de texto ou ícone que comunique
seu significado; a cor sozinha não basta.

`space` é espaço vazio; `size` é dimensão. Valores ópticos como 18 e 22 existem
intencionalmente: não arredonde para forçar uma grade. Escolha o valor previsto
para o componente, em vez de escolher apenas pela aparência isolada.

## 4. Use CSS Modules

Exemplo ilustrativo de uma superfície informativa:

```tsx
import styles from './Summary.module.css';

export function Summary() {
  return <p className={styles.summary}>Sua próxima partida começa às 18h.</p>;
}
```

```css
.summary {
  margin: 0;
  padding: var(--ds-space-16);
  border: var(--ds-stroke-subtle) solid var(--ds-color-border-subtle);
  border-radius: var(--ds-radius-16);
  background: var(--ds-color-bg-surface);
  color: var(--ds-color-text-primary);
  font-family: var(--ds-type-body-m-font-family), sans-serif;
  font-size: var(--ds-type-body-m-font-size);
  font-weight: var(--ds-type-body-m-font-weight);
  line-height: var(--ds-type-body-m-line-height);
  letter-spacing: var(--ds-type-body-m-letter-spacing);
}
```

Importe o módulo no React e use `className={styles.summary}`. O build gera nomes
de classes isolados; os valores visuais vêm das variáveis compartilhadas.
Não são necessários Tailwind ou imports dos JSONs de origem.

## 5. Alterne o tema no elemento raiz

```ts
document.documentElement.dataset.theme = 'dark';
// Para voltar ao Light:
delete document.documentElement.dataset.theme;
```

Light é o padrão em `:root`; Dark substitui os papéis semânticos no mesmo nome.
O CSS do componente permanece igual. Aplique o tema no `html` da aplicação.
Não use um container Light aninhado em Dark: o CSS atual não redefine os valores
Light em `[data-theme="light"]`. As comparações lado a lado do catálogo fazem
essa redefinição explicitamente apenas para demonstrar os dois temas.

## 6. Aplique o estilo tipográfico completo

Um estilo contém família, peso, tamanho, altura de linha e tracking. Aplicar só
`font-size` não reproduz a composição. `Control/*` é o texto de controles;
`Label/*` não é um substituto automático. A tag HTML depende da função do texto:
um título precisa da hierarquia correta mesmo quando é pequeno visualmente.

Há dois cuidados nos exports do Figma:

- `font-style` contém nomes como `Regular` e `Semi Bold`. São metadados; não
  aplique esses valores à propriedade CSS `font-style`.
- O tracking canônico está em percentual, mas CSS `letter-spacing` não aceita
  `%`. No tamanho nativo do estilo, use o token `letter-spacing` em px já
  derivado. Para acompanhar uma alteração de tamanho, converta o percentual
  para `em`: `2%` corresponde a `0.02em`, `-1%` a `-0.01em`.

Exemplo de conversão no React, lendo o valor real em vez de duplicá-lo:

```tsx
import { tokens } from '@beachsports/tokens';

const tracking = Number.parseFloat(tokens['--ds-type-label-s-letter-spacing-percent']) / 100;
const style = { letterSpacing: `${tracking}em` };
```

Preserve os exports. Não crie um token de produto novo para contornar esses
metadados. O registro de decisões detalha essas limitações.

## 7. Trate foco e área de toque como parte do componente

Para um controle interativo, preserve o elemento HTML nativo apropriado e sua
navegação por teclado. A área de toque pode ser maior que o ícone visível.

```css
.control {
  min-width: var(--ds-target-min);
  min-height: var(--ds-target-min);
}

.control:focus-visible {
  outline: var(--ds-focus-width) solid var(--ds-color-focus-ring);
  outline-offset: var(--ds-focus-offset);
}
```

Não remova o outline sem um substituto visível. Confira o foco nos dois temas
e sobre as superfícies em que o controle realmente será usado.

## 8. Saiba de onde vem cada arquivo

```text
Figma → export DTCG em packages/tokens/src/
      → Style Dictionary
      → packages/tokens/dist/css, dist/ts e dist/json
      → componentes e catálogo visual
```

Os cinco JSONs são a fonte de dados do build. O catálogo visual lê os artefatos
gerados. `docs/tokens.md` registra orientações e tabelas técnicas; os testes
conferem suas tabelas de cores, geometria e tipografia contra os exports.
Essa verificação não garante que toda orientação em prosa esteja sincronizada.

Não edite `dist/` nem `packages/components/docs/Tokens.mdx`: são gerados.
Quando uma decisão visual mudar, atualize o design e seus exports, regenere os
artefatos e valide o resultado. A sincronização com o Figma é uma etapa explícita;
não existe atualização automática entre o arquivo de design e este repositório.
