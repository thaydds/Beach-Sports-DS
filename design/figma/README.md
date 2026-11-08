# Evidências do Figma

O Figma é a fonte da verdade. Use o [auditor somente leitura](../../tools/figma-audit/README.md)
para comparar um export com o repositório. Nenhum plugin de escrita é necessário.

O export completo enviado foi preservado localmente; a projeção de variáveis
`tools/figma-audit/fixtures/figma-token-export.json` registra apenas coleções e
variáveis, com SHA-256 da origem, para os testes repetíveis de tokens. Não
contém nem certifica nós, vínculos, estilos ou comportamento.

`published-token-values.json` protege os 272 valores previamente publicados; os
nomes divergentes do Figma são mantidos como aliases de compatibilidade. Não há
base de componentes aprovada: as pendências de Card são uma auditoria separada.
