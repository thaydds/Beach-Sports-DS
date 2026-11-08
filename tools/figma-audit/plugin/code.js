/* global figma, __html__ */
// No document writes, storage, fetch, or imports. This file runs directly in Figma.
const VERSION = '1.0.1';
const properties = [
  'visible',
  'opacity',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'layoutMode',
  'layoutSizingHorizontal',
  'layoutSizingVertical',
  'primaryAxisSizingMode',
  'counterAxisSizingMode',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'itemSpacing',
  'counterAxisSpacing',
  'cornerRadius',
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
  'strokeWeight',
  'fills',
  'strokes',
  'effects',
  'fillStyleId',
  'strokeStyleId',
  'effectStyleId',
  'textStyleId',
  'fontName',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'boundVariables',
  'explicitVariableModes',
  'resolvedVariableModes',
  'variantProperties',
  'componentPropertyDefinitions',
  'componentProperties',
];

function plain(value) {
  if (typeof value === 'symbol') return { mixed: true };
  if (value === undefined) return null;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(plain);
  return Object.fromEntries(Object.keys(value).map((key) => [key, plain(value[key])]));
}

function pick(object, keys) {
  const result = {};
  for (const key of keys) if (key in object) result[key] = plain(object[key]);
  return result;
}

async function collectSnapshot() {
  await figma.loadAllPagesAsync();
  const warnings = [];
  const variables = new Map();
  const collections = new Map();
  const styles = new Map();
  const variableIds = new Set();
  const styleIds = new Set();
  function references(value) {
    if (!value || typeof value !== 'object') return;
    if (value.type === 'VARIABLE_ALIAS') variableIds.add(value.id);
    for (const child of Object.values(value)) references(child);
  }
  function addVariable(variable) {
    const record = pick(variable, [
      'id',
      'key',
      'name',
      'description',
      'resolvedType',
      'variableCollectionId',
      'valuesByMode',
      'scopes',
      'remote',
      'hiddenFromPublishing',
      'codeSyntax',
    ]);
    variables.set(variable.id, record);
    references(record.valuesByMode);
  }
  function addCollection(collection) {
    collections.set(
      collection.id,
      pick(collection, [
        'id',
        'key',
        'name',
        'modes',
        'defaultModeId',
        'variableIds',
        'remote',
        'hiddenFromPublishing',
      ]),
    );
  }
  function addStyle(style) {
    const record = pick(style, [
      'id',
      'key',
      'name',
      'type',
      'remote',
      'description',
      'fontName',
      'fontSize',
      'fontWeight',
      'lineHeight',
      'letterSpacing',
      'paragraphSpacing',
      'paragraphIndent',
      'textCase',
      'textDecoration',
      'paints',
      'effects',
      'boundVariables',
    ]);
    styles.set(style.id, record);
    references(record);
  }
  (await figma.variables.getLocalVariablesAsync()).forEach(addVariable);
  (await figma.variables.getLocalVariableCollectionsAsync()).forEach(addCollection);
  for (const method of [
    'getLocalTextStylesAsync',
    'getLocalPaintStylesAsync',
    'getLocalEffectStylesAsync',
  ]) {
    (await figma[method]()).forEach(addStyle);
  }
  const nodes = [];
  const pages = [];
  async function visit(node, pageId, masterId) {
    const owner = node.type === 'COMPONENT' ? node.id : masterId;
    const record = {
      id: node.id,
      name: node.name,
      type: node.type,
      pageId,
      parentId: node.parent ? node.parent.id : null,
      masterId: owner,
      ...pick(node, properties),
    };
    if (node.type === 'COMPONENT') record.key = node.key;
    if (node.type === 'INSTANCE') {
      try {
        const main = await node.getMainComponentAsync();
        record.mainComponent = main
          ? { id: main.id, key: main.key, name: main.name, remote: main.remote }
          : null;
        if (!main) warnings.push({ nodeId: node.id, reason: 'main-component-unavailable' });
      } catch (error) {
        warnings.push({
          nodeId: node.id,
          reason: 'main-component-unavailable',
          detail: String(error),
        });
      }
    }
    if (node.type === 'TEXT') {
      // Preserve per-range typography/bindings without exporting users' text content.
      record.textSegments = node
        .getStyledTextSegments([
          'fontName',
          'fontSize',
          'fontWeight',
          'lineHeight',
          'letterSpacing',
          'textStyleId',
          'fills',
          'boundVariables',
        ])
        .map(({ characters: _characters, ...segment }) => plain(segment));
    }
    references(record);
    for (const key of ['fillStyleId', 'strokeStyleId', 'effectStyleId', 'textStyleId']) {
      if (typeof record[key] === 'string' && record[key]) styleIds.add(record[key]);
    }
    for (const segment of record.textSegments || [])
      if (segment.textStyleId) styleIds.add(segment.textStyleId);
    nodes.push(record);
    if ('children' in node) for (const child of node.children) await visit(child, pageId, owner);
  }
  for (const page of figma.root.children) {
    pages.push({ id: page.id, name: page.name });
    for (const node of page.children) await visit(node, page.id, null);
  }
  for (const id of styleIds) {
    if (styles.has(id)) continue;
    const style = await figma.getStyleByIdAsync(id);
    if (style) addStyle(style);
    else warnings.push({ styleId: id, reason: 'style-unavailable' });
  }
  // Set iteration includes new aliases discovered while resolving external references.
  for (const id of variableIds) {
    if (variables.has(id)) continue;
    const variable = await figma.variables.getVariableByIdAsync(id);
    if (variable) addVariable(variable);
    else warnings.push({ variableId: id, reason: 'variable-unavailable' });
  }
  for (const variable of variables.values()) {
    if (collections.has(variable.variableCollectionId)) continue;
    const collection = await figma.variables.getVariableCollectionByIdAsync(
      variable.variableCollectionId,
    );
    if (collection) addCollection(collection);
    else
      warnings.push({
        collectionId: variable.variableCollectionId,
        reason: 'collection-unavailable',
      });
  }
  const byId = (values) => [...values].sort((a, b) => a.id.localeCompare(b.id));
  return {
    schemaVersion: 1,
    exporterVersion: VERSION,
    exportedAt: new Date().toISOString(),
    file: { key: figma.fileKey || null, name: figma.root.name },
    coverage: {
      scope: 'all-pages',
      complete: warnings.length === 0,
      warnings,
      limitations: [
        'No detached-instance detection: manually drawn copies require visual review.',
        'No behavior or visual equivalence certification.',
        'Export is a point-in-time snapshot, not a live connection.',
      ],
    },
    pages,
    variables: byId(variables.values()),
    collections: byId(collections.values()),
    styles: byId(styles.values()),
    nodes: byId(nodes),
  };
}

figma.showUI(__html__, { width: 420, height: 340 });
let busy = false;
figma.ui.onmessage = async (message) => {
  if (message.type !== 'export' || busy) return;
  busy = true;
  const previousSkipInvisible = figma.skipInvisibleInstanceChildren;
  try {
    // Dev Mode skips hidden instance descendants by default. Audit them too.
    // This is plugin traversal configuration; it does not edit the document.
    figma.skipInvisibleInstanceChildren = false;
    const snapshot = await collectSnapshot();
    figma.ui.postMessage({ type: 'snapshot', snapshot });
  } catch (error) {
    // A failed traversal must never be presented as a complete export.
    figma.ui.postMessage({ type: 'error', message: String(error) });
  } finally {
    figma.skipInvisibleInstanceChildren = previousSkipInvisible;
    busy = false;
  }
};
