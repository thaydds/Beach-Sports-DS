# Uma escala. Semântica escolhida pelo conteúdo.

Typography aplica as nove combinações do Figma: Display L/M, Heading L/M, Text L/M/S e Label M/S. Text reutiliza os tokens Body. Os estilos Control continuam exclusivos dos botões.

## Uso

```tsx
import '@beachsports/tokens/css/tokens.css';
import '@beachsports/components/styles.css';
import { Typography } from '@beachsports/components';

<Typography as="h2" variant="heading-l">Jogadores confirmados</Typography>
<Typography tone="secondary">Confira os participantes.</Typography>
<Typography as="label" variant="label-m" htmlFor="name">Nome</Typography>
```

## Contrato

| Prop                    | Valores / padrão                                        | Finalidade                            |
| ----------------------- | ------------------------------------------------------- | ------------------------------------- |
| variant                 | display-l/m, heading-l/m, text-l/m/s, label-m/s; text-m | Aparência tipográfica                 |
| as                      | p, span, h1–h6, label; p                                | Semântica HTML independente do visual |
| tone                    | primary, secondary, muted, inherit; primary             | Cor semântica, herdando Light/Dark    |
| children                | ReactNode obrigatório                                   | Conteúdo, incluindo texto multilinha  |
| ref / atributos nativos | Conforme elemento                                       | id, ARIA e htmlFor em label           |

`role` permanece um atributo ARIA nativo. Não há Role visual na API: `variant` representa apenas combinações válidas. Não há prop style, tamanho arbitrário, truncamento ou margem própria. Classes do consumidor podem organizar o layout; não substitua os tokens internos.

## Unidades e fonte

A fonte Inter é fornecida pelo consumidor. CSS Modules usa os tokens existentes; nenhum DTCG foi alterado. Em navegadores com divisão tipada de CSS, font-size é convertido para rem em relação à escala de referência de 16, line-height é uma razão sem unidade e tracking é convertido para em. O tracking derivado em px tem paridade com o percentual canônico. Engines antigas mantêm os comprimentos originais dos tokens como fallback.

## Acessibilidade

Escolha h1–h6 pela estrutura do documento, sem saltar níveis por estética. Label visual não cria associação de formulário: use as="label" e htmlFor. Texto cresce com as quebras de linha, sem altura máxima; preserva zoom e espaçamento personalizado. Use muted somente para metadados não essenciais e valide contraste na superfície consumidora.

## Referência visual

[Figma — Typography](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P?node-id=2093-3242). Nove combinações; não criar Display S, Heading S ou Label L.
