import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  validateSnapshot,
  figmaTokenName,
  loadContract,
  compare,
} from '../figma-audit/compare.mjs';
import renames from './renames.json' with { type: 'json' };

export function createPlan(snapshot) {
  validateSnapshot(snapshot);
  if (!snapshot.coverage.complete || snapshot.coverage.warnings.length)
    throw Error('Snapshot incompleto.');
  const collections = new Map(snapshot.collections.map((c) => [c.id, c]));
  const nodes = new Map(snapshot.nodes.map((n) => [n.id, n]));
  const renamed = structuredClone(snapshot);
  const operations = [];
  for (const variable of renamed.variables) {
    if (collections.get(variable.variableCollectionId)?.name !== 'typography') continue;
    if (renames[variable.name]) {
      const oldName = variable.name;
      variable.name = renames[oldName];
      const syntax = `var(${figmaTokenName(variable, collections.get(variable.variableCollectionId))})`;
      operations.push({
        kind: 'rename',
        id: variable.id,
        before: oldName,
        after: variable.name,
        syntax,
      });
      variable.codeSyntax.WEB = syntax;
    }
  }
  const byName = new Map(
    renamed.variables.map((v) => [figmaTokenName(v, collections.get(v.variableCollectionId)), v]),
  );
  const idFor = (path) => {
    const variable = byName.get('--ds-' + path.replaceAll('/', '-'));
    if (!variable) throw Error('Variável ausente: ' + path);
    return variable.id;
  };
  const roots = snapshot.nodes.filter(
    (n) => n.type === 'COMPONENT' && n.pageId === '0:1' && nodes.get(n.parentId)?.name === 'Card',
  );
  if (roots.length !== 8) throw Error('Esperados os oito masters Card auditados.');
  const cardIds = new Set(roots.map((n) => n.id));
  const exceptions = [];
  const beforeNodes = [];
  function bind(node, field, path, text = false) {
    const variableId = idFor(path);
    operations.push({
      kind: text ? 'text-bind' : 'bind',
      id: node.id,
      field,
      variableId,
      masterId: node.masterId,
    });
  }
  for (const node of snapshot.nodes.filter((n) => cardIds.has(n.masterId))) {
    const start = operations.length;
    if (node.type === 'TEXT') {
      if (node.textSegments.length !== 1) throw Error('Texto misto inesperado: ' + node.id);
      const segment = node.textSegments[0];
      const px = (x) =>
        x.unit === 'PIXELS'
          ? x.value
          : x.unit === 'PERCENT'
            ? (x.value * segment.fontSize) / 100
            : null;
      const styles = snapshot.styles.filter(
        (style) =>
          style.type === 'TEXT' &&
          JSON.stringify(style.fontName) === JSON.stringify(segment.fontName) &&
          style.fontSize === segment.fontSize &&
          px(style.lineHeight) !== null &&
          px(style.lineHeight) === px(segment.lineHeight) &&
          Math.abs(px(style.letterSpacing) - px(segment.letterSpacing)) < 1e-5,
      );
      if (styles.length === 1)
        operations.push({
          kind: 'style',
          id: node.id,
          styleId: styles[0].id,
          masterId: node.masterId,
        });
      else {
        bind(node, 'fontFamily', 'type/family/primary', true);
        bind(node, 'fontWeight', `type/weight/${segment.fontWeight}`, true);
        bind(node, 'fontSize', `type/size/${segment.fontSize}`, true);
        if (px(segment.letterSpacing) === 0)
          bind(node, 'letterSpacing', 'type/tracking-px/zero', true);
        else throw Error('Tracking inesperado: ' + node.id);
        if (segment.lineHeight.unit === 'AUTO')
          exceptions.push({
            nodeId: node.id,
            field: 'lineHeight',
            reason: 'AUTO preservado para manter a métrica atual; requer revisão da composição.',
          });
        else bind(node, 'lineHeight', `type/line-height/${px(segment.lineHeight)}`, true);
      }
    } else if ('layoutMode' in node) {
      if (node.layoutMode !== 'NONE') {
        for (const field of [
          'paddingTop',
          'paddingRight',
          'paddingBottom',
          'paddingLeft',
          'itemSpacing',
        ]) {
          if (typeof node[field] === 'number') bind(node, field, `space/${node[field]}`);
        }
      }
      for (const field of [
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
      ]) {
        if (typeof node[field] === 'number')
          bind(node, field, `radius/${node[field] === 999 ? 'pill' : node[field]}`);
      }
      if (node.strokes?.some((paint) => paint.visible !== false)) {
        const path = { 1: 'subtle', 1.5: 'icon', 2: 'control' }[node.strokeWeight];
        if (!path) throw Error('Traço inesperado: ' + node.id);
        bind(node, 'strokeWeight', 'stroke/' + path);
      }
    }
    if (operations.length !== start)
      beforeNodes.push({
        id: node.id,
        type: node.type,
        masterId: node.masterId,
        expected: Object.fromEntries(
          Object.entries(node).filter(([key]) =>
            [
              'width',
              'height',
              'paddingTop',
              'paddingRight',
              'paddingBottom',
              'paddingLeft',
              'itemSpacing',
              'topLeftRadius',
              'topRightRadius',
              'bottomLeftRadius',
              'bottomRightRadius',
              'strokeWeight',
              'fontName',
              'fontSize',
              'fontWeight',
              'lineHeight',
              'letterSpacing',
              'textStyleId',
              'boundVariables',
            ].includes(key),
          ),
        ),
        textLength: node.textSegments?.[0]?.end ?? null,
      });
  }
  return {
    schemaVersion: 1,
    sourceExportedAt: snapshot.exportedAt,
    fileName: snapshot.file.name,
    collections: snapshot.collections.map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      modes: c.modes,
    })),
    variables: snapshot.variables.map((v) => ({
      id: v.id,
      key: v.key,
      name: v.name,
      variableCollectionId: v.variableCollectionId,
      valuesByMode: v.valuesByMode,
      codeSyntax: v.codeSyntax,
    })),
    styles: snapshot.styles,
    cardIds: [...cardIds],
    beforeNodes,
    operations,
    exceptions,
    expectedSnapshot: renamed,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output)
    throw Error('Usage: node tools/figma-align/build.mjs <snapshot.json> <output-directory>');
  const contents = await readFile(resolve(input), 'utf8');
  const plan = createPlan(JSON.parse(contents));
  const report = compare(plan.expectedSnapshot, await loadContract());
  if (report.findings.length)
    throw Error('Contrato de tokens ainda diverge: ' + report.findings.length);
  delete plan.expectedSnapshot;
  plan.sourceSha256 = createHash('sha256').update(contents).digest('hex');
  const dir = resolve(output);
  await mkdir(dir, { recursive: true });
  const runtime = await readFile(new URL('./plugin/runtime.js', import.meta.url), 'utf8');
  await writeFile(dir + '/code.js', `const PLAN = ${JSON.stringify(plan)};\n${runtime}`);
  await writeFile(dir + '/plan.json', JSON.stringify(plan, null, 2) + '\n');
  for (const file of ['manifest.json', 'ui.html'])
    await copyFile(new URL('./plugin/' + file, import.meta.url), dir + '/' + file);
  process.stdout.write(
    JSON.stringify({
      output: dir,
      operations: plan.operations.length,
      renames: plan.operations.filter((o) => o.kind === 'rename').length,
      nodes: plan.beforeNodes.length,
      exceptions: plan.exceptions.length,
    }) + '\n',
  );
}
