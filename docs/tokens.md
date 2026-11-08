# Beach Sports DS · Tokens

Referência completa da camada de tokens do design system (arquivo Figma `volei-app (Copy)`, página `Design System`).
Os exports DTCG em `packages/tokens/src/` são a fonte de dados do build e do catálogo visual.
Este documento registra as orientações de uso e as tabelas técnicas, conferidas contra os exports pelos testes.
O contrato publicado é o JSON DTCG aprovado no Git. O Figma é o ambiente de autoria;
seu snapshot é comparado e revisado antes de mudar o contrato. O build gera
CSS/JS/TS/JSON a partir desse contrato. Não edite artefatos em `dist/`.

O alinhamento inicial preserva os valores dos 272 tokens publicados e adiciona
22 auxiliares existentes no Figma: oito primitivas de line-height, dois
percentuais e doze tracking-px documentais/de compatibilidade. Os auxiliares
não ampliam a escala de produto. Aliases são explícitos em target/focus e nos
campos tipográficos. Percentuais nativos FLOAT do Figma correspondem a strings
com `%` somente nos nomes declarados no adaptador. A migração real e a revisão
visual ainda dependem de aplicar o [plano de alinhamento](../tools/figma-align/README.md)
e obter um novo export.

- Última extração: seção `Design System` (`node 0:1`), 14 seções, fundações `Cores` / `Fontes` / `Espaçamentos`.
- Nomes de token usam `/` (Figma). Nomes de CSS usam `-` com prefixo `--ds-`.

---

## 1. Arquitetura em três camadas

```
palette (69)  →  color semântico (34)  →  componente (não existe token de componente no Figma)
primitivo         papel com modo Light/Dark     usa só o papel
```

Regras:

1. **Componente nunca consome palette.** Só `color/*`, `space/*`, `size/*`, `radius/*`, `stroke/*`, `target/*`, `focus/*` e `type/*`.
2. **Light e Dark são modos da mesma coleção** (`color`). Nunca criar uma segunda coleção nem duplicar tokens por tema no código: um único nome, dois valores.
3. **Nada de valor direto.** Hex, px e duração soltos no componente são bug de implementação, não atalho.
4. Exceção documentada: `support/stroke-1` (`#000000`) existe só como preto de apoio; a opacidade é da pintura, não do token.

### Mapeamento Figma → CSS

| Grupo Figma        | Exemplo Figma                  | CSS custom property                                |
| ------------------ | ------------------------------ | -------------------------------------------------- |
| `palette/*`        | `blue/500`                     | `--ds-palette-blue-500`                            |
| `color/*`          | `action/default`               | `--ds-color-action-default`                        |
| `type/<estilo>/*`  | `label-s/font-size`            | `--ds-type-label-s-font-size`                      |
| `type/*` primitivo | `family/primary`, `weight/600` | `--ds-type-family-primary`, `--ds-type-weight-600` |
| `space/*`          | `space/16`                     | `--ds-space-16`                                    |
| `size/*`           | `size/44`                      | `--ds-size-44`                                     |
| `radius/*`         | `radius/pill`                  | `--ds-radius-pill`                                 |
| `stroke/*`         | `stroke/control`               | `--ds-stroke-control`                              |
| `target/*`         | `target/min`                   | `--ds-target-min`                                  |
| `focus/*`          | `focus/offset`                 | `--ds-focus-offset`                                |

A regra de conversão é mecânica: `nome` → `--ds-` + nome com `/` trocado por `-`, tudo minúsculo. Nenhum alias manual, nenhum nome novo inventado no código.

---

## 2. Palette · 69 primitivos

Não usar direto em componente. Serve para compor papéis semânticos e para exceções aprovadas.

### blue — azul de ação (Light)

| Token    | CSS var                 | Hex     |
| -------- | ----------------------- | ------- |
| blue/50  | `--ds-palette-blue-50`  | #EAF1FB |
| blue/100 | `--ds-palette-blue-100` | #D0E0F6 |
| blue/200 | `--ds-palette-blue-200` | #A3C1EC |
| blue/300 | `--ds-palette-blue-300` | #6F9DDF |
| blue/400 | `--ds-palette-blue-400` | #3D74CE |
| blue/500 | `--ds-palette-blue-500` | #0047AB |
| blue/600 | `--ds-palette-blue-600` | #003D93 |
| blue/700 | `--ds-palette-blue-700` | #003278 |
| blue/800 | `--ds-palette-blue-800` | #00265C |
| blue/900 | `--ds-palette-blue-900` | #001A40 |
| blue/950 | `--ds-palette-blue-950` | #000F26 |

### sky — azul céu (links e informação)

| Token   | CSS var                | Hex     |
| ------- | ---------------------- | ------- |
| sky/50  | `--ds-palette-sky-50`  | #E6F7FD |
| sky/100 | `--ds-palette-sky-100` | #C2ECFA |
| sky/200 | `--ds-palette-sky-200` | #8ADCF5 |
| sky/300 | `--ds-palette-sky-300` | #4CC8EC |
| sky/400 | `--ds-palette-sky-400` | #12B0E0 |
| sky/500 | `--ds-palette-sky-500` | #00A3E0 |
| sky/600 | `--ds-palette-sky-600` | #0085BA |
| sky/700 | `--ds-palette-sky-700` | #006A96 |
| sky/800 | `--ds-palette-sky-800` | #004F71 |
| sky/900 | `--ds-palette-sky-900` | #00344C |

### yellow — areia (ação no Dark, aviso)

| Token      | CSS var                   | Hex     |
| ---------- | ------------------------- | ------- |
| yellow/50  | `--ds-palette-yellow-50`  | #FEF9E7 |
| yellow/100 | `--ds-palette-yellow-100` | #FCF0BF |
| yellow/200 | `--ds-palette-yellow-200` | #F8E27E |
| yellow/300 | `--ds-palette-yellow-300` | #F5D24A |
| yellow/400 | `--ds-palette-yellow-400` | #F1C40F |
| yellow/500 | `--ds-palette-yellow-500` | #D9AE05 |
| yellow/600 | `--ds-palette-yellow-600` | #B08C04 |
| yellow/700 | `--ds-palette-yellow-700` | #866A03 |
| yellow/800 | `--ds-palette-yellow-800` | #5C4902 |
| yellow/900 | `--ds-palette-yellow-900` | #332901 |

### red — sol (erro e destrutivo)

| Token   | CSS var                | Hex     |
| ------- | ---------------------- | ------- |
| red/50  | `--ds-palette-red-50`  | #FDEDEB |
| red/100 | `--ds-palette-red-100` | #FAD5D1 |
| red/200 | `--ds-palette-red-200` | #F4ABA3 |
| red/300 | `--ds-palette-red-300` | #EE8074 |
| red/350 | `--ds-palette-red-350` | #E56A5C |
| red/400 | `--ds-palette-red-400` | #E74C3C |
| red/500 | `--ds-palette-red-500` | #D33A2B |
| red/600 | `--ds-palette-red-600` | #B02E22 |
| red/700 | `--ds-palette-red-700` | #8A241A |
| red/800 | `--ds-palette-red-800` | #631912 |
| red/900 | `--ds-palette-red-900` | #3D0F0B |

### neutral

| Token       | CSS var                    | Hex     |
| ----------- | -------------------------- | ------- |
| neutral/0   | `--ds-palette-neutral-0`   | #FFFFFF |
| neutral/25  | `--ds-palette-neutral-25`  | #F4F6FA |
| neutral/50  | `--ds-palette-neutral-50`  | #F6F8FB |
| neutral/100 | `--ds-palette-neutral-100` | #ECF0F6 |
| neutral/200 | `--ds-palette-neutral-200` | #DCE2EC |
| neutral/300 | `--ds-palette-neutral-300` | #C3CCDA |
| neutral/400 | `--ds-palette-neutral-400` | #98A4B6 |
| neutral/500 | `--ds-palette-neutral-500` | #6E7A90 |
| neutral/600 | `--ds-palette-neutral-600` | #515D73 |
| neutral/700 | `--ds-palette-neutral-700` | #3B4557 |
| neutral/800 | `--ds-palette-neutral-800` | #262E3D |
| neutral/900 | `--ds-palette-neutral-900` | #161C28 |
| neutral/950 | `--ds-palette-neutral-950` | #0B0F18 |

### navy — superfícies do Dark

| Token    | CSS var                 | Hex     |
| -------- | ----------------------- | ------- |
| navy/600 | `--ds-palette-navy-600` | #2E4066 |
| navy/700 | `--ds-palette-navy-700` | #1E2C4A |
| navy/800 | `--ds-palette-navy-800` | #142444 |
| navy/900 | `--ds-palette-navy-900` | #0D1830 |
| navy/950 | `--ds-palette-navy-950` | #071022 |
| navy/975 | `--ds-palette-navy-975` | #040B18 |

### slate

| Token     | CSS var                  | Hex     |
| --------- | ------------------------ | ------- |
| slate/200 | `--ds-palette-slate-200` | #C4CEDF |
| slate/400 | `--ds-palette-slate-400` | #8B99B3 |
| slate/600 | `--ds-palette-slate-600` | #5A6784 |

### green

| Token     | CSS var                  | Hex     |
| --------- | ------------------------ | ------- |
| green/100 | `--ds-palette-green-100` | #DCF3E6 |
| green/400 | `--ds-palette-green-400` | #4FBF86 |
| green/500 | `--ds-palette-green-500` | #2E9E62 |
| green/900 | `--ds-palette-green-900` | #102E22 |

### support

| Token            | CSS var                         | Hex     |
| ---------------- | ------------------------------- | ------- |
| support/stroke-1 | `--ds-palette-support-stroke-1` | #000000 |

---

## 3. Cor semântica · 34 papéis

Tabela canônica. Todo componente usa daqui.

| Papel                 | CSS var                            | Light (alias / hex)      | Dark (alias / hex)       | Uso                                  |
| --------------------- | ---------------------------------- | ------------------------ | ------------------------ | ------------------------------------ |
| bg/base               | `--ds-color-bg-base`               | neutral/50 · #F6F8FB     | navy/950 · #071022       | Fundo de página                      |
| bg/surface            | `--ds-color-bg-surface`            | neutral/0 · #FFFFFF      | navy/900 · #0D1830       | Cards e controles                    |
| bg/raised             | `--ds-color-bg-raised`             | neutral/0 · #FFFFFF      | navy/800 · #142444       | Superfície elevada                   |
| bg/sunken             | `--ds-color-bg-sunken`             | neutral/100 · #ECF0F6    | navy/975 · #040B18       | Áreas rebaixadas                     |
| border/subtle         | `--ds-color-border-subtle`         | neutral/200 · #DCE2EC    | navy/700 · #1E2C4A       | Separador decorativo                 |
| border/strong         | `--ds-color-border-strong`         | neutral/300 · #C3CCDA    | navy/600 · #2E4066       | Contorno decorativo                  |
| border/control        | `--ds-color-border-control`        | text/secondary · #515D73 | text/secondary · #C4CEDF | Limite funcional de controle (3:1)   |
| text/primary          | `--ds-color-text-primary`          | neutral/900 · #161C28    | neutral/25 · #F4F6FA     | Conteúdo principal                   |
| text/secondary        | `--ds-color-text-secondary`        | neutral/600 · #515D73    | slate/200 · #C4CEDF      | Descrição e apoio                    |
| text/muted            | `--ds-color-text-muted`            | neutral/600 · #515D73    | slate/400 · #8B99B3      | Metadados (6,64:1 no Light)          |
| text/inverse          | `--ds-color-text-inverse`          | neutral/0 · #FFFFFF      | navy/950 · #071022       | Texto sobre superfície inversa       |
| action/default        | `--ds-color-action-default`        | blue/500 · #0047AB       | yellow/400 · #F1C40F     | Ação principal                       |
| action/hover          | `--ds-color-action-hover`          | blue/600 · #003D93       | yellow/300 · #F5D24A     | Ponteiro sobre ação                  |
| action/pressed        | `--ds-color-action-pressed`        | blue/700 · #003278       | yellow/500 · #D9AE05     | Ação pressionada                     |
| action/fg             | `--ds-color-action-fg`             | neutral/0 · #FFFFFF      | neutral/900 · #161C28    | Conteúdo da ação                     |
| action/disabled-bg    | `--ds-color-action-disabled-bg`    | neutral/200 · #DCE2EC    | navy/700 · #1E2C4A       | Fundo inativo                        |
| action/disabled-fg    | `--ds-color-action-disabled-fg`    | neutral/400 · #98A4B6    | slate/600 · #5A6784      | Conteúdo inativo                     |
| accent/default        | `--ds-color-accent-default`        | yellow/400 · #F1C40F     | blue/500 · #0047AB       | Destaque de marca                    |
| accent/soft           | `--ds-color-accent-soft`           | yellow/50 · #FEF9E7      | navy/800 · #142444       | Destaque suave e fundo do Avatar     |
| accent/fg             | `--ds-color-accent-fg`             | neutral/900 · #161C28    | neutral/0 · #FFFFFF      | Conteúdo sobre accent/soft           |
| link/default          | `--ds-color-link-default`          | sky/700 · #006A96        | sky/300 · #4CC8EC        | Link com sublinhado/contexto         |
| link/hover            | `--ds-color-link-hover`            | sky/800 · #004F71        | sky/200 · #8ADCF5        | Link sob ponteiro                    |
| focus/ring            | `--ds-color-focus-ring`            | blue/500 · #0047AB       | sky/500 · #00A3E0        | Foco visível, independente do estado |
| status/success        | `--ds-color-status-success`        | green/500 · #2E9E62      | green/400 · #4FBF86      | Sucesso + ícone ou texto             |
| status/success-soft   | `--ds-color-status-success-soft`   | green/100 · #DCF3E6      | green/900 · #102E22      | Fundo de sucesso                     |
| status/warning        | `--ds-color-status-warning`        | yellow/600 · #B08C04     | yellow/400 · #F1C40F     | Aviso + texto explícito              |
| status/warning-soft   | `--ds-color-status-warning-soft`   | yellow/100 · #FCF0BF     | yellow/900 · #332901     | Fundo de aviso                       |
| status/danger         | `--ds-color-status-danger`         | red/500 · #D33A2B        | red/300 · #EE8074        | Ação destrutiva / erro               |
| status/danger-hover   | `--ds-color-status-danger-hover`   | red/600 · #B02E22        | red/200 · #F4ABA3        | Hover destrutivo                     |
| status/danger-pressed | `--ds-color-status-danger-pressed` | red/700 · #8A241A        | red/350 · #E56A5C        | Pressed destrutivo                   |
| status/danger-soft    | `--ds-color-status-danger-soft`    | red/50 · #FDEDEB         | red/900 · #3D0F0B        | Fundo de erro                        |
| status/danger-fg      | `--ds-color-status-danger-fg`      | neutral/0 · #FFFFFF      | red/900 · #3D0F0B        | Conteúdo da ação destrutiva          |
| status/info           | `--ds-color-status-info`           | sky/500 · #00A3E0        | sky/300 · #4CC8EC        | Informação + ícone/texto             |
| status/info-soft      | `--ds-color-status-info-soft`      | sky/50 · #E6F7FD         | navy/800 · #142444       | Fundo informativo                    |

### Regras que não se negociam

- **`text/secondary` e `text/muted` valem o mesmo `#515D73` no Light.** É decisão de contraste, não erro de digitação. Manter os dois tokens; não colapsar em um só, senão o Dark perde a hierarquia (`#C4CEDF` vs `#8B99B3`).
- **`border/control` é alias de `text/secondary`.** Existe para garantir 3:1 no limite do controle sem inventar cor. Em componente, usar `border/control` — não `text/secondary` — para borda de input, checkbox e chip.
- **Azul é ação no Light; amarelo é ação no Dark.** O par `action/*` + `action/fg` já resolve isso. Componente que escreve `#0047AB` ou `#F1C40F` na mão quebra o tema.
- **`accent/*` não é status.** `accent/soft` é identidade (avatar, destaque de marca). Status tem token próprio.
- **`focus/ring` nunca é herdado do estado.** Foco é estado independente, com anel de 2px e offset de 2px.

### Contraste verificado (sobre `bg/surface` Light)

| Par                      | Razão  | Leitura             |
| ------------------------ | ------ | ------------------- |
| text/muted · neutral/600 | 6,64:1 | Texto de apoio      |
| link/default · sky/700   | 6,00:1 | Link padrão         |
| link/hover · sky/800     | 8,91:1 | Link em hover       |
| action/default + branco  | 8,44:1 | Conteúdo de ação    |
| status/danger + branco   | 4,76:1 | Conteúdo destrutivo |

Piso: 4,5:1 em texto comum, 3:1 em texto grande (24px regular ou ~18,67px bold) e em partes funcionais. Avaliar de novo em Dark e sobre `bg/base`, `bg/sunken` e `bg/raised` — e não só no branco.

---

## 4. Tipografia · 12 estilos nativos

Família única: **Inter**. Peso 500 (Medium) e os tamanhos 10, 11, 18 e 40 são apoio documental — não viram variante de produto.

| Estilo     | CSS var base             | Peso | Size / Line | Tracking canônico | Tracking px |
| ---------- | ------------------------ | ---- | ----------- | ----------------- | ----------- |
| Display/L  | `--ds-type-display-l-*`  | 700  | 32 / 38     | -1% (-0.01em)     | -0.32px     |
| Display/M  | `--ds-type-display-m-*`  | 700  | 24 / 30     | -0.5% (-0.005em)  | -0.12px     |
| Heading/L  | `--ds-type-heading-l-*`  | 600  | 20 / 26     | -0.3% (-0.003em)  | -0.06px     |
| Heading/M  | `--ds-type-heading-m-*`  | 600  | 17 / 24     | -0.2% (-0.002em)  | -0.034px    |
| Body/L     | `--ds-type-body-l-*`     | 400  | 16 / 24     | 0%                | 0px         |
| Body/M     | `--ds-type-body-m-*`     | 400  | 15 / 22     | 0%                | 0px         |
| Body/S     | `--ds-type-body-s-*`     | 400  | 13 / 18     | 0%                | 0px         |
| Label/M    | `--ds-type-label-m-*`    | 600  | 14 / 20     | 0%                | 0px         |
| Label/S    | `--ds-type-label-s-*`    | 600  | 12 / 16     | 2% (0.02em)       | 0.24px      |
| Control/SM | `--ds-type-control-sm-*` | 600  | 14 / 18     | 0%                | 0px         |
| Control/MD | `--ds-type-control-md-*` | 600  | 15 / 20     | 0%                | 0px         |
| Control/LG | `--ds-type-control-lg-*` | 600  | 16 / 22     | 0%                | 0px         |

Cada estilo expõe sete campos: `font-family`, `font-weight`, `font-size`, `line-height`, `letter-spacing`, `letter-spacing-percent` e `font-style`.

### Armadilhas

- **Tracking: percentual é o canônico; px é derivado.** `2%` não é `2px`. Implementar com o percentual (`em`), manter o px só para paridade visual com o Figma. Se um tamanho mudar, o px derivado precisa ser recalculado à mão — por isso ele não é fonte de verdade.
- **`Label/M` ≠ label do Button.** Label global é 14/20; os três `Control/*` (14/18, 15/20, 16/22) são os labels dos botões. Não trocar um pelo outro.
- **Line-height não é padding.** A folga vertical de um botão de 48px com label 15/20 é resultado da centralização: `(48 − 20) / 2 = 14`. Não criar token de padding 14.
- **Fonte e peso não definem o HTML.** Escolher `h1..h6`, `p`, `label`, `button` pela função, não pelo tamanho aparente.

---

## 5. Espaço · 21 valores

| Token    | CSS var         | Valor | Uso                                              |
| -------- | --------------- | ----- | ------------------------------------------------ |
| space/0  | `--ds-space-0`  | 0px   | Ausência de espaço                               |
| space/2  | `--ds-space-2`  | 2px   | Ajuste fino                                      |
| space/4  | `--ds-space-4`  | 4px   | Ajuste fino                                      |
| space/6  | `--ds-space-6`  | 6px   | Ajuste fino                                      |
| space/8  | `--ds-space-8`  | 8px   | Conteúdo interno; **gap padrão entre controles** |
| space/10 | `--ds-space-10` | 10px  | Conteúdo interno                                 |
| space/12 | `--ds-space-12` | 12px  | Conteúdo interno                                 |
| space/14 | `--ds-space-14` | 14px  | Conteúdo interno                                 |
| space/16 | `--ds-space-16` | 16px  | Conteúdo interno; padding do Card Compact        |
| space/18 | `--ds-space-18` | 18px  | **Óptico** · padding lateral do Button SM        |
| space/20 | `--ds-space-20` | 20px  | Padding de componentes                           |
| space/22 | `--ds-space-22` | 22px  | **Óptico** · padding lateral do Button MD        |
| space/24 | `--ds-space-24` | 24px  | Padding de grupos; Card Comfortable              |
| space/28 | `--ds-space-28` | 28px  | Padding de grupos; padding lateral do Button LG  |
| space/32 | `--ds-space-32` | 32px  | Padding de grupos                                |
| space/40 | `--ds-space-40` | 40px  | Separação ampla                                  |
| space/48 | `--ds-space-48` | 48px  | Separação ampla                                  |
| space/56 | `--ds-space-56` | 56px  | Separação ampla                                  |
| space/64 | `--ds-space-64` | 64px  | Separação ampla                                  |
| space/80 | `--ds-space-80` | 80px  | Separação ampla                                  |
| space/96 | `--ds-space-96` | 96px  | Separação ampla                                  |

**Não arredondar 18 e 22 para uma grade 4/8.** São refinamentos ópticos do Button e existem porque o texto com tracking 0 parece descentralizado com 16 ou 20.

Padding × gap × margem são coisas distintas: padding é da borda ao conteúdo, gap é entre irmãos, margem é do layout consumidor.

---

## 6. Dimensão, raio, traço, alvo e foco · 30 valores

### size (14)

| Token   | CSS var        | Valor | Onde                               |
| ------- | -------------- | ----- | ---------------------------------- |
| size/0  | `--ds-size-0`  | 0px   | —                                  |
| size/12 | `--ds-size-12` | 12px  | Ícones pequenos                    |
| size/14 | `--ds-size-14` | 14px  | Ícone do Icon Button               |
| size/16 | `--ds-size-16` | 16px  | Ícones em controles                |
| size/20 | `--ds-size-20` | 20px  | Caixa do Checkbox SM               |
| size/24 | `--ds-size-24` | 24px  | Caixa do Checkbox MD; ícones       |
| size/28 | `--ds-size-28` | 28px  | —                                  |
| size/32 | `--ds-size-32` | 32px  | Avatar SM                          |
| size/40 | `--ds-size-40` | 40px  | —                                  |
| size/44 | `--ds-size-44` | 44px  | Button SM / Input SM               |
| size/48 | `--ds-size-48` | 48px  | Button MD / Input MD; Avatar MD    |
| size/56 | `--ds-size-56` | 56px  | Button LG / Input LG; Avatar LG    |
| size/64 | `--ds-size-64` | 64px  | —                                  |
| size/72 | `--ds-size-72` | 72px  | Linha do RankingItem (Comfortable) |

### radius (9)

| Token       | CSS var            | Valor | Onde                               |
| ----------- | ------------------ | ----- | ---------------------------------- |
| radius/0    | `--ds-radius-0`    | 0px   | —                                  |
| radius/2    | `--ds-radius-2`    | 2px   | —                                  |
| radius/4    | `--ds-radius-4`    | 4px   | Checkbox                           |
| radius/8    | `--ds-radius-8`    | 8px   | —                                  |
| radius/12   | `--ds-radius-12`   | 12px  | Input                              |
| radius/16   | `--ds-radius-16`   | 16px  | Card, ScoreMatch, Chip de conteúdo |
| radius/20   | `--ds-radius-20`   | 20px  | —                                  |
| radius/24   | `--ds-radius-24`   | 24px  | —                                  |
| radius/pill | `--ds-radius-pill` | 999px | Button, Chip, Badge, Avatar        |

### stroke · target · focus (7)

| Token              | CSS var                   | Valor | Papel                                               |
| ------------------ | ------------------------- | ----- | --------------------------------------------------- |
| stroke/subtle      | `--ds-stroke-subtle`      | 1px   | Contornos e separadores                             |
| stroke/icon        | `--ds-stroke-icon`        | 1.5px | Traço de ícones                                     |
| stroke/control     | `--ds-stroke-control`     | 2px   | Partes funcionais e estados (hover, erro, selected) |
| target/min         | `--ds-target-min`         | 44px  | Padrão mínimo do DS                                 |
| target/comfortable | `--ds-target-comfortable` | 48px  | Alvo confortável                                    |
| focus/width        | `--ds-focus-width`        | 2px   | Espessura do anel                                   |
| focus/offset       | `--ds-focus-offset`       | 2px   | Afastamento externo                                 |

Anel completo = 2px + 2px = **4px externos**. Reservar essa folga no layout e manter `overflow` visível; o anel não muda padding nem dimensão do controle.

WCAG 2.2 AA pede alvo mínimo de 24×24 CSS px. O DS adota 44×44 e 48×48 — mais confortável, e obrigatório para toque em mobile (base 393px).

---

## 7. Receitas de geometria por componente

Medidas reais dos masters no Figma.

| Componente                        | Altura       | Padding lateral | Padding vertical | Gap              | Raio            |
| --------------------------------- | ------------ | --------------- | ---------------- | ---------------- | --------------- |
| Button SM / MD / LG               | 44 / 48 / 56 | 18 / 22 / 28    | 0 (centralizado) | 8                | pill            |
| Input SM / MD / LG                | 44 / 48 / 56 | 12 / 16 / 20    | 0                | 8                | 12              |
| Chip SM / MD                      | alvo 44 / 48 | 12 / 16         | 0                | 8                | pill            |
| Card Compact / Comfortable        | hug          | 16 / 24         | 16 / 24          | 16 / 24          | 16              |
| Checkbox SM / MD                  | alvo 44 / 48 | —               | —                | 8                | 4 (caixa 20/24) |
| Avatar SM / MD / LG               | 32 / 44 / 56 | —               | —                | —                | pill            |
| ScoreMatch                        | hug          | 16 / 24         | 16 / 24          | 8 / 12 / 16 / 24 | 16              |
| RankingItem Compact / Comfortable | 56 / 72      | 12 / 16         | 0                | 12               | —               |

Altura fixa só onde o controle é rígido. Card, Form Field, mensagens e Ranking crescem com o conteúdo — implementar com `min-height` + padding, nunca com altura travada e `overflow: hidden`.

---

## 8. Mapa componente → tokens

O que cada componente consome. Serve de checklist de implementação e de teste de tema.

| Componente            | Tokens                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button                | `action/default·hover·pressed·fg·disabled-bg·disabled-fg`, `border/strong`, `bg/sunken` (Secondary e Ghost), `status/danger·danger-hover·danger-pressed`, `focus/ring` + `focus/width` + `focus/offset`; geometria `size/44,48,56`, `space/18,22,28,8`, `radius/pill`; texto `Control/SM·MD·LG`                                                                                                        |
| Chip                  | `bg/surface` + `text/primary` com contorno `border/strong` (Default); `action/default` + `action/fg` (Selected); `action/disabled-bg` + `action/disabled-fg` (Disabled); `focus/ring`; `size/44,48`, `space/12,16`, `gap 8`, `radius/pill`; `Label/S·M`                                                                                                                                                |
| Badge                 | tons `status/*-soft` + `text/primary`; `bg/sunken` (Neutral); `size/24,28`, `space/8,10` vertical `4`, gap `4,6`, `radius/pill`; `Label/S·M`. Sem ação, sem foco                                                                                                                                                                                                                                       |
| Card                  | `bg/surface` + `border/strong` (Outlined); `bg/raised` + `border/subtle` (Raised); `text/primary` + `text/secondary`; `space/16,24`, gap interno `8`, `radius/16`, `stroke/subtle`; `Heading/M·L`, `Body/M·S`                                                                                                                                                                                          |
| ScoreMatch            | container `bg/surface` + `border/strong`, raio 16, borda 1; placar `text/primary` + `Display/L·M` + `Label/M`; jogadores `text/secondary` + `Body/S`; status via Badge; `Avatar SM 32`; `Icon Button SM 44`; `accent/soft` + `accent/fg`                                                                                                                                                               |
| Avatar                | `accent/soft` (superfície), `accent/fg` (iniciais), `border/subtle` (contorno 1px); tamanhos `size/32,44,56`; `radius/pill`; iniciais em `Label/S`, `Label/M`, `Display/M`                                                                                                                                                                                                                             |
| Input                 | `bg/surface` + `text/primary`; contorno `text/secondary`/`border/control` (3:1) com placeholder `text/secondary`; hover `action/default` como borda 2; readOnly `bg/sunken` + `text/primary`; disabled `action/disabled-bg` + `action/disabled-fg` + contorno `border/strong`; erro `status/danger`; `focus/ring`; alturas `size/44,48,56`, padding `space/12,16,20`, gap 8, raio 12; texto `Body/M·L` |
| Form Field            | `text/primary` + `text/secondary` (`Label/M`); helper/erro `text/secondary` + `Body/S`; control = Input aninhado; erro `status/danger` + anel `focus/ring`; composição com gap 8                                                                                                                                                                                                                       |
| Checkbox              | unchecked `bg/surface` + `text/secondary` (contorno 2px, raio 4); checked/mixed `action/default` + `action/fg` (stroke 2); hover `action/hover` / `bg/sunken`; disabled `action/disabled-bg` + `action/disabled-fg` + contorno `border/subtle`; `focus/ring`; caixa `size/20,24`, alvo `size/44,48`, gap 12; `Label/M`                                                                                 |
| Ranking / RankingItem | linha `space/12,16`, gap `space/12`, coluna de posição `size/56`, altura `size/56,72`; Avatar `size/32,44`; texto `text/primary` + `text/secondary`; destaque `accent/*`                                                                                                                                                                                                                               |
| Typography            | 12 estilos nativos (`Display`, `Heading`, `Body`, `Label`, `Control`)                                                                                                                                                                                                                                                                                                                                  |

---

## 9. Lacunas conhecidas

Registradas para não virarem surpresa na implementação:

1. **Não existe token de duração/easing.** O Button documenta transições de 150–250ms e `prefers-reduced-motion`, mas não há `motion/*` na coleção. No código: usar 150ms `ease-out` para hover e 250ms para mudanças de superfície, com fallback sem animação.
2. **Não existe token de sombra/elevação.** Card e ScoreMatch são "sem sombra ou interação implícita" — a hierarquia vem de `bg/*` + `border/*`. Não inventar `box-shadow` no código.
3. **Não existe token de ícone por nome.** Os ícones são slots; o tamanho vem de `size/*` e o traço de `stroke/icon`.
4. **Não existe token de z-index, opacity ou breakpoint.** Breakpoint de produto: 393px de base (mobile), conteúdo fluido até 430px, sem grade fixa.
5. **`status/warning` e `action/default` no Dark são o mesmo `#F1C40F`.** Conviver: nunca colocar um contra o outro, e nunca usar amarelo como texto pequeno (`status/warning` é ícone + texto explícito).
