# Counter

Fonte: Figma set2197:11752, seção2197:9015. Uma entrada/spinbutton para um único inteiro, com1/2/3 casas visuais40×88, gap8 e botões Secondary44×44 empilhados. Padding8/radius16, tokens semânticos e Heading/L; sem novos tokens. Não usar snapshots anteriores com setas ou linha simples.

`value`, `onChange(number)` e `label` são obrigatórios. `digits` (padrão2) deriva limites0–9/99/999 e preenchimento0/00/000. Mínimo/máximo bloqueiam diminuir/aumentar. ArrowUp/Down mudam1, Home volta a0. Digitação e colagem editam o número completo;09→10 transporta normalmente. Há somente um spinbutton, com nome, aria-valuemin/max/now; botões têm nomes próprios. Disabled/readOnly bloqueiam alterações. Foco e erro não alteram geometria.

A combinação inválida de value/digits não é truncada nem limitada silenciosamente: valor inteiro negativo, fracionário, fora do intervalo ou digits inválido permanece exposto e sinalizado com aria-invalid; passos ficam bloqueados. O campo permite corrigir a entrada completa. Reduzir digits preserva o valor e comunica erro até receber valor compatível; não há onChange automático por mudar props. Texto inválido/temporariamente vazio não emite número; onValidityChange permite bloquear confirmação externa. Digitação válida emite o inteiro; ao sair, aplica zero-padding. Erro do produto usa validation=error. Mensagem de faixa é apenas acessível enquanto inválido, não orientação visual permanente.

ScoreMatch com scoreLayout=rows preserva o slot nativo, títulos e participantes; cada time fica em uma linha e seu Counter à direita. Default columns permanece compatível; Finished continua numérico e ignora scoreContent/layout de edição. A biblioteca não persiste nem sincroniza placares e não calcula regra de vencedor.
