# Selecionar e remover. Ações independentes.

Chip é uma escolha alternável ou filtro. Selecionar e remover usam botões irmãos: nunca existe botão aninhado. Use Badge para status passivo e Button para ação principal.

```tsx
import { Chip } from '@beachsports/components';
<Chip
  label="André"
  selected={selected}
  onSelectedChange={setSelected}
  onRemove={() => removePlayer(id)}
/>;
```

| Prop                        | Contrato                                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| label                       | Nome completo obrigatório, com quebra de linha.                                                                         |
| size                        | sm / md; padrão sm. Altura mínima 44/48, padding 12/16, gap 8.                                                          |
| selected / onSelectedChange | Controlado, callback obrigatório; botão com aria-pressed.                                                               |
| disabled                    | Desabilita as duas ações e tem prioridade nas cores.                                                                    |
| icon                        | ReactElement decorativo opcional 16/20; selected apresenta check original quando há ícone. Ausência elimina slot e gap. |
| onRemove / removeLabel      | Remoção opcional; nome padrão “Remover {label}”, substituível; alvo independente de 44.                                 |
| ref / atributos             | Span raiz sem style, onClick ou tabIndex.                                                                               |

Reutiliza Typography Label/S e Label/M. Default usa bg/surface, border/strong e text/primary; Selected usa action/default e action/fg; Disabled usa action/disabled-bg/fg e border/strong. Focus é nativo com focus/width, focus/offset e color/focus/ring, no contorno inteiro e no alvo de remoção. Sem Focus ou State artificial, sem cores ou tokens novos.

O Chip desativa o destaque nativo de toque nos dois botões internos para evitar um flash limitado à região do texto ou do ícone. A seleção continua pintando o contêiner inteiro; o foco por teclado permanece no contorno do Chip e no alvo independente de remoção. Aplicações consumidoras não precisam adicionar um reset global de destaque de toque.

Botões têm type="button": não submetem o formulário. Remover não dispara seleção. O consumidor gerencia foco após remoção; no exemplo ele segue para Restaurar. Coleções devem permitir wrap, preservar nomes e não cortar foco. A altura cresce com texto longo; ícones e remoção não encolhem. Inter é fornecida pelo consumidor.

[Figma — Chip](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P?node-id=2098-55286).
