# Loading sem texto visual

Spinner para carregamento de regiões. Não substitui conteúdo por um texto “Carregando”.
Para ações, use o `loading` do Button existente; não coloque um Loading adicional no botão.

```tsx
<section aria-label="Histórico" aria-busy={loading}>
  {loading ? <Loading size="md" label="Buscando histórico de partidas" /> : <Historico />}
</section>
```

| Prop                 | Padrão     | Contrato                                                  |
| -------------------- | ---------- | --------------------------------------------------------- |
| size                 | sm         | sm=16, md=24, lg=32; tokens size/16, size/24, size/32     |
| label                | Carregando | Nome acessível não visual; prefira um nome contextual     |
| ref / atributos span | —          | Não aceita children, style ou substituição do role status |

Sem Label, Show label ou Orientation. Círculo aberto com stroke/control (2),
cor action/default; Light/Dark herdados dos tokens. SVG decorativo, role status no
contêiner. A região consumidora controla aria-busy. Se houver várias instâncias
puramente decorativas junto de um status já anunciado, o consumidor pode usar
aria-hidden para evitar anúncios repetidos.

Rotação de 900ms é comportamento local de implementação, sem criar token de movimento.
Reduced motion remove a rotação e preserva o indicador estático. Forced colors usa CanvasText.
Sem percentuais ou promessa de progresso mensurável.

## Fonte e limites

[Figma Loading](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P?node-id=2184-15745),
set 2184:15772. Export de 2026-11-10T03:14:44.271Z; propriedades e vínculos
conferidos no snapshot completo e recorte do plugin Beach Sports DS — Audit.
Screenshot direto do master conferido via Figma MCP: arco aberto no quadrante superior direito.
O snapshot não exporta arcData; arco de 270 graus implementa a aparência observada,
sem alegar equivalência vetorial exata. Master estático; animação existe somente no código.
