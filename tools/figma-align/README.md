# Alinhar o primeiro export

Plugin de **escrita**, separado do exportador somente leitura. Gerado para o
snapshot auditado, com precondições específicas. Só funciona no modo Design.
Não usa rede, não exclui variáveis e preserva seus IDs e valores.

## Preparar

```sh
node tools/figma-align/build.mjs caminho/figma.snapshot.json caminho/plugin-gerado
```

O build compara as renomeações projetadas com o contrato local e recusa gerar o
plugin se ainda houver diferenças de tokens. A projeção não prova a aplicação.
O diretório gerado contém manifest.json, code.js, ui.html e plan.json.
O manifest dentro de `tools/figma-align/plugin/` é apenas um template sem code.js:
importe o manifest **gerado**, conforme abaixo.

## Executar no Figma

1. No modo Design, use Plugins → Development → Import plugin from manifest….
2. Escolha manifest.json do diretório gerado e execute Beach Sports DS — Align.
3. Clique **Conferir arquivo** e depois **Aplicar alinhamento**.
4. Não edite o arquivo durante a aplicação.
5. Execute o plugin Audit novamente e envie o JSON para validar o resultado real.

Caso o Figma exija um ID, obtenha um ID em Development → New plugin… e adicione-o
ao manifest gerado. Nenhuma credencial é necessária.

## Contrato e escopo

- Quinze renomeações: style → font-style, minus → negative, normal → 0 e seis
  tracking-px para nomes canônicos. O codeSyntax acompanha; IDs/valores permanecem.
- O repositório preserva 22 auxiliares: oito alturas de linha compartilhadas,
  dois percentuais e doze tracking-px documentais/de compatibilidade. Os últimos
  não ampliam a escala tipográfica de produto. Não há fusão de zeros por valor.
- Target/focus e campos de estilos passam a expressar os aliases usados no Figma.
- Percentuais continuam strings com % no contrato; o adaptador aceita FLOAT
  somente nos nomes listados em `tools/figma-audit/mapping.json`.
- Os 272 valores publicados, nos dois temas, ficam protegidos pelo teste e pelo
  registro `design/figma/published-token-values.json`.
- No snapshot de origem: **15 renomeações, 56 nós Card, 339 operações e 12
  exceções de line-height AUTO**. Geometria é vinculada aos tokens do mesmo valor.
  Textos com correspondência completa usam estilos; os demais vinculam família,
  peso, tamanho e tracking diretamente. AUTO permanece automático.
- Avatar/Badge internos não são trocados nesta migração: ainda exigem revisão
  da composição e da equivalência com React. Não é certificação completa do Card.

## Pré-condições, falhas e retorno

O plugin confere IDs/keys, coleções, modos, valores, codeSyntax, estilos,
geometria e vínculos antes de escrever; recusa estado diferente do snapshot.
Carrega fontes antes da escrita. Depois, verifica os vínculos e reconfere os
valores e dimensões. Repetir o plano aplicado não duplica operações.

Uma falha intermediária interrompe e solicita `triggerUndo` até o checkpoint
inicial. Isso não é garantia de transação: reexporte para conferir antes de
repetir. Colaboradores não devem editar simultaneamente. Uma aplicação concluída
pode ser desfeita no histórico do Figma.

Os testes usam API simulada e cobrem preservação, arquivo alterado, Dev Mode,
repetição e falha intermediária. Só o export posterior comprova o estado real.
Nenhum pacote npm é publicado automaticamente.

- [Variáveis e vínculos](https://developers.figma.com/docs/plugins/working-with-variables/)
- [Text styles](https://developers.figma.com/docs/plugins/api/TextNode/)
- [Undo checkpoints](https://developers.figma.com/docs/plugins/api/figma/)
