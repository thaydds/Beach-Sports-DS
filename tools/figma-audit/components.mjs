import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSnapshot, figmaTokenName, loadContract } from './compare.mjs';

// Read-only projection of the actual export. Keep identifiers, never generated expectations.
export function projectComponents(snapshot, sourceSha256) {
  validateSnapshot(snapshot);
  const variables = new Map(snapshot.variables.map((v) => [v.id, v]));
  const collections = new Map(snapshot.collections.map((c) => [c.id, c]));
  const children = new Map();
  for (const n of snapshot.nodes) {
    if (!children.has(n.parentId)) children.set(n.parentId, []);
    children.get(n.parentId).push(n);
  }
  const tokenName = (id) => {
    const v = variables.get(id);
    return v ? figmaTokenName(v, collections.get(v.variableCollectionId)) : id;
  };
  const bindings = (object = {}) =>
    Object.fromEntries(
      Object.entries(object).map(([k, v]) => [
        k,
        Array.isArray(v) ? v.map((x) => tokenName(x.id)) : tokenName(v.id),
      ]),
    );
  const paints = (n, field) =>
    (n[field] || [])
      .filter((p) => p.type === 'SOLID' && p.visible !== false)
      .map((p) => {
        const token = p.boundVariables?.color ? tokenName(p.boundVariables.color.id) : null;
        return { token, ...(token ? {} : { value: p.color }), opacity: p.opacity ?? 1 };
      });
  const geometry = (n) =>
    Object.fromEntries(
      [
        'width',
        'height',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'itemSpacing',
        'cornerRadius',
        'strokeWeight',
      ]
        .filter((k) => k in n)
        .map((k) => [k, n[k]]),
    );
  const part = (n) => ({
    id: n.id,
    parentId: n.parentId,
    name: n.name,
    type: n.type,
    visible: n.visible,
    geometry: geometry(n),
    fills: paints(n, 'fills'),
    strokes: paints(n, 'strokes'),
    bindings: bindings(n.boundVariables),
    text: (n.textSegments || []).map((t) => ({
      ...Object.fromEntries(
        ['fontName', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textStyleId']
          .filter((k) => k in t)
          .map((k) => [k, t[k]]),
      ),
      bindings: bindings(t.boundVariables),
    })),
  });
  const descendants = (id) => (children.get(id) || []).flatMap((n) => [n, ...descendants(n.id)]);
  const sets = snapshot.nodes
    .filter((n) => n.type === 'COMPONENT_SET' && n.pageId === '0:1')
    .map((s) => ({
      id: s.id,
      name: s.name,
      definitions: s.componentPropertyDefinitions,
      variants: (children.get(s.id) || [])
        .filter((n) => n.type === 'COMPONENT')
        .map((v) => ({
          id: v.id,
          name: v.name,
          properties: v.variantProperties,
          geometry: geometry(v),
          fills: paints(v, 'fills'),
          strokes: paints(v, 'strokes'),
          ...(s.name === 'Card' ? { parts: descendants(v.id).map(part) } : {}),
        })),
    }));
  const styles = snapshot.styles
    .filter((s) => s.type === 'TEXT' && !s.remote)
    .map((s) => ({
      ...Object.fromEntries(
        [
          'id',
          'name',
          'type',
          'fontName',
          'fontSize',
          'lineHeight',
          'letterSpacing',
          'paragraphSpacing',
          'paragraphIndent',
          'textCase',
          'textDecoration',
        ].map((k) => [k, s[k]]),
      ),
      bindings: bindings(s.boundVariables),
    }));
  return {
    schemaVersion: 1,
    sourceSha256,
    exportedAt: snapshot.exportedAt,
    pageId: '0:1',
    coverage: snapshot.coverage,
    styles,
    sets,
  };
}

export function compareTextStyles(projection, contract) {
  const findings = [];
  const expectedStyles = [
    ...new Set(
      contract.light
        .filter((t) =>
          /^--ds-type-(?:display|heading|body|label|control)-\w+-font-size$/.test(t.name),
        )
        .map((t) => t.name.replace(/^--ds-type-/, '').replace(/-font-size$/, '')),
    ),
  ];
  const byName = new Map(projection.styles.map((s) => [s.name.toLowerCase().replace('/', '-'), s]));
  const fieldMap = {
    fontFamily: 'font-family',
    fontWeight: 'font-weight',
    fontSize: 'font-size',
    lineHeight: 'line-height',
    letterSpacing: 'letter-spacing',
  };
  const numeric = (v) => (typeof v === 'string' && v.endsWith('px') ? Number.parseFloat(v) : v);
  for (const theme of ['light', 'dark']) {
    const tokens = new Map(contract[theme].map((t) => [t.name, t]));
    for (const name of expectedStyles) {
      const style = byName.get(name);
      if (!style) {
        findings.push({ kind: 'missing-style', name, theme });
        continue;
      }
      const values = {
        fontFamily: style.fontName.family,
        fontWeight: style.fontName.variationSettings?.wght,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight.unit === 'PIXELS' ? style.lineHeight.value : null,
        letterSpacing:
          style.letterSpacing.unit === 'PIXELS'
            ? style.letterSpacing.value
            : (style.fontSize * style.letterSpacing.value) / 100,
      };
      for (const [field, suffix] of Object.entries(fieldMap)) {
        const token = `--ds-type-${name}-${suffix}`;
        const wanted = numeric(tokens.get(token)?.value);
        const actual = values[field];
        if (
          typeof wanted === 'number' && typeof actual === 'number'
            ? Math.abs(wanted - actual) > 1e-5
            : wanted !== actual
        )
          findings.push({ kind: 'style-value', name, theme, field, expected: wanted, actual });
        if (style.bindings[field] !== token)
          findings.push({
            kind: 'style-binding',
            name,
            theme,
            field,
            expected: token,
            actual: style.bindings[field] ?? null,
          });
      }
      const fontStyle = tokens.get(`--ds-type-${name}-font-style`)?.value;
      if (style.fontName.style !== fontStyle)
        findings.push({
          kind: 'font-style',
          name,
          theme,
          expected: fontStyle,
          actual: style.fontName.style,
        });
    }
  }
  for (const name of byName.keys())
    if (!expectedStyles.includes(name)) findings.push({ kind: 'unmapped-style', name });
  return { styles: expectedStyles.length, fieldsPerStyle: 6, themes: 2, findings };
}

export function contrast(foreground, background) {
  const luminance = (hex) => {
    const c = [1, 3, 5]
      .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  };
  const a = luminance(foreground),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output || resolve(input) === resolve(output))
    throw new Error(
      'Usage: node components.mjs <full-export.json> <projection.json> (distinct paths)',
    );
  const raw = await readFile(input);
  const projection = projectComponents(
    JSON.parse(raw),
    createHash('sha256').update(raw).digest('hex'),
  );
  const report = compareTextStyles(projection, await loadContract());
  await writeFile(output, `${JSON.stringify(projection, null, 2)}\n`);
  process.stdout.write(
    `${projection.sets.length} sets; ${projection.sets.reduce((n, s) => n + s.variants.length, 0)} variants; typography: ${JSON.stringify(report)}\n`,
  );
  process.exitCode = report.findings.length ? 1 : 0;
}
