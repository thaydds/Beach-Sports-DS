# Modal composto, com foco contido

Use para uma decisão ou tarefa que precisa interromper o fluxo. Para status comum
ou erro recuperável da página, prefira comunicação no próprio contexto.

```tsx
<Modal
  open={open}
  title="Salvar partida?"
  description="Confira os times antes de continuar."
  busy={saving}
  onClose={() => setOpen(false)}
  actions={
    <>
      <Button variant="secondary" disabled={saving} onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button loading={saving} onClick={salvar}>
        Salvar partida
      </Button>
    </>
  }
>
  <FormField label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
  {error && (
    <Typography variant="text-s" role="alert">
      Não foi possível salvar. Tente novamente.
    </Typography>
  )}
</Modal>
```

| Prop                            | Padrão         | Contrato                                                                        |
| ------------------------------- | -------------- | ------------------------------------------------------------------------------- |
| open                            | obrigatório    | Abertura controlada pela aplicação                                              |
| onClose                         | obrigatório    | Solicita fechar: escape, backdrop ou native; consumidor atualiza open           |
| title / label                   | um obrigatório | Título visual Heading/M; sem título use label não visual                        |
| description                     | ausente        | Descrição Body/M secondary, vinculada por aria-describedby                      |
| children                        | ausente        | Slot Content, componentes e conteúdo livre; gap12                               |
| actions                         | ausente        | Slot Actions vertical, gap12; componha Buttons existentes                       |
| busy                            | false          | aria-busy no diálogo, bloqueia dispensa, slots inertes, mantém valores montados |
| closeOnEscape / closeOnBackdrop | true           | Configuráveis; busy tem prioridade                                              |
| initialFocusRef                 | ausente        | Foco inicial dentro do diálogo; padrão título ou superfície                     |
| className                       | ausente        | Layout consumidor, sem prop style ou variantes de API/domínio                   |

State Default/Saving/Error no Figma são exemplos de composição: não há enum de
estados da API no Modal genérico. O consumidor controla a operação, erro e reenvio;
busy não é um mecanismo de idempotência de rede. Use Button loading para bloquear
repetição na ação e busy para proteger todo o diálogo durante uma operação.
Campos e botões dos slots ficam inert durante busy; spinner visual permanece visível.
Erro remove busy e conserva o formulário; ação de recuperação chama a lógica consumidora.
O consumidor deve manter uma guarda também no handler de submissão.

## Overlay, layout e tokens

O próprio dialog usa showModal(), top layer e ::backdrop: não requer portal para body,
preservando tema e variáveis herdadas. Fundo inerte, bloqueio de scroll da página e
contenção explícita de Tab/Shift+Tab. O foco inicial evita iniciar numa ação destrutiva;
fechar ou desmontar devolve foco ao acionador se ele ainda existir. Escape e clique
fora solicitam fechar; clique no padding interno e arrastar de dentro para fora não fecham.
Dialogs com form method="dialog" também solicitam onClose('native'); prefira ações controladas.
Requer navegadores com suporte nativo a dialog.showModal() e inert; não inclui polyfill.

Margem mínima16, max-width480 como recomendação de layout (exceção localizada de px),
padding24, gap16, radius16, stroke/subtle, bg/raised e border/subtle. Altura limitada
a viewport dinâmica com rolagem interna; sem altura fixa ou min-width que quebre mobile.
Master tem 360 de largura demonstrativa. Título e descrição são omitidos sem wrappers vazios.
Conteúdo rico não deve ser passado como description: componha em children e evite
uma descrição acessível extensa. Erros podem usar Body/S e role alert na composição.

**Exceção de design:** ainda não existe token canônico de scrim. Conforme Figma,
::backdrop usa text/primary com opacidade direta48%, via color-mix. Dark acompanha
a cor text/primary de Dark, inclusive sua aparência mais clara. Isso reproduz a
fonte; uma nova cor de overlay exige decisão no Figma/tokens, não alteração silenciosa.
Nenhum token canônico foi criado ou alterado.

## Fonte e limites

[Figma Modal](https://www.figma.com/design/baO5SbbaGO01QTGc8d5M0P?node-id=2184-15831),
set2184:15894, Overlay2184:16044. Export de 2026-11-10T03:14:44.271Z,
coverage.complete=true, zero warnings reportados pelo plugin. Evidência do vínculo
e hashes do snapshot original em docs/figma/loading-modal-source.json.
Não é certificação visual automática do sistema completo.

Offline, resposta incerta e conflito são decisões do produto consumidor: preservar
conteúdo, informar indisponibilidade de escrita, permitir recuperação e não sobrescrever
edições concorrentes silenciosamente. Modal não implementa API, autenticação, sincronização
realtime ou fila offline. Esta entrega não altera o Volley nem publica a biblioteca.
