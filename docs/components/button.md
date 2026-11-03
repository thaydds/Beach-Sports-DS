# Uma ação clara. Em cada tamanho.

`Button` executa uma ação com texto; `IconButton` é a opção compacta quando o
ícone é reconhecível no contexto. Ambos renderizam um `<button>` nativo.
Use links para navegação. Evite mais de uma ação Primary por contexto e prefira
verbos específicos, como “Inscrever-se” ou “Salvar time”.

## API de Button

| Prop           | Tipo                                           | Padrão / função                                          |
| -------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `children`     | `ReactNode`                                    | Obrigatório. Texto visível; não inclua outros controles. |
| `variant`      | `primary`, `secondary`, `ghost`, `destructive` | `primary`                                                |
| `size`         | `sm`, `md`, `lg`                               | `md`                                                     |
| `icon`         | `ReactElement`                                 | Opcional. Um ícone decorativo que herda `currentColor`.  |
| `iconPosition` | `left`, `right`                                | `left`; só afeta o ícone.                                |
| `disabled`     | `boolean`                                      | `false`; indisponível e fora da ordem de Tab.            |
| `loading`      | `boolean`                                      | `false`; mantém foco e bloqueia ativação.                |
| `loadingLabel` | `string`                                       | Mensagem acrescentada ao nome da ação durante loading.   |
| `type`         | `button`, `submit`, `reset`                    | `button`; use `submit` explicitamente em formulários.    |
| `className`    | `string`                                       | Ajustes de layout no consumidor.                         |
| `ref`          | `Ref<HTMLButtonElement>`                       | Acesso ao elemento nativo.                               |

Os demais atributos nativos são repassados: `onClick`, `onFocus`, `id`, `name`,
`value`, `form`, `aria-describedby` e `data-*`, por exemplo. `aria-busy` e
`aria-disabled` são controlados pelo componente. Não há props `state`, `focus`,
`theme`, `href`, `asChild` ou `style`. Use a toolbar para alternar Light/Dark;
hover, pressionamento e foco vêm da interação real.

```tsx
import '@beachsports/tokens/css/tokens.css';
import '@beachsports/components/styles.css';
import { Button } from '@beachsports/components';

<Button icon={<MeuIcone />} iconPosition="right" onClick={continuar}>
  Continuar
</Button>;
```

`MeuIcone` é um exemplo do ícone fornecido pela aplicação, não um export do DS.
O slot define as dimensões e oculta o ícone das tecnologias assistivas. Não
coloque links, botões ou outros elementos focáveis dentro dele.

## Hierarquia

Primary é a ação principal. Secondary oferece uma alternativa. Ghost funciona
em barras e listas com menor peso visual. Destructive identifica operações
destrutivas, mas o botão não abre confirmação automaticamente: esse fluxo
pertence à aplicação. Cor não substitui um rótulo explícito.

## Tamanhos e conteúdo

| Tamanho | Altura mínima | Padding lateral | Texto / linha | Ícone |
| ------- | ------------- | --------------- | ------------- | ----- |
| SM      | 44 px         | 18 px           | 14 / 18 px    | 14 px |
| MD      | 48 px         | 22 px           | 15 / 20 px    | 16 px |
| LG      | 56 px         | 28 px           | 16 / 22 px    | 20 px |

O texto usa Control/SM, MD ou LG, Inter 600. O gap é 8 px e o raio é pill.
Rótulos curtos reproduzem a altura do Figma. Rótulos longos quebram em linhas
e aumentam a altura, sem truncamento nem corte do texto. O componente respeita
a largura disponível. Prefira textos curtos; `className` pode definir a largura
no layout. Reserve ao menos 8 px entre alvos e 4 px externos para o anel de foco.

## Estados e loading

Tab move o foco; Enter e Espaço ativam o botão. O anel de foco é independente
da variante, com espessura de 2 px e offset de 2 px. Não corte o outline no pai.

Loading usa `aria-busy` e `aria-disabled`, preserva o foco e cancela cliques,
ativações por teclado e o submit disparado pelo próprio botão. O estado é
controlado pela aplicação, que deve evitar operações concorrentes também na
camada de negócio. `form.submit()` e chamadas externas não passam pelo botão.

Sem ícone, o texto fica visualmente transparente para manter a largura e o nome
acessível; o spinner fica centralizado. Com ícone, o spinner ocupa seu slot e o
texto continua visível. `loadingLabel` acrescenta uma mensagem ao nome acessível,
preservando o texto da ação para comandos de voz (por exemplo, “Salvar Salvando
inscrição”). Caso use `aria-labelledby`, esse nome composto tem prioridade
temporária. Para comunicar
o resultado da operação, forneça uma região de status no formulário.

Disabled tem prioridade quando ambos os flags estão ativos. Ele usa o atributo
nativo `disabled`; o loading sozinho continua na ordem de Tab. O retorno do
estado não desloca o foco automaticamente.

As transições de cor duram 150 ms; o indicador gira em um ciclo de 900 ms.
São escolhas locais de movimento, sem criar tokens. `prefers-reduced-motion`
remove as transições e a rotação, mantendo o indicador e a semântica de busy.

## Origem e decisões

Referência: [Button no Figma](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2087-2799).
Valores vêm exclusivamente dos tokens existentes; nenhuma fonte DTCG foi alterada.
Secondary usa `stroke/icon` (1,5 px), `border/strong` e texto `text/primary`.
Ghost usa `text/secondary`; ambos usam `bg/sunken` em hover e pressed.
Primary e Destructive usam seus papéis de ação/status em cada estado.

A nota geral do Figma descreve spinner central; os exemplos de Button Icon
mostram spinner no slot com texto visível. Seguimos os exemplos por composição,
conforme o plano aprovado. A altura mínima adapta o desenho de uma linha para
conteúdo longo. Há um único ícone por Button, com posição esquerda ou direita.

O spinner e o chevron dos exemplos são exports exatos do Figma usados como
máscaras CSS, preservando `currentColor` nos dois temas. Chevron é apenas um
exemplo documental; nenhuma biblioteca de ícones é imposta ao consumidor.

Os componentes estão disponíveis no workspace. A publicação npm depende do
fluxo de release e da configuração de Trusted Publishing descrita em releases.

## Composição com formulários

O exemplo de envio de formulário usa FormField e Input da biblioteca, preservando o bloqueio de envios durante loading.
