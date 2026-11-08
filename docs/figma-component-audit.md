# Auditoria de componentes Figma → DS

Export: `2026-11-08T02:44:47.179Z`. SHA-256: `e9aa82268e2073042ebd20747116b11f2fbe037e2a4233a49c17f81e51603f6a`.
Base de código: `93755fe` (tokens 0.1.1, components 0.4.2).

**Resultado: tokens e estilos de texto coincidem; paridade completa ainda exige resolver as lacunas de design e composição abaixo.**

## Inventário e correspondência

Foram inventariados os 14 conjuntos e as 379 variantes reais da página Design System. Não foi inventado um produto cartesiano de opções ausentes. O JSON de contrato é uma projeção do export original, com IDs, propriedades, geometria, papéis de cor e partes do Card; não contém imagens nem detecção de cópias manuais.

| Figma                                                                                                  | Variantes | Correspondência no código                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | --------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [Button](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2087-4001)       |        60 | Button; Style → variant, Size → size, State → estados nativos/loading/disabled; Focus → :focus-visible.                                      |
| [Button Icon](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2087-4002)  |       120 | Button + icon/iconPosition; Show icon → presença do slot. Mesmo ButtonBase.                                                                  |
| [Icon Button](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2087-4003)  |        60 | IconButton; Style/Size/State → ButtonBase; nome acessível obrigatório.                                                                       |
| [Typography](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2093-3663)   |         9 | Typography; Display/Heading/Text/Label → nove variantes; Body/* → text-*.                                                                    |
| [Avatar](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-60339)      |         6 | Avatar; Size/Content/Initials/Visual → size/content/initials/src.                                                                            |
| [Chip](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-60346)        |         6 | Chip; Size/Selected/Disabled/Removable/Leading icon → size/selected/disabled/onRemove/icon.                                                  |
| [Badge](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-60357)       |        10 | Badge; Size/Tone/Label/Leading icon → size/tone/label/icon.                                                                                  |
| [Input](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-60382)       |        48 | Input; Size/State/Validation/Content → size/disabled/readOnly/validation/value/placeholder; ícones e ação em slots.                          |
| [Checkbox](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-60401)    |        18 | Checkbox; Value → checked/indeterminate; State → disabled/:hover; Show label → showLabel.                                                    |
| [ScoreMatch](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-60435)  |         4 | ScoreMatch; Density/State → density/state; times/placares/metadata/posição/vencedor/ação/children nos slots existentes.                      |
| [Form Field](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2098-60467)  |        24 | FormField; Input público + label/helper/errorMessage/required; Show message → presença da mensagem.                                          |
| [RankingItem](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2101-76704) |         4 | RankingItem; Density/Emphasis → density/emphasis; avatar e informações opcionais preservados.                                                |
| [Ranking](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2101-76707)     |         2 | Ranking; Density/Title/Description/Items → density/title/description/children.                                                               |
| [Card](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P/volei-app--Copy-?node-id=2130-14749)        |         8 | PlayerCard e MatchCard adicionados: Default/Hover/Selected/Disabled → padrão/:hover/selected/disabled. Card composicional antigo preservado. |

## Tipografia

Os 12 estilos locais têm os mesmos valores de família, estilo, peso, tamanho, altura de linha e tracking dos tokens em Light/Dark. Os cinco vínculos de variáveis por estilo apontam para o token canônico correto. O comparador agora detecta estilo ausente, desconhecido, valor divergente e vínculo removido. O fato de um estilo estar correto não prova que toda camada de texto esteja vinculada a ele.

## Correção implementada

O contrato Card/Player e Card/Match estava ausente. A implementação anterior atendia ao contêiner composicional usado por ScoreMatch/Ranking e pelo app; esse contêiner permanece compatível. Foram adicionados PlayerCard e MatchCard com seleção controlada opcional, botão nativo para seleção, estado desabilitado, foco, cores e geometria do master.

O avatar estreito de altura 48px e o badge de 11px do Card são frames locais no Figma, sem mainComponent de Avatar/Badge. Reutilizar as versões circulares/de 24px da biblioteca alteraria o desenho. Os novos cards compartilham uma implementação interna; usam os tokens existentes, inclusive size/48, space/2 e type/size/11, sem criar tokens. AUTO line-height permanece normal. Essa exceção de uso de 11px vem do master, embora o token ainda esteja descrito como documental.

## Pendências que pertencem ao design

### Contraste dos badges Light (bloqueia certificação de acessibilidade)

Critério: [WCAG 2.2, 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

| Card   | Primeiro plano / fundo                   | Contraste | Mínimo AA para esse texto |
| ------ | ---------------------------------------- | --------: | ------------------------: |
| Player | status/success sobre status/success-soft |    2,91:1 |                     4,5:1 |
| Match  | status/info sobre status/info-soft       |    2,61:1 |                     4,5:1 |

Dark: 6,36:1 e 7,89:1, respectivamente. Não foi escurecido nenhum token nem alterado o Figma. O teste de browser guarda o resultado completo do axe e exige que o achado conhecido fique restrito ao badge Light; qualquer outro achado falha. Isso é uma evidência de defeito, não uma aprovação de acessibilidade nem uma dispensa global da regra. A escolha de um papel de texto acessível para esses badges precisa ser aprovada no design e reexportada.

### Vínculos dos masters

Os 1.259 candidatos do comparador inicial não são 1.259 defeitos: incluem pesos de borda já vinculados por lado, paths de ícones, anéis de foco derivados e masters de outras páginas. A classificação abaixo mantém os achados originais rastreáveis em component-binding-review.json; não remove evidências nem considera valores coincidentes como prova de vínculo.

| Componente  | Classificação          | Propriedades |
| ----------- | ---------------------- | -----------: |
| Avatar      | bound-per-side         |            6 |
| Avatar      | vector-geometry        |            3 |
| Badge       | vector-geometry        |           10 |
| Button      | bound-per-side         |           75 |
| Button      | vector-geometry        |            4 |
| Button Icon | bound-per-side         |          150 |
| Button Icon | vector-geometry        |           72 |
| Card        | card-literal           |          248 |
| Checkbox    | bound-per-side         |           24 |
| Chip        | bound-per-side         |           12 |
| Chip        | focus-geometry-derived |            6 |
| Chip        | vector-geometry        |           12 |
| Form Field  | bound-per-side         |           72 |
| Form Field  | vector-geometry        |           60 |
| Icon Button | bound-per-side         |           75 |
| Icon Button | vector-geometry        |           36 |
| Input       | bound-per-side         |          144 |
| Input       | vector-geometry        |           96 |
| Ranking     | bound-per-side         |           12 |
| RankingItem | bound-per-side         |            4 |
| ScoreMatch  | bound-per-side         |           12 |
| ScoreMatch  | vector-geometry        |           10 |

- bound-per-side: todos os quatro lados têm variável; não é uma borda sem vínculo.
- vector-geometry: paths e espessuras de ícones; não se tokeniza cada coordenada.
- focus-geometry-derived: geometria do contorno depende de raio, largura e offset; precisa manter essa relação, sem criar um token para cada raio resultante.
- card-literal: padding, gap, raios, bordas e textos do master Card permanecem literais. O código usa os tokens equivalentes, mas uma futura mudança de token não atualizará essas camadas do Figma sem vínculo.
- manual-review: restante preservado para inspeção; não é declarado correto automaticamente.

### Composição de produto

Na página Workplace (2:2) existem dois conjuntos locais adicionais: Frame 15 (33:106) e Frame 34 (46:296). Eles não fazem parte dos 14 conjuntos da página DS. Há 345 instâncias na página Workplace: 26 referenciam esses masters antigos fora da seção do redesign. Na seção atual 2124:9496 foram rastreadas 319 instâncias, todas apontando para masters existentes da página DS (0:1). Não foi encontrada referência a master ausente nessas 319 instâncias. Os originais preservados na página 2124:9318 não são alvos de migração.

As cópias manuais e instâncias destacadas não podem ser identificadas com certeza só pelo JSON. Esta entrega não renomeia nem substitui masters de produto no Figma. A inspeção de instâncias do redesign está concluída no snapshot. Uma revisão visual ainda é necessária para detectar eventuais cópias manuais; os masters antigos fora do redesign não foram tratados como defeitos das telas novas.

## Exceções de implementação

- Larguras de demonstração (336/520/552px) e alturas de conteúdo não são tamanhos fixos universais: o código aceita o espaço do consumidor e texto variável.
- Hover, pressed, foco, disabled e loading são estados reais do navegador/controle, não props para simular aparência de hover em produção.
- Alvos de toque de 44px e foco independente da remoção são preservados no Chip. Isso pode ampliar a largura do exemplo em relação à disposição estática.
- O reflow de ScoreMatch/Ranking em 320px e com texto a 200% permanece coberto pelos testes existentes; os limites de layout não são novos tokens globais.
- Os resumos do Card limitam a largura do badge para permitir quebra de texto em telas estreitas; conteúdos longos não são truncados.

## Proteção e reprodução

```sh
node tools/figma-audit/components.mjs /caminho/figma.snapshot.json design/figma/component-contract.json
pnpm test:figma-audit
pnpm exec nx run components:test-browser
```

Os testes de auditoria e de browser consomem a projeção versionada. O Nx inclui essa projeção nos inputs; alterações disparam as verificações correspondentes. Isso protege a relação com o snapshot revisado, não consulta o Figma ao vivo. Um novo export continua necessário após mudanças no design.

## Limites

Não é uma certificação integral nem comparação automática de pixels. A captura ao vivo do Card 2130:14288 confirmou visualmente o formato estreito do avatar, o título, a descrição e o badge; o restante da base é o export identificado acima. O snapshot não exporta texto integral de segmentos, coordenadas vetoriais nem todas as regras de alinhamento. Nenhuma variável, master ou tela do Figma foi alterada. Nenhuma versão ou dependência do app foi publicada por esta auditoria.

## Validação da implementação desta revisão

- 111 testes unitários de componentes e 15 testes de tokens passaram.
- 29 testes da ferramenta de auditoria passaram, incluindo os 12 estilos do export real e detecção de regressões.
- Lint, tipos, build da biblioteca e build do Storybook passaram.
- Suíte completa de navegador: 285 passaram, um cenário não aplicável foi ignorado.
- A nova matriz de contratos usa valores do export para comparar cores, raios e alturas aplicáveis dos roots; no Card confere também os paddings, gaps, bordas e alturas em 345px (tolerância de 0,1px para quantização da altura de linha pelo navegador).
- Os testes dos resumos guardam os achados de contraste esperados no Light. O resultado verde da suíte não significa que esse defeito do design foi corrigido.

A implementação está preparada em branch para revisão. Sem merge, release ou alteração do Volley App nesta etapa. A fonte Figma permaneceu intacta.
