import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import { canonicalName, compare, loadContract, validateSnapshot } from './compare.mjs';

const variable = (id, name, value, type = 'FLOAT', collection = 'base') => ({
  id,
  name,
  remote: false,
  resolvedType: type,
  variableCollectionId: collection,
  valuesByMode: { default: value },
});
const collection = {
  id: 'base',
  name: 'Foundations',
  defaultModeId: 'default',
  modes: [{ modeId: 'default', name: 'Default' }],
};
const snapshot = (variables) => ({
  schemaVersion: 1,
  file: { key: 'test' },
  coverage: { scope: 'all-pages', complete: true, warnings: [] },
  pages: [{ id: 'page', name: 'DS' }],
  variables,
  collections: [collection],
  styles: [],
  nodes: [],
});
const token = (path, raw, value = raw, type = 'dimension') => ({
  name: canonicalName(path),
  path,
  type,
  raw,
  value,
});
const contract = (tokens) => ({ light: tokens, dark: tokens });

test('manifest supports Design and Dev Mode inspection without network access', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('./plugin/manifest.json', import.meta.url), 'utf8'),
  );
  assert.deepEqual(manifest.editorType, ['figma', 'dev']);
  assert.deepEqual(manifest.capabilities, ['inspect']);
  assert.deepEqual(manifest.networkAccess.allowedDomains, ['none']);
});

test('names match the actual Style Dictionary transform for every source token', async () => {
  const config = await readFile(
    new URL('../../packages/tokens/sd.config.ts', import.meta.url),
    'utf8',
  );
  const body = config.match(
    /export function cssVarName\(path: readonly string\[\]\): string \{([\s\S]*?)\n\}/,
  )[1];
  const transform = vm.runInNewContext(`(path) => {${body}}`);
  const current = await loadContract();
  assert.equal(current.light.length, 272);
  for (const item of current.light)
    assert.equal(canonicalName(item.path), transform(item.path.split('.')));
  assert.equal(new Set(current.light.map((item) => item.name)).size, current.light.length);
});

test('dimensions, types and both themes compare without modifying inputs', () => {
  const data = snapshot([variable('s', 'space/16', 16)]);
  const before = JSON.stringify(data);
  assert.equal(compare(data, contract([token('space.16', '16px')])).findings.length, 0);
  assert.equal(JSON.stringify(data), before);
});

test('same resolved value with different alias intention is a finding', () => {
  const data = snapshot([variable('s', 'space/16', 16), variable('p', 'padding/default', 16)]);
  const report = compare(
    data,
    contract([token('space.16', '16px'), token('padding.default', '{space.16}', '16px')]),
  );
  assert.equal(report.findings.filter((f) => f.kind === 'alias-mismatch').length, 2);
});

test('aliases resolve across collections, preserve identity and detect cycles', () => {
  const data = snapshot([
    variable('s', 'space/16', 16),
    variable('p', 'padding/default', { type: 'VARIABLE_ALIAS', id: 's' }),
  ]);
  assert.equal(
    compare(
      data,
      contract([token('space.16', '16px'), token('padding.default', '{space.16}', '16px')]),
    ).findings.length,
    0,
  );
  data.variables[0].valuesByMode.default = { type: 'VARIABLE_ALIAS', id: 'p' };
  assert.ok(
    compare(data, contract([token('space.16', '16px')])).findings.some(
      (f) => f.kind === 'unresolved' && /cycle/.test(f.reason),
    ),
  );
});

test('Light and Dark are checked independently, including color alpha', () => {
  const data = snapshot([variable('c', 'color/bg/base', null, 'COLOR', 'theme')]);
  data.collections.push({
    id: 'theme',
    name: 'Theme',
    defaultModeId: 'l',
    modes: [
      { modeId: 'l', name: 'Light' },
      { modeId: 'd', name: 'Dark' },
    ],
  });
  data.variables[0].valuesByMode = {
    l: { r: 1, g: 1, b: 1, a: 1 },
    d: { r: 0, g: 0, b: 0, a: 0.5 },
  };
  const report = compare(data, {
    light: [token('color.bg.base', '#ffffff', '#ffffff', 'color')],
    dark: [token('color.bg.base', '#000000', '#000000', 'color')],
  });
  assert.deepEqual(
    report.findings.filter((f) => f.kind === 'value-mismatch').map((f) => f.theme),
    ['dark'],
  );
});

test('unknown modes, missing alias targets and collection IDs never silently pass', () => {
  const data = snapshot([variable('s', 'space/16', { type: 'VARIABLE_ALIAS', id: 'missing' })]);
  assert.ok(
    compare(data, contract([token('space.16', '16px')])).findings.some(
      (f) => f.kind === 'unresolved',
    ),
  );
  data.collections[0] = {
    ...collection,
    modes: [
      { modeId: 'a', name: 'Day' },
      { modeId: 'b', name: 'Night' },
    ],
    defaultModeId: 'a',
  };
  assert.ok(
    compare(data, contract([token('space.16', '16px')])).findings.some(
      (f) => f.kind === 'unresolved',
    ),
  );
});

test('name collisions and Figma-only/repo-only entries remain visible', () => {
  const report = compare(
    snapshot([
      variable('a', 'space/16', 16),
      variable('b', 'space.16', 16),
      variable('c', 'extra/name', 0),
    ]),
    contract([token('space.16', '16px'), token('radius.16', '16px')]),
  );
  for (const kind of ['name-collision', 'figma-only', 'repo-only'])
    assert.ok(report.findings.some((f) => f.kind === kind));
});

test('incomplete exports and malformed snapshots cannot certify parity', () => {
  assert.throws(() => validateSnapshot({}), /Invalid/);
  const data = snapshot([]);
  data.coverage.complete = false;
  assert.ok(compare(data, contract([])).findings.some((f) => f.kind === 'incomplete-export'));
  assert.equal(compare(snapshot([]), contract([])).status, 'audit-only');
  const duplicate = snapshot([variable('a', 'space/1', 1), variable('a', 'space/2', 2)]);
  assert.throws(() => validateSnapshot(duplicate), /duplicate/);
});

test('master bindings include literals, paints and text style review without equating a style ID with a token', () => {
  const data = snapshot([]);
  data.nodes.push({
    id: 'n',
    name: 'part',
    type: 'TEXT',
    visible: false,
    masterId: 'master',
    paddingTop: 16,
    paddingLeft: 16,
    boundVariables: { paddingLeft: { type: 'VARIABLE_ALIAS', id: 's' } },
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
    textSegments: [
      {
        start: 0,
        end: 2,
        textStyleId: 'style',
        boundVariables: { fontSize: { type: 'VARIABLE_ALIAS', id: 's' } },
      },
    ],
  });
  const report = compare(data, contract([]));
  assert.ok(report.bindingReview.some((f) => f.field === 'paddingTop'));
  assert.ok(!report.bindingReview.some((f) => f.field === 'paddingLeft' || f.field === 'fontSize'));
  assert.ok(report.bindingReview.some((f) => f.field === 'fills[0]'));
  assert.ok(report.bindingReview.some((f) => f.styleId === 'style'));
});

async function runPlugin({ missingMain = false, failTraversal = false } = {}) {
  const messages = [];
  const text = {
    id: 'text',
    name: 'Label',
    type: 'TEXT',
    boundVariables: {},
    getStyledTextSegments: () => [
      {
        characters: 'PRIVATE TEXT',
        start: 0,
        end: 12,
        textStyleId: 'remote-style',
        boundVariables: {},
      },
    ],
  };
  const instance = {
    id: 'instance',
    name: 'Button',
    type: 'INSTANCE',
    get children() {
      return api.skipInvisibleInstanceChildren ? [] : [text];
    },
    getMainComponentAsync: async () =>
      missingMain ? null : { id: 'master', key: 'key', name: 'Button', remote: false },
  };
  const master = {
    id: 'master',
    name: 'Button',
    key: 'key',
    type: 'COMPONENT',
    children: [instance],
  };
  const page = { id: 'page', name: 'DS', children: [master] };
  const api = {
    editorType: 'dev',
    skipInvisibleInstanceChildren: true,
    root: { name: 'Test file', children: [page] },
    fileKey: 'test-key',
    showUI: () => {},
    loadAllPagesAsync: async () => {
      if (failTraversal) throw new Error('page failed');
    },
    ui: { postMessage: (message) => messages.push(message) },
    variables: {
      getLocalVariablesAsync: async () => [variable('s', 'space/16', 16)],
      getLocalVariableCollectionsAsync: async () => [collection],
      getVariableByIdAsync: async () => ({
        ...variable('remote', 'type/size/12', 12),
        remote: true,
      }),
    },
    getLocalTextStylesAsync: async () => [],
    getLocalPaintStylesAsync: async () => [],
    getLocalEffectStylesAsync: async () => [],
    getStyleByIdAsync: async () => ({
      id: 'remote-style',
      name: 'Label/S',
      type: 'TEXT',
      remote: true,
      boundVariables: { fontSize: { type: 'VARIABLE_ALIAS', id: 'remote' } },
    }),
  };
  const before = JSON.stringify(api);
  const code = await readFile(new URL('./plugin/code.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, { figma: api, __html__: '<p>test</p>' });
  await api.ui.onmessage({ type: 'export' });
  assert.equal(JSON.stringify(api), before);
  return JSON.parse(JSON.stringify(messages[0]));
}

test('plugin exports masters, per-range text bindings, remote dependencies and instance references', async () => {
  const result = await runPlugin();
  assert.equal(result.type, 'snapshot');
  validateSnapshot(result.snapshot);
  assert.equal(result.snapshot.coverage.complete, true);
  assert.equal(result.snapshot.nodes.length, 3);
  assert.equal(result.snapshot.variables.length, 2);
  assert.equal(result.snapshot.styles[0].id, 'remote-style');
  assert.ok(!JSON.stringify(result).includes('PRIVATE TEXT'));
});

test('plugin marks missing instance masters incomplete and never emits success on traversal failure', async () => {
  assert.equal((await runPlugin({ missingMain: true })).snapshot.coverage.complete, false);
  const failure = await runPlugin({ failTraversal: true });
  assert.equal(failure.type, 'error');
  assert.ok(!failure.snapshot);
});

test('CLI writes review reports from a snapshot and rejects overwriting its input', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'figma-audit-test-'));
  try {
    const input = join(dir, 'snapshot.json');
    const prefix = join(dir, 'report');
    const contents = JSON.stringify(snapshot([variable('s', 'space/16', 16)]));
    await writeFile(input, contents);
    const cli = fileURLToPath(new URL('./compare.mjs', import.meta.url));
    const result = spawnSync(process.execPath, [cli, input, prefix], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    const report = JSON.parse(await readFile(`${prefix}.json`, 'utf8'));
    assert.equal(report.status, 'audit-only');
    assert.ok(report.findings.some((f) => f.kind === 'repo-only'));
    assert.match(await readFile(`${prefix}.md`, 'utf8'), /paridade ainda não certificada/);
    assert.equal(await readFile(input, 'utf8'), contents);
    const overwrite = spawnSync(process.execPath, [cli, input, input.slice(0, -5)], {
      encoding: 'utf8',
    });
    assert.equal(overwrite.status, 2);
    assert.match(overwrite.stderr, /overwrite/);
    assert.equal(await readFile(input, 'utf8'), contents);
  } finally {
    await rm(dir, { recursive: true });
  }
});
