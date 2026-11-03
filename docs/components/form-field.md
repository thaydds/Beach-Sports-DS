# FormField

Campo completo composto por rótulo persistente, **Input da biblioteca** e uma
mensagem opcional. Use para cadastros e formulários. Use Input diretamente quando
o contexto já fornece seu rótulo; para listas de seleção, use Checkbox.

## Uso

```tsx
import '@beachsports/tokens/css/tokens.css';
import '@beachsports/components/styles.css';
import { FormField } from '@beachsports/components';

<FormField
  label="Nome do jogador"
  name="player"
  required
  placeholder="Nome ou apelido"
  helper="Use o nome pelo qual o jogador é conhecido."
/>;
```

No contexto do formulário, explique que campos com * são obrigatórios.

## Propriedades

| Prop               | Tipo / padrão                               | Regra                                                                  |
| ------------------ | ------------------------------------------- | ---------------------------------------------------------------------- |
| `label`            | string obrigatória                          | Rótulo visível, associado por `htmlFor`; não pode ser removido.        |
| `helper`           | string opcional                             | Orientação quando validation é none; quebra em múltiplas linhas.       |
| `validation`       | `none`, `error` / `none`                    | Sincroniza a borda e a semântica do Input.                             |
| `errorMessage`     | string obrigatória com `validation="error"` | Substitui helper; a API impede mensagem de erro sem validação de erro. |
| `required`         | boolean / false                             | Atributo nativo e asterisco visual decorativo.                         |
| `size`             | `sm`, `md`, `lg` / `md`                     | Encaminhado ao Input, sem nova escala.                                 |
| `id`               | string opcional                             | Se ausente, gera ID único com useId, compatível com SSR.               |
| `aria-describedby` | string opcional                             | Preserva relações externas e acrescenta a mensagem exibida.            |
| `className`        | string                                      | Layout externo do campo; ref aponta ao input.                          |

As demais props de Input, incluindo value/defaultValue/onChange, disabled,
readOnly, leadingIcon, trailingAction e atributos de formulário, são encaminhadas
ao controle. Não recebe children arbitrários: a composição desta versão é o
Input especificado no Figma. O nome acessível vem do label visível.

## Layout e acessibilidade

Layout vertical com `space/8` entre rótulo, controle e mensagem. Header usa
Typography Label/M com texto primário, gap `space/4` e asterisco secundário à
direita. Mensagem usa Typography Text/S (Body/S), `text/secondary` e gap
`space/6`; erro acrescenta o circle-alert de 16 exportado do Figma. A mensagem
mantém o texto secundário do master: o erro é distinguido também pela borda,
pelo ícone, pelo conteúdo da mensagem e por `aria-invalid`.

Sem mensagem não há espaço reservado nem ID referenciado inexistente. Erro e
ajuda nunca são exibidos juntos. Rótulo e mensagem continuam legíveis quando
o Input está desabilitado. Textos longos quebram e fazem o campo crescer.
Foco, readOnly e disabled continuam pertencendo ao Input real.

A mensagem é conectada por `aria-describedby`. Não há `role="alert"`
automático: em validação após submit, o consumidor deve definir sua estratégia
de anúncio e foco (por exemplo, focar o primeiro campo inválido usando o ref).
Validação de negócio, textos e momento de exibir erro pertencem à aplicação.

## Origem e exemplos

[Form Field no Figma](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-58176).
O FormField não duplica a geometria ou o CSS do Input. Reutiliza também Typography.
O Storybook inclui tamanhos, erro com leitura/disabled, textos longos e um
cadastro dentro de Card com Checkbox, Button, Avatar e Badge reais.
O formulário de Button e os controles dos fundamentos também foram migrados.
Nenhum token foi criado ou alterado. Disponível no workspace; npm acompanha a release.
