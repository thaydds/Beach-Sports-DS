import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { createPlan } from './build.mjs';
import { compare, loadContract } from '../figma-audit/compare.mjs';

// A published contract, without user data, protects every existing resolved value.
test('alignment preserves all 272 published token values in both themes', async () => {
  const before = JSON.parse(
    await readFile(
      new URL('../../design/figma/published-token-values.json', import.meta.url),
      'utf8',
    ),
  );
  const after = await loadContract();
  for (const theme of ['light', 'dark']) {
    assert.equal(before[theme].length, 272);
    assert.equal(after[theme].length, 294);
    const values = new Map(after[theme].map((t) => [t.name, t.value]));
    for (const token of before[theme])
      assert.equal(values.get(token.name), token.value, theme + '/' + token.name);
  }
});
test('percent normalization is explicitly scoped, never a generic string-to-number coercion', () => {
  const snapshot = {
    schemaVersion: 1,
    file: {},
    coverage: { scope: 'all-pages', complete: true, warnings: [] },
    pages: [{ id: 'p', name: 'DS' }],
    collections: [
      {
        id: 'c',
        name: 'typography',
        defaultModeId: 'm',
        modes: [{ modeId: 'm', name: 'Default' }],
      },
    ],
    variables: [
      {
        id: 'v',
        name: 'tracking/2',
        resolvedType: 'FLOAT',
        variableCollectionId: 'c',
        valuesByMode: { m: 2 },
      },
    ],
    styles: [],
    nodes: [],
  };
  const tokens = [{ name: '--ds-type-tracking-2', type: 'string', raw: '2%', value: '2%' }];
  assert.deepEqual(compare(snapshot, { light: tokens, dark: tokens }).findings, []);
  tokens[0] = { ...tokens[0], name: '--ds-type-custom' };
  snapshot.variables[0].name = 'custom';
  assert.ok(
    compare(snapshot, { light: tokens, dark: tokens }).findings.some(
      (f) => f.kind === 'type-mismatch',
    ),
  );
});

function fixture() {
  const fontName = { family: 'Inter', style: 'Semi Bold' };
  const variable = (id, name, value, type = 'FLOAT') => ({
    id,
    key: id,
    name,
    resolvedType: type,
    variableCollectionId: 'c',
    valuesByMode: { m: value },
    codeSyntax: {},
  });
  const variables = [
    variable('v', 'space/16', 16),
    variable('zero', 'space/0', 0),
    variable('r', 'radius/16', 16),
    variable('stroke', 'stroke/subtle', 1),
    variable('family', 'type/family/primary', 'Inter', 'STRING'),
    variable('weight', 'type/weight/600', 600),
    variable('size', 'type/size/15', 15),
    variable('tracking', 'type/tracking-px/zero', 0),
  ];
  const roots = Array.from({ length: 8 }, (_, i) => ({
    id: 'card' + i,
    name: 'Card variant',
    type: 'COMPONENT',
    pageId: '0:1',
    parentId: 'set',
    masterId: 'card' + i,
    width: 345,
    height: 82,
    layoutMode: 'HORIZONTAL',
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    itemSpacing: 0,
    topLeftRadius: 16,
    topRightRadius: 16,
    bottomLeftRadius: 16,
    bottomRightRadius: 16,
    strokeWeight: 1,
    strokes: [{ visible: true }],
    boundVariables: {},
  }));
  const texts = roots.map((root, i) => ({
    id: 'text' + i,
    name: 'Label',
    type: 'TEXT',
    pageId: '0:1',
    parentId: root.id,
    masterId: root.id,
    width: 100,
    height: 20,
    fontName,
    fontSize: 15,
    fontWeight: 600,
    lineHeight: i % 2 ? { unit: 'AUTO' } : { unit: 'PIXELS', value: 20 },
    letterSpacing: { unit: 'PERCENT', value: 0 },
    textStyleId: '',
    boundVariables: {},
    textSegments: [
      {
        start: 0,
        end: 4,
        fontName,
        fontSize: 15,
        fontWeight: 600,
        lineHeight: i % 2 ? { unit: 'AUTO' } : { unit: 'PIXELS', value: 20 },
        letterSpacing: { unit: 'PERCENT', value: 0 },
        textStyleId: '',
        boundVariables: {},
      },
    ],
  }));
  return {
    schemaVersion: 1,
    file: { name: 'Test DS' },
    coverage: { scope: 'all-pages', complete: true, warnings: [] },
    pages: [{ id: '0:1', name: 'DS' }],
    collections: [
      {
        id: 'c',
        key: 'c',
        name: 'sizing',
        defaultModeId: 'm',
        modes: [{ modeId: 'm', name: 'Default' }],
      },
    ],
    variables,
    styles: [
      {
        id: 'style',
        key: 'style',
        name: 'Control/MD',
        type: 'TEXT',
        fontName,
        fontSize: 15,
        lineHeight: { unit: 'PIXELS', value: 20 },
        letterSpacing: { unit: 'PIXELS', value: 0 },
        boundVariables: {},
      },
    ],
    nodes: [
      { id: 'set', name: 'Card', type: 'COMPONENT_SET', pageId: '0:1', parentId: '0:1' },
      ...roots,
      ...texts,
    ],
  };
}
async function runtime(snapshot, { stale = false, fail = false, dev = false } = {}) {
  const plan = createPlan(snapshot);
  delete plan.expectedSnapshot;
  const nodes = new Map(snapshot.nodes.map((n) => [n.id, structuredClone(n)]));
  const variables = new Map(snapshot.variables.map((v) => [v.id, structuredClone(v)]));
  const messages = [];
  let writes = 0,
    checkpoint;
  const api = {
    editorType: dev ? 'dev' : 'figma',
    root: { name: snapshot.file.name },
    skipInvisibleInstanceChildren: true,
    showUI() {},
    loadAllPagesAsync: async () => {},
    loadFontAsync: async () => {},
    ui: { postMessage: (m) => messages.push(m) },
    variables: {
      getLocalVariablesAsync: async () => [...variables.values()],
      getLocalVariableCollectionsAsync: async () => snapshot.collections,
    },
    getStyleByIdAsync: async (id) => snapshot.styles.find((s) => s.id === id),
    getNodeByIdAsync: async (id) => nodes.get(id),
    commitUndo() {
      checkpoint = structuredClone(
        [...nodes.values()].map((n) => ({
          id: n.id,
          boundVariables: n.boundVariables,
          textStyleId: n.textStyleId,
        })),
      );
    },
    triggerUndo() {
      for (const saved of checkpoint) Object.assign(nodes.get(saved.id), saved);
    },
  };
  for (const variable of variables.values()) {
    variable.setVariableCodeSyntax = (platform, value) => {
      writes++;
      variable.codeSyntax[platform] = value;
    };
  }
  for (const node of nodes.values()) {
    Object.defineProperty(node, 'parent', { get: () => nodes.get(node.parentId) });
    node.characters = 'Test';
    node.setBoundVariable = (field, variable) => {
      if (fail && writes > 0) throw Error('Simulated failure');
      writes++;
      node.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: variable.id };
    };
    node.setRangeBoundVariable = (_start, _end, field, variable) =>
      node.setBoundVariable(field, variable);
    node.getRangeBoundVariable = (_start, _end, field) => node.boundVariables[field];
    node.setTextStyleIdAsync = async (id) => {
      writes++;
      node.textStyleId = id;
    };
  }
  if (stale) nodes.get('card0').paddingTop = 24;
  const code = await readFile(new URL('./plugin/runtime.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, { figma: api, __html__: '', PLAN: plan });
  await api.ui.onmessage({ type: 'apply' });
  return { messages, writes, api, nodes, plan };
}
test('plan scopes all writes to the eight Card masters and records AUTO exceptions', () => {
  const s = fixture(),
    plan = createPlan(s);
  assert.equal(plan.exceptions.length, 4);
  assert.equal(plan.operations.filter((op) => op.kind === 'style').length, 4);
  assert.ok(
    plan.operations
      .filter((op) => op.kind !== 'rename')
      .every((op) => plan.cardIds.includes(op.masterId)),
  );
  assert.ok(
    !plan.operations.some(
      (op) => op.field === 'width' || op.field === 'height' || op.field === 'characters',
    ),
  );
});
test('runtime binds, verifies and is idempotent without changing text or geometry', async () => {
  const { messages, api, nodes } = await runtime(fixture());
  assert.equal(messages[0].type, 'result');
  assert.equal(messages[0].result.status, 'applied');
  await api.ui.onmessage({ type: 'apply' });
  assert.equal(messages[1].result.status, 'already-applied');
  assert.equal(nodes.get('card0').height, 82);
  assert.equal(nodes.get('text0').characters, 'Test');
  assert.equal(api.skipInvisibleInstanceChildren, true);
});

test('renames preserve variable IDs and aliases and update only the matching Web syntax', async () => {
  const s = fixture();
  s.collections.push({
    id: 'type',
    key: 'type',
    name: 'typography',
    defaultModeId: 'm',
    modes: [{ modeId: 'm', name: 'Default' }],
  });
  s.variables.push({
    id: 'style-name',
    key: 'style-key',
    name: 'style/regular',
    resolvedType: 'STRING',
    variableCollectionId: 'type',
    valuesByMode: { m: 'Regular' },
    codeSyntax: { WEB: 'var(--ds-type-style-regular)' },
  });
  const result = await runtime(s);
  assert.equal(result.messages[0].type, 'result');
  const variable = (await result.api.variables.getLocalVariablesAsync()).find(
    (v) => v.id === 'style-name',
  );
  assert.equal(variable.key, 'style-key');
  assert.equal(variable.name, 'font-style/regular');
  assert.equal(variable.codeSyntax.WEB, 'var(--ds-type-font-style-regular)');
  assert.deepEqual(variable.valuesByMode, { m: 'Regular' });
  await result.api.ui.onmessage({ type: 'apply' });
  assert.equal(result.messages[1].result.status, 'already-applied');
});
test('stale values and Dev Mode stop before any write', async () => {
  for (const options of [{ stale: true }, { dev: true }]) {
    const result = await runtime(fixture(), options);
    assert.equal(result.writes, 0);
    assert.equal(result.messages[0].type, 'error');
  }
});

test('a text style that would change unaudited formatting is rejected before writes', async () => {
  const snapshot = fixture();
  snapshot.styles[0].textCase = 'UPPER';
  const result = await runtime(snapshot);
  assert.equal(result.writes, 0);
  assert.equal(result.messages[0].type, 'error');
  assert.match(result.messages[0].message, /formatação não aprovada/);
});
test('a mid-application failure requests undo and never claims success', async () => {
  const result = await runtime(fixture(), { fail: true });
  assert.equal(result.messages[0].type, 'error');
  assert.match(result.messages[0].message, /desfazer/);
  assert.deepEqual(result.nodes.get('card0').boundVariables, {});
});
