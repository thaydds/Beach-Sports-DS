import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { compare, loadContract } from './compare.mjs';

async function tokenFixture() {
  const projection = JSON.parse(
    await readFile(new URL('./fixtures/figma-token-export.json', import.meta.url), 'utf8'),
  );
  assert.equal(projection.kind, 'figma-variable-projection');
  assert.equal(projection.variables.length, 294);
  // Mock only the unused node/page envelope. The projection is explicitly token-only,
  // never a substitute for a full export or evidence of complete component coverage.
  return {
    schemaVersion: 1,
    file: { name: 'token comparison test fixture' },
    coverage: { scope: 'all-pages', complete: true, warnings: [] },
    pages: [{ id: 'fixture', name: 'Token-only test fixture' }],
    nodes: [],
    styles: [],
    variables: projection.variables,
    collections: projection.collections,
  };
}

test('all 294 original Figma names, values, types, codeSyntax and aliases match both themes', async () => {
  const report = compare(await tokenFixture(), await loadContract());
  assert.deepEqual(report.findings, []);
  assert.equal(report.tokenModeValuesMatched, 588);
  assert.equal(report.compatibilityAliases.length, 15);
});

test('all 272 published token values remain compatible in both themes', async () => {
  const before = JSON.parse(
    await readFile(
      new URL('../../design/figma/published-token-values.json', import.meta.url),
      'utf8',
    ),
  );
  const after = await loadContract();
  for (const theme of ['light', 'dark']) {
    assert.equal(before[theme].length, 272);
    assert.equal(after[theme].length, 309);
    const current = new Map(after[theme].map((token) => [token.name, token]));
    for (const token of before[theme])
      assert.equal(current.get(token.name)?.value, token.value, theme + '/' + token.name);
  }
});

test('a compatibility alias must reference a canonical Figma token with the same type', async () => {
  const contract = await loadContract();
  const compatibility = contract.light.find((token) => token.compatibility);
  compatibility.raw = 'Regular';
  assert.ok(
    compare(await tokenFixture(), contract).findings.some(
      (f) => f.kind === 'invalid-compatibility-alias',
    ),
  );
});

test('compatibility metadata cannot hide a primary token present in Figma', async () => {
  const contract = await loadContract();
  const token = contract.light.find((t) => t.name === '--ds-type-style-regular');
  token.compatibility = { replacement: 'type.style.bold' };
  token.raw = '{type.style.bold}';
  assert.ok(
    compare(await tokenFixture(), contract).findings.some(
      (f) => f.kind === 'compatibility-name-in-figma',
    ),
  );
});

test('drift in the exported values remains a failure', async () => {
  const snapshot = await tokenFixture();
  const variable = snapshot.variables.find((v) => v.name === 'space/16');
  for (const id of Object.keys(variable.valuesByMode)) variable.valuesByMode[id] = 17;
  assert.ok(
    compare(snapshot, await loadContract()).findings.some((f) => f.kind === 'value-mismatch'),
  );
});

test('percent-to-FLOAT adaptation is limited to explicitly named tokens', () => {
  const snapshot = {
    schemaVersion: 1,
    file: {},
    coverage: { scope: 'all-pages', complete: true, warnings: [] },
    pages: [{ id: 'fixture', name: 'fixture' }],
    collections: [
      {
        id: 'type',
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
        variableCollectionId: 'type',
        valuesByMode: { m: 2 },
      },
    ],
    nodes: [],
    styles: [],
  };
  const tokens = [{ name: '--ds-type-tracking-2', type: 'string', raw: '2%', value: '2%' }];
  assert.deepEqual(compare(snapshot, { light: tokens, dark: tokens }).findings, []);
  snapshot.variables[0].name = 'custom';
  tokens[0].name = '--ds-type-custom';
  assert.ok(
    compare(snapshot, { light: tokens, dark: tokens }).findings.some(
      (f) => f.kind === 'type-mismatch',
    ),
  );
});

test('CLI reports aligned tokens separately from component binding review candidates', async () => {
  const snapshot = await tokenFixture();
  snapshot.nodes = [
    { id: 'card', name: 'Card fixture', type: 'COMPONENT', masterId: 'card', paddingLeft: 16 },
  ];
  const dir = await mkdtemp(join(tmpdir(), 'figma-token-cli-'));
  try {
    const input = join(dir, 'input.json'),
      prefix = join(dir, 'report');
    await writeFile(input, JSON.stringify(snapshot));
    const cli = fileURLToPath(new URL('./compare.mjs', import.meta.url));
    const result = spawnSync(process.execPath, [cli, input, prefix], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(await readFile(prefix + '.json', 'utf8'));
    assert.equal(report.tokenStatus, 'matches-snapshot');
    assert.equal(report.status, 'audit-only');
    assert.equal(report.bindingReview.length, 1);
  } finally {
    await rm(dir, { recursive: true });
  }
});
