import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import mapping from './mapping.json' with { type: 'json' };

const root = fileURLToPath(new URL('../../', import.meta.url));
const aliasPath = (value) =>
  typeof value === 'string' && /^\{[^{}]+\}$/.test(value) ? value.slice(1, -1) : null;

// Same path conversion as packages/tokens/sd.config.ts; parity is regression tested.
export function canonicalName(name) {
  if (name.startsWith('--ds-')) return name;
  return `--ds-${name
    .replaceAll('.', '-')
    .replaceAll('/', '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()}`;
}

export function figmaTokenName(variable, collection) {
  const prefix = mapping.collectionPrefixes[collection?.name] || '';
  const name = variable.name;
  if (
    !prefix ||
    name.startsWith('--ds-') ||
    name.startsWith(`${prefix}/`) ||
    name.startsWith(`${prefix}.`)
  )
    return canonicalName(name);
  return canonicalName(`${prefix}/${name}`);
}

export async function loadContract(repoRoot = root) {
  const themes = {};
  for (const theme of ['light', 'dark']) {
    const tokens = new Map();
    function walk(value, path = [], inheritedType) {
      if (Object.hasOwn(value, '$value')) {
        const name = canonicalName(path.join('.'));
        if (tokens.has(name)) throw new Error(`Canonical name collision: ${name}`);
        tokens.set(name, {
          name,
          path: path.join('.'),
          type: value.$type || inheritedType,
          raw: value.$value,
        });
        return;
      }
      for (const [key, child] of Object.entries(value)) {
        if (!key.startsWith('$')) walk(child, [...path, key], value.$type || inheritedType);
      }
    }
    for (const file of ['palette', 'foundations', 'typography', `semantic.${theme}`]) {
      walk(
        JSON.parse(
          await readFile(resolve(repoRoot, 'packages/tokens/src', `${file}.tokens.json`), 'utf8'),
        ),
      );
    }
    function resolveValue(token, seen = new Set()) {
      if (seen.has(token.name)) throw new Error(`Token alias cycle: ${token.name}`);
      const path = aliasPath(token.raw);
      if (!path) return token.raw;
      const target = tokens.get(canonicalName(path));
      if (!target) throw new Error(`Missing token alias: ${path}`);
      return resolveValue(target, new Set([...seen, token.name]));
    }
    themes[theme] = [...tokens.values()].map((token) => ({ ...token, value: resolveValue(token) }));
  }
  return themes;
}

export function validateSnapshot(snapshot) {
  if (
    !snapshot ||
    snapshot.schemaVersion !== 1 ||
    snapshot.coverage?.scope !== 'all-pages' ||
    typeof snapshot.coverage.complete !== 'boolean' ||
    !Array.isArray(snapshot.coverage.warnings) ||
    !snapshot.file ||
    !Array.isArray(snapshot.pages) ||
    !snapshot.pages.length
  ) {
    throw new Error('Invalid or unsupported audit snapshot; export all pages with this plugin.');
  }
  for (const key of ['variables', 'collections', 'styles', 'nodes']) {
    if (!Array.isArray(snapshot[key])) throw new Error(`Missing snapshot array: ${key}`);
    const ids = new Set();
    for (const item of snapshot[key]) {
      if (typeof item.id !== 'string' || typeof item.name !== 'string' || ids.has(item.id)) {
        throw new Error(`Invalid/duplicate ${key} id`);
      }
      ids.add(item.id);
    }
  }
  for (const variable of snapshot.variables) {
    if (
      !['FLOAT', 'COLOR', 'STRING', 'BOOLEAN'].includes(variable.resolvedType) ||
      !variable.valuesByMode ||
      typeof variable.variableCollectionId !== 'string'
    )
      throw new Error('Invalid variable');
  }
  for (const collection of snapshot.collections) {
    if (
      !Array.isArray(collection.modes) ||
      !collection.modes.length ||
      !collection.modes.some((mode) => mode.modeId === collection.defaultModeId) ||
      collection.modes.some(
        (mode) => typeof mode.modeId !== 'string' || typeof mode.name !== 'string',
      )
    ) {
      throw new Error('Invalid collection modes');
    }
  }
}

function normalized(value, type) {
  if (type === 'color') {
    if (typeof value === 'string' && /^#[\da-f]{6}([\da-f]{2})?$/i.test(value)) {
      return [1, 3, 5]
        .map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
        .concat(value.length === 9 ? parseInt(value.slice(7, 9), 16) / 255 : 1);
    }
    if (value && ['r', 'g', 'b'].every((key) => typeof value[key] === 'number')) {
      return [value.r, value.g, value.b, value.a ?? 1];
    }
  }
  if (type === 'dimension' && typeof value === 'string' && /^-?\d+(\.\d+)?px$/.test(value))
    return Number(value.slice(0, -2));
  return value;
}

function equivalent(a, b, type) {
  a = normalized(a, type);
  b = normalized(b, type);
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 1e-5);
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-5;
  return a === b;
}

export function compare(snapshot, contract) {
  validateSnapshot(snapshot);
  const findings = [];
  const add = (kind, detail) => findings.push({ kind, ...detail });
  const variables = new Map(snapshot.variables.map((v) => [v.id, v]));
  const collections = new Map(snapshot.collections.map((c) => [c.id, c]));
  const nameOf = (variable) =>
    figmaTokenName(variable, collections.get(variable.variableCollectionId));
  const named = new Map();
  for (const variable of snapshot.variables.filter((v) => !v.remote)) {
    const name = nameOf(variable);
    const syntax = variable.codeSyntax?.WEB;
    if (syntax && syntax !== `var(${name})`)
      add('code-syntax-mismatch', {
        name,
        variableId: variable.id,
        expected: `var(${name})`,
        actual: syntax,
      });
    const group = named.get(name) || [];
    group.push(variable);
    named.set(name, group);
  }
  function modeFor(variable, theme) {
    const collection = collections.get(variable.variableCollectionId);
    if (!collection) throw new Error(`Missing collection: ${variable.variableCollectionId}`);
    const matches = collection.modes.filter((mode) => mode.name.toLowerCase() === theme);
    if (matches.length === 1) return matches[0].modeId;
    if (collection.modes.length === 1 && !nameOf(variable).startsWith('--ds-color-'))
      return collection.defaultModeId;
    throw new Error(`No unambiguous ${theme} mode: ${collection.name}/${variable.name}`);
  }
  function resolveVariable(variable, theme, seen = new Set()) {
    if (seen.has(variable.id)) throw new Error(`Variable alias cycle: ${variable.name}`);
    const modeId = modeFor(variable, theme);
    if (!Object.hasOwn(variable.valuesByMode, modeId))
      throw new Error(`Missing mode value: ${variable.name}`);
    const value = variable.valuesByMode[modeId];
    if (value?.type !== 'VARIABLE_ALIAS') return value;
    const target = variables.get(value.id);
    if (!target) throw new Error(`Missing alias target: ${value.id}`);
    return resolveVariable(target, theme, new Set([...seen, variable.id]));
  }
  if (!snapshot.coverage.complete || snapshot.coverage.warnings.length)
    add('incomplete-export', { warnings: snapshot.coverage.warnings });
  const contractNames = new Set(contract.light.map((token) => token.name));
  for (const [name, matches] of named) {
    if (matches.length > 1) add('name-collision', { name, ids: matches.map((v) => v.id) });
    if (!contractNames.has(name)) add('figma-only', { name, ids: matches.map((v) => v.id) });
  }
  let matched = 0;
  for (const theme of ['light', 'dark']) {
    for (const token of contract[theme]) {
      const matches = named.get(token.name);
      if (!matches) {
        add('repo-only', { name: token.name, theme });
        continue;
      }
      if (matches.length !== 1) continue;
      const variable = matches[0];
      const base = { name: token.name, theme, variableId: variable.id };
      const expectedType = {
        color: 'COLOR',
        dimension: 'FLOAT',
        number: 'FLOAT',
        string: 'STRING',
        boolean: 'BOOLEAN',
      }[token.type];
      if (variable.resolvedType !== expectedType)
        add('type-mismatch', { ...base, expected: expectedType, actual: variable.resolvedType });
      try {
        const modeId = modeFor(variable, theme);
        const raw = variable.valuesByMode[modeId];
        const expectedAlias = aliasPath(token.raw);
        const actualAlias = raw?.type === 'VARIABLE_ALIAS' ? variables.get(raw.id) : null;
        const expected = expectedAlias ? canonicalName(expectedAlias) : null;
        const actual =
          raw?.type === 'VARIABLE_ALIAS' ? (actualAlias ? nameOf(actualAlias) : raw.id) : null;
        if (expected !== actual) add('alias-mismatch', { ...base, expected, actual });
        const value = resolveVariable(variable, theme);
        if (!equivalent(token.value, value, token.type))
          add('value-mismatch', { ...base, expected: token.value, actual: value });
        else matched++;
      } catch (error) {
        add('unresolved', { ...base, reason: error.message });
      }
    }
  }
  // Review candidates, not automatic proof of misuse: layout dimensions may be structural.
  const bindingReview = [];
  for (const node of snapshot.nodes.filter((n) => n.masterId)) {
    for (const field of [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'itemSpacing',
      'counterAxisSpacing',
      'cornerRadius',
      'strokeWeight',
    ]) {
      if (
        field === 'cornerRadius' &&
        ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'].every(
          (corner) => node.boundVariables?.[corner],
        )
      )
        continue;
      if (
        field === 'strokeWeight' &&
        (!Array.isArray(node.strokes) || !node.strokes.some((paint) => paint.visible !== false))
      )
        continue;
      if (typeof node[field] === 'number' && node[field] !== 0 && !node.boundVariables?.[field]) {
        bindingReview.push({
          nodeId: node.id,
          masterId: node.masterId,
          field,
          value: node[field],
          reason: 'literal-needs-review',
        });
      }
    }
    for (const field of ['fills', 'strokes'])
      for (const [index, paint] of (Array.isArray(node[field]) ? node[field] : []).entries()) {
        if (
          paint.type === 'SOLID' &&
          paint.visible !== false &&
          !paint.boundVariables?.color &&
          !node.boundVariables?.[field]?.length
        ) {
          bindingReview.push({
            nodeId: node.id,
            masterId: node.masterId,
            field: `${field}[${index}]`,
            styleId: node[field === 'fills' ? 'fillStyleId' : 'strokeStyleId'] || null,
            reason: 'paint-without-variable-needs-review',
          });
        }
      }
    for (const segment of node.textSegments || [])
      for (const field of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing']) {
        if (!segment.boundVariables?.[field])
          bindingReview.push({
            nodeId: node.id,
            masterId: node.masterId,
            field,
            range: [segment.start, segment.end],
            styleId: segment.textStyleId || null,
            reason: 'typography-or-style-needs-review',
          });
      }
  }
  const digest = createHash('sha256').update(JSON.stringify(contract)).digest('hex');
  return {
    schemaVersion: 1,
    status: 'audit-only',
    exportedAt: snapshot.exportedAt,
    contractDigest: digest,
    tokenModeValuesMatched: matched,
    findings,
    bindingReview,
    inventory: {
      pages: snapshot.pages.length,
      variables: snapshot.variables.length,
      masters: snapshot.nodes.filter((n) => n.type === 'COMPONENT').length,
      instances: snapshot.nodes.filter((n) => n.type === 'INSTANCE').length,
      styles: snapshot.styles.length,
      nodes: snapshot.nodes.length,
    },
    limitations: [
      'No parity certification. Typography styles, bindings, composition, variants and behavior need review.',
      'repo-only includes derived/documentation tokens; review before declaring a missing Figma variable.',
      'Mode names must be Light/Dark for semantic colors; unknown mode mappings are unresolved, never guessed.',
    ],
  };
}

export function markdown(report) {
  const lines = [
    '# Auditoria Figma × repositório',
    '',
    '**Estado: auditoria; paridade ainda não certificada.**',
    '',
    `Valores por modo coincidentes: ${report.tokenModeValuesMatched}.`,
    `Achados de tokens: ${report.findings.length}. Propriedades para revisão: ${report.bindingReview.length}.`,
    `Contrato SHA-256: \`${report.contractDigest}\`.`,
    '',
    '## Achados de tokens',
    '',
  ];
  for (const finding of report.findings) lines.push(`- ${JSON.stringify(finding)}`);
  lines.push('', '## Vínculos para revisão', '');
  for (const finding of report.bindingReview) lines.push(`- ${JSON.stringify(finding)}`);
  lines.push('', '## Limites', '', ...report.limitations.map((limit) => `- ${limit}`));
  return `${lines.join('\n')}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [input, output] = process.argv.slice(2);
    if (!input || !output)
      throw new Error('Usage: pnpm tokens:audit <snapshot.json> <report-prefix>');
    const snapshot = JSON.parse(await readFile(resolve(input), 'utf8'));
    const report = compare(snapshot, await loadContract());
    const prefix = resolve(output);
    if ([`${prefix}.json`, `${prefix}.md`].includes(resolve(input)))
      throw new Error('Report must not overwrite input.');
    await mkdir(dirname(prefix), { recursive: true });
    await writeFile(`${prefix}.json`, `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(`${prefix}.md`, markdown(report));
    process.stdout.write(
      `Audit: ${report.findings.length} token findings; ${report.bindingReview.length} binding review candidates. Not a parity certificate.\n`,
    );
    process.exitCode = report.findings.length || report.bindingReview.length ? 1 : 0;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
