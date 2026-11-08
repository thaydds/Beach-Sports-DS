/* global figma, __html__, PLAN */
// PLAN is embedded at build time from the reviewed snapshot, never received as executable UI input.
function same(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-5;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return a === b;
  const ak = Object.keys(a),
    bk = Object.keys(b);
  return (
    ak.length === bk.length &&
    ak.every((key) => Object.prototype.hasOwnProperty.call(b, key) && same(a[key], b[key]))
  );
}
function fail(message) {
  throw Error(message);
}
function canonicalSpacing(value, size) {
  if (value?.unit === 'PERCENT') return (value.value * size) / 100;
  if (value?.unit === 'PIXELS') return value.value;
  return value?.unit;
}
async function inspectPlan() {
  if (figma.editorType !== 'figma') fail('Abra o modo Design para aplicar a migração.');
  await figma.loadAllPagesAsync();
  if (figma.root.name !== PLAN.fileName) fail('Arquivo diferente do snapshot.');
  const variables = new Map((await figma.variables.getLocalVariablesAsync()).map((v) => [v.id, v]));
  if (variables.size !== PLAN.variables.length)
    fail('Inventário de variáveis mudou. Exporte novamente.');
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  for (const before of PLAN.collections) {
    const current = collections.find((c) => c.id === before.id);
    if (
      !current ||
      current.key !== before.key ||
      current.name !== before.name ||
      !same(current.modes, before.modes)
    )
      fail('Coleção mudou: ' + before.name);
  }
  for (const before of PLAN.variables) {
    const current = variables.get(before.id),
      rename = PLAN.operations.find((op) => op.kind === 'rename' && op.id === before.id);
    if (
      !current ||
      current.key !== before.key ||
      current.variableCollectionId !== before.variableCollectionId ||
      ![before.name, rename?.after].includes(current.name) ||
      !same(current.valuesByMode, before.valuesByMode)
    )
      fail('Variável mudou: ' + before.id);
    const allowedSyntax = rename ? { ...before.codeSyntax, WEB: rename.syntax } : before.codeSyntax;
    if (!same(current.codeSyntax, before.codeSyntax) && !same(current.codeSyntax, allowedSyntax))
      fail('codeSyntax mudou: ' + before.id);
  }
  const styles = new Map();
  for (const before of PLAN.styles) {
    const style = await figma.getStyleByIdAsync(before.id);
    for (const field of [
      'key',
      'fontName',
      'fontSize',
      'lineHeight',
      'letterSpacing',
      'boundVariables',
    ]) {
      if (!style || !same(style[field], before[field])) fail('Estilo mudou: ' + before.name);
    }
    styles.set(style.id, style);
  }
  const nodes = new Map();
  for (const before of PLAN.beforeNodes) {
    const node = await figma.getNodeByIdAsync(before.id);
    if (!node || node.type !== before.type) fail('Nó mudou: ' + before.id);
    let parent = node;
    while (parent && parent.id !== before.masterId) parent = parent.parent;
    if (!parent || !PLAN.cardIds.includes(parent.id))
      fail('Nó fora dos masters Card: ' + before.id);
    for (const [field, value] of Object.entries(before.expected)) {
      if (['boundVariables', 'textStyleId'].includes(field)) continue;
      if (field === 'letterSpacing') {
        if (
          !same(
            canonicalSpacing(node[field], node.fontSize),
            canonicalSpacing(value, before.expected.fontSize),
          )
        )
          fail('Tracking mudou: ' + before.id);
      } else if (!same(node[field], value)) fail('Propriedade mudou: ' + before.id + '/' + field);
    }
    if (node.type === 'TEXT' && node.characters.length !== before.textLength)
      fail('Comprimento do texto mudou: ' + before.id);
    const bindings = node.boundVariables || {},
      expected = before.expected.boundVariables || {};
    for (const field of new Set([...Object.keys(bindings), ...Object.keys(expected)])) {
      const op = PLAN.operations.find(
        (o) =>
          o.id === before.id && (o.kind === 'bind' || o.kind === 'text-bind') && o.field === field,
      );
      const styleOp = PLAN.operations.find((o) => o.id === before.id && o.kind === 'style');
      const allowed = op
        ? { type: 'VARIABLE_ALIAS', id: op.variableId }
        : styleOp
          ? styles.get(styleOp.styleId).boundVariables?.[field]
          : undefined;
      if (!same(bindings[field], expected[field]) && !same(bindings[field], allowed))
        fail('Vínculo mudou: ' + before.id + '/' + field);
    }
    const styleOp = PLAN.operations.find((o) => o.id === before.id && o.kind === 'style');
    if (styleOp) {
      const style = styles.get(styleOp.styleId);
      for (const field of ['textCase', 'textDecoration', 'paragraphIndent', 'paragraphSpacing']) {
        if (style[field] !== undefined && !same(node[field], style[field])) {
          fail('Estilo alteraria formatação não aprovada: ' + before.id + '/' + field);
        }
      }
    }
    if (
      node.type === 'TEXT' &&
      node.textStyleId !== before.expected.textStyleId &&
      node.textStyleId !== styleOp?.styleId
    )
      fail('Estilo do texto mudou: ' + before.id);
    nodes.set(node.id, node);
  }
  const usedNames = new Set(
    [...variables.values()].map((v) => v.variableCollectionId + '/' + v.name),
  );
  for (const op of PLAN.operations.filter((o) => o.kind === 'rename')) {
    const variable = variables.get(op.id);
    if (variable.name !== op.after && usedNames.has(variable.variableCollectionId + '/' + op.after))
      fail('Nome de destino já existe: ' + op.after);
  }
  // Preload every affected font before the first mutation.
  for (const node of nodes.values())
    if (node.type === 'TEXT') await figma.loadFontAsync(node.fontName);
  return { variables, nodes, styles };
}
function applied(op, state) {
  if (op.kind === 'rename')
    return (
      state.variables.get(op.id).name === op.after &&
      state.variables.get(op.id).codeSyntax.WEB === op.syntax
    );
  const node = state.nodes.get(op.id);
  if (op.kind === 'style') return node.textStyleId === op.styleId;
  const ref =
    op.kind === 'text-bind'
      ? node.getRangeBoundVariable(0, node.characters.length, op.field)
      : node.boundVariables?.[op.field];
  return ref?.id === op.variableId;
}
async function applyPlan() {
  const state = await inspectPlan();
  if (PLAN.operations.every((op) => applied(op, state)))
    return { status: 'already-applied', exceptions: PLAN.exceptions };
  let touched = false;
  figma.commitUndo();
  try {
    for (const op of PLAN.operations) {
      if (applied(op, state)) continue;
      if (op.kind === 'rename') {
        state.variables.get(op.id).name = op.after;
        touched = true;
        state.variables.get(op.id).setVariableCodeSyntax('WEB', op.syntax);
      } else {
        const node = state.nodes.get(op.id);
        if (op.kind === 'style') await node.setTextStyleIdAsync(op.styleId);
        else if (op.kind === 'text-bind')
          node.setRangeBoundVariable(
            0,
            node.characters.length,
            op.field,
            state.variables.get(op.variableId),
          );
        else node.setBoundVariable(op.field, state.variables.get(op.variableId));
        touched = true;
      }
    }
    for (const op of PLAN.operations)
      if (!applied(op, state)) fail('Leitura de retorno divergiu: ' + op.id);
    // Re-check all audited values, dimensions, variables and fonts after binding.
    await inspectPlan();
    figma.commitUndo();
    return { status: 'applied', operations: PLAN.operations.length, exceptions: PLAN.exceptions };
  } catch (error) {
    if (touched) {
      figma.triggerUndo();
      throw Error(
        String(error) +
          '\nA migração foi interrompida e foi solicitado desfazer até o checkpoint. Reexporte para confirmar o estado antes de repetir.',
      );
    }
    throw error;
  }
}
figma.showUI(__html__, { width: 440, height: 420 });
let running = false;
figma.ui.onmessage = async (message) => {
  if (running || !['inspect', 'apply'].includes(message.type)) return;
  running = true;
  const previous = figma.skipInvisibleInstanceChildren;
  figma.skipInvisibleInstanceChildren = false;
  try {
    if (message.type === 'inspect') {
      await inspectPlan();
      figma.ui.postMessage({
        type: 'ready',
        renames: PLAN.operations.filter((o) => o.kind === 'rename').length,
        nodes: PLAN.beforeNodes.length,
        exceptions: PLAN.exceptions.length,
        file: PLAN.fileName,
      });
    } else figma.ui.postMessage({ type: 'result', result: await applyPlan() });
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: String(error) });
  } finally {
    figma.skipInvisibleInstanceChildren = previous;
    running = false;
  }
};
