# Input

Entrada de uma linha para texto, busca, e-mail e outros valores textuais. Use
FormField quando precisar de rótulo, ajuda ou mensagem de erro. Para seleção
booleana, use Checkbox. Placeholder é uma dica e nunca substitui o nome acessível.

## Uso

```tsx
import '@beachsports/tokens/css/tokens.css';
import '@beachsports/components/styles.css';
import { Input, Typography } from '@beachsports/components';

<>
  <Typography as="label" variant="label-m" htmlFor="search">
    Buscar jogador
  </Typography>
  <Input id="search" name="search" type="search" placeholder="Nome ou apelido" />
</>;
```

## Propriedades

| Prop                                | Valores / padrão                                      | Comportamento                                                                   |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `size`                              | `sm`, `md`, `lg` / `md`                               | Alturas mínimas 44, 48 e 56; não é o atributo HTML de quantidade de caracteres. |
| `validation`                        | `none`, `error` / `none`                              | Error mantém borda danger e `aria-invalid`, inclusive em leitura.               |
| `leadingIcon`                       | `ReactElement`, opcional                              | Decorativo, 16 no SM e 20 nos demais. Sem ícone, sem gap vazio.                 |
| `trailingAction`                    | `{ icon, label, onClick?, disabled?, changesValue? }` | IconButton ghost SM real, alvo 44 e `type="button"`.                            |
| `disabled`, `readOnly`              | boolean / false                                       | Sem interação ou somente leitura, respectivamente.                              |
| `value`, `defaultValue`, `onChange` | atributos nativos                                     | Edição controlada ou não controlada. Não misture os dois modos.                 |
| `type`                              | text, search, email, password, tel, url, number       | Controles de uma linha; checkbox tem componente próprio.                        |
| `className`                         | string                                                | Layout do contêiner. `ref` aponta ao input nativo.                              |

`id`, `name`, `required`, `autoComplete`, `inputMode`, `pattern`, limites, eventos
e relações ARIA são encaminhados ao input. O consumidor deve fornecer um label
associado, `aria-label` ou `aria-labelledby`. Não há prop de tema, hover, foco ou
conteúdo preenchido: o navegador determina esses estados.

## Estados, geometria e tokens

Superfície `bg/surface`, texto `text/primary`, placeholder e ícone
`text/secondary`, borda `border/control` com `stroke/subtle` e raio `radius/12`.
SM/MD/LG usam padding horizontal `space/12,16,20` e gap `space/8`. O padding
desconta a borda interna para manter os slots estáveis quando ela engrossa.
SM/MD usam Body/M; LG usa Body/L. As conversões para rem, line-height sem unidade
e tracking em em seguem a mesma escala de referência de Typography, sem alterar
as fontes DTCG. Em ampliação de texto, a altura pode crescer para não cortar o valor.

Hover em dispositivos com ponteiro usa `action/default` e `stroke/control`.
Erro tem prioridade sobre hover; foco usa um anel independente com
`focus/width`, `focus/offset` e `color/focus/ring`. ReadOnly usa `bg/sunken`,
continua na ordem de Tab e permite selecionar/copiar. Disabled tem prioridade
visual, usa `action/disabled-bg`, `action/disabled-fg` e `border/strong`, sem
opacidade global; sua validação continua disponível na semântica.

A ação final tem foco próprio e nunca submete o formulário. `changesValue` é
true por padrão: em readOnly, ações mutáveis ficam desabilitadas. Use
`changesValue: false` somente para ações informativas que preservam o valor.
Disabled bloqueia todas as ações. Ícones são decorativos; `label` nomeia a ação.

O campo ocupa a largura disponível. Valor longo permanece em uma linha e pode
ser percorrido ao editar/selecionar; nenhum texto é truncado nos dados. Não há
limpeza automática, máscara, validação de negócio nem revelação de senha automática.

## Origem e composição

[Input no Figma](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-57538).
O contrato de 48 variantes do Figma é representado por tamanhos, flags nativos,
validação e conteúdo real. Foco e hover são interações, não props de simulação.
Os ícones de exemplo são exports originais do Figma; o componente não impõe
biblioteca de ícones. Nenhum token foi criado ou alterado.

Os exemplos de Typography, o formulário de Button e os controles de busca e
prévia nos fundamentos usam este Input diretamente ou através de FormField.
Disponível no workspace; a nova exportação npm depende da próxima release.
