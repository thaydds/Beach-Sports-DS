# Checkbox

Seleciona uma opção independente ou múltiplos itens de uma lista. O estado
parcial indica que parte de um grupo está selecionada. Para uma única opção
entre alternativas exclusivas, use um padrão de seleção única; não force esse
comportamento com Checkbox. Não use mixed como um valor adicional de negócio.

## Uso

```tsx
import '@beachsports/tokens/css/tokens.css';
import '@beachsports/components/styles.css';
import { Checkbox } from '@beachsports/components';

<Checkbox label="Confirmar presença na próxima partida" name="confirmed" />;
```

## Propriedades

| Prop                                      | Tipo / padrão      | Regra                                                                 |
| ----------------------------------------- | ------------------ | --------------------------------------------------------------------- |
| `label`                                   | string obrigatória | Texto visual e nome acessível. Também obrigatório sem texto visual.   |
| `showLabel`                               | boolean / true     | false remove texto e gap; label vira aria-label.                      |
| `size`                                    | `sm`, `md` / `md`  | Controle de 20/24 e alvo mínimo de 44/48.                             |
| `checked`, `defaultChecked`, `onChange`   | atributos nativos  | Controlado ou não controlado; não misture os modos.                   |
| `indeterminate`                           | boolean / false    | Sincroniza a propriedade nativa indeterminate, com semântica parcial. |
| `disabled`                                | boolean / false    | Remove da navegação por teclado e preserva a marca.                   |
| `name`, `value`, `required`, `form`, `id` | atributos nativos  | Encaminhados ao input real, assim como eventos e aria-describedby.    |
| `className`                               | string             | Layout do label externo. ref aponta ao input nativo.                  |

Não há prop readOnly: Checkbox é um controle de seleção. Foco e hover vêm do
navegador. Sem variante de tema; as CSS variables definem Light/Dark.

## Comportamento e acessibilidade

É um `input type="checkbox"` real com label associado. Clique no texto, no
controle ou no alvo inteiro ativa a mesma opção uma única vez; Tab navega e
Espaço alterna. O estado parcial usa a propriedade DOM `indeterminate`, lida
pelas tecnologias assistivas como mixed. Uma ativação nativa limpa o estado
parcial; no exemplo controlado, o consumidor recalcula esse estado a partir
dos itens selecionados.

`name` e `value` participam do FormData apenas quando o checkbox está marcado
e habilitado. `indeterminate` não envia um valor extra: checked continua
determinando o envio. O reset do formulário segue os padrões nativos de checked;
grupos controlados precisam restaurar seu próprio estado. O componente não
gerencia grupos nem seleciona itens externos automaticamente.

O rótulo usa Typography Label/M e pode ocupar várias linhas. Controle fica
alinhado ao início do texto. Padding vertical e gap usam `space/12`; raio do
controle `radius/4`, borda `stroke/control`, raio do alvo `radius/8`.
Sem texto visual, o alvo continua quadrado com 44 ou 48.

Unchecked usa `bg/surface` e `border/control`; checked e mixed usam
`action/default` com marca `action/fg`. Hover não selecionado usa `bg/sunken`;
selecionado usa `action/hover`. Disabled usa `action/disabled-bg`,
`action/disabled-fg` e `border/subtle`, mantendo check/traço. O anel envolve o
alvo todo, com `focus/width`, `focus/offset` e `color/focus/ring`. Cores de sistema
preservam os controles no modo de alto contraste.

## Origem e composição

[Checkbox no Figma](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-58864).
Check e traço são assets originais do Figma usados como máscaras currentColor;
nenhum ícone foi redesenhado. Nenhuma fonte DTCG foi alterada.
Storybook mostra tamanhos, valores, disabled, multilinha, ausência de texto
visual e seleção parcial real de jogadores. O cadastro de Card também usa este
Checkbox. Disponível no workspace; a exportação npm depende da próxima release.
