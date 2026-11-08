import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compareTextStyles, contrast } from './components.mjs';
import { loadContract } from './compare.mjs';
const projection = JSON.parse(
  await readFile(new URL('../../design/figma/component-contract.json', import.meta.url)),
);
const contract = await loadContract();

test('the 12 actual exported text styles match six contract fields and five bindings in both themes', () => {
  const report = compareTextStyles(projection, contract);
  assert.equal(report.styles, 12);
  assert.deepEqual(report.findings, []);
});
test('style drift and coincident values with missing bindings cannot pass the style audit', () => {
  const changed = structuredClone(projection);
  changed.styles[0].fontSize += 1;
  delete changed.styles[0].bindings.fontFamily;
  const report = compareTextStyles(changed, contract);
  assert.ok(report.findings.some((f) => f.kind === 'style-value' && f.field === 'fontSize'));
  assert.ok(report.findings.some((f) => f.kind === 'style-binding' && f.field === 'fontFamily'));
});
test('unknown or missing styles are explicit findings, never silently ignored', () => {
  const changed = structuredClone(projection);
  changed.styles[0].name = 'Custom/Unknown';
  const report = compareTextStyles(changed, contract);
  assert.ok(report.findings.some((f) => f.kind === 'missing-style'));
  assert.ok(report.findings.some((f) => f.kind === 'unmapped-style'));
});
test('the projection preserves the actual exported variant combinations, not an invented cartesian product', () => {
  for (const set of projection.sets) {
    const combinations = new Set();
    for (const variant of set.variants) {
      const combination = Object.entries(variant.properties).sort(([a], [b]) => a.localeCompare(b));
      assert.ok(!combinations.has(JSON.stringify(combination)), `${set.name}: duplicate variant`);
      combinations.add(JSON.stringify(combination));
      for (const [name, value] of combination)
        assert.ok(
          set.definitions[name]?.variantOptions?.includes(value),
          `${set.name}: ${name}=${value}`,
        );
    }
  }
});
test('contrast calculations use sRGB luminance with expected AA boundaries', () => {
  assert.equal(contrast('#000000', '#FFFFFF'), 21);
  assert.equal(contrast('#FFFFFF', '#FFFFFF'), 1);
  assert.ok(contrast('#161C28', '#FFFFFF') > 4.5);
});
