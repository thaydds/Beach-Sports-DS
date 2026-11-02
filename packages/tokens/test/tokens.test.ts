import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import ts from 'typescript';
import { darkTokens, semanticColorRoles, tokens } from '../dist/ts/tokens.js';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

type Json = Record<string, unknown>;

function readJson(name: string): Json {
  return JSON.parse(readFileSync(join(ROOT, 'src', name), 'utf8')) as Json;
}

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Leaf tokens: nodes that declare `$value`, keyed by their dot path. */
function collectTokens(
  node: Json,
  prefix: string[] = [],
  out = new Map<string, unknown>(),
): Map<string, unknown> {
  if ('$value' in node) {
    out.set(prefix.join('.'), node.$value);
    return out;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$') || !isRecord(value)) continue;
    collectTokens(value, [...prefix, key], out);
  }
  return out;
}

function resolveAlias(value: unknown, refs: Map<string, unknown>, depth = 0): unknown {
  if (typeof value !== 'string' || depth > 10) return value;
  const match = /^\{(.+)\}$/.exec(value);
  if (!match?.[1]) return value;
  return resolveAlias(refs.get(match[1]), refs, depth + 1);
}

function withPrefix(tokens: Map<string, unknown>, prefix: string): Map<string, unknown> {
  return new Map([...tokens].map(([path, value]) => [`${prefix}.${path}`, value]));
}

function parseCssBlock(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  expect(start, `missing block ${selector}`).toBeGreaterThan(-1);
  const end = css.indexOf('}', start);
  const block = css.slice(start, end);
  const declarations = new Map<string, string>();
  for (const match of block.matchAll(/--ds-([a-z0-9-]+):\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name && value) declarations.set(name, value.trim());
  }
  return declarations;
}

const palette = collectTokens(readJson('palette.tokens.json').palette as Json);
const light = collectTokens(readJson('semantic.light.tokens.json').color as Json);
const dark = collectTokens(readJson('semantic.dark.tokens.json').color as Json);
const css = readFileSync(join(ROOT, 'dist', 'css', 'tokens.css'), 'utf8');

function nameOf(path: string): string {
  return `--ds-${path.replaceAll('.', '-')}`;
}

const foundations = collectTokens(readJson('foundations.tokens.json'));
const typography = collectTokens(readJson('typography.tokens.json'));
const common = new Map([...withPrefix(palette, 'palette'), ...foundations, ...typography]);
const expectedFor = (theme: Map<string, unknown>) => {
  const refs = new Map([...common, ...withPrefix(theme, 'color')]);
  return Object.fromEntries(
    [...refs].map(([path, value]) => [nameOf(path), resolveAlias(value, refs)]),
  );
};

describe('public artifact contract', () => {
  it('publishes declarations with exactly the same literal keys and values as runtime', () => {
    const fixture = join(ROOT, 'test/public-contract.fixture.ts');
    const source = `
      import { tokens, darkTokens, semanticColorRoles } from '../dist/ts/tokens.js';
      type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
      const light: Equal<typeof tokens, ${JSON.stringify(expectedFor(light))}> = true;
      const dark: Equal<typeof darkTokens, ${JSON.stringify(expectedFor(dark))}> = true;
      const roles: Equal<typeof semanticColorRoles[number], ${[...light.keys()].map((path) => JSON.stringify(path.replaceAll('.', '-'))).join(' | ')}> = true;
      void [light, dark, roles];
    `.replace(/"([^"\n]+)":/g, 'readonly "$1":');
    const options: ts.CompilerOptions = {
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      target: ts.ScriptTarget.ES2022,
      types: [],
    };
    const host = ts.createCompilerHost(options);
    const originalGetSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (file, ...args) =>
      file === fixture
        ? ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true)
        : originalGetSourceFile(file, ...args);
    const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([fixture], options, host));
    expect(
      diagnostics.map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      ),
    ).toEqual([]);
  });

  it('exports every declared token and its resolved value in JavaScript, for both themes', () => {
    expect(tokens).toEqual(expectedFor(light));
    expect(darkTokens).toEqual(expectedFor(dark));
    expect([...semanticColorRoles].sort()).toEqual(
      [...light.keys()].map((path) => path.replaceAll('.', '-')).sort(),
    );
  });

  it('preserves all foundation and typography values in the Light CSS', () => {
    const root = parseCssBlock(css, ':root');
    const expected = expectedFor(light);
    expect(Object.fromEntries([...root].map(([key, value]) => [`--ds-${key}`, value]))).toEqual(
      Object.fromEntries(Object.entries(expected).map(([key, value]) => [key, String(value)])),
    );
  });

  it('exports the same resolved contract in JSON without losing numeric types', () => {
    const resolved = JSON.parse(
      readFileSync(join(ROOT, 'dist', 'json', 'resolved.json'), 'utf8'),
    ) as Json;
    function leaves(node: Json, prefix: string[] = []): [string, unknown][] {
      return Object.entries(node).flatMap(([key, value]): [string, unknown][] => {
        if (key.startsWith('$')) return [];
        const path = [...prefix, key];
        return isRecord(value) ? leaves(value, path) : [[nameOf(path.join('.')), value]];
      });
    }
    const { color, ...base } = resolved;
    expect(isRecord(color)).toBe(true);
    if (!isRecord(color)) throw new Error('Missing themed JSON color tree');
    for (const [theme, expected] of [
      ['light', tokens],
      ['dark', darkTokens],
    ] as const) {
      const colors = color[theme];
      if (!isRecord(colors)) throw new Error(`Missing ${theme} JSON tree`);
      expect(Object.fromEntries([...leaves(base), ...leaves(colors)])).toEqual(expected);
    }
  });
});

describe('technical reference stays aligned with the sources', () => {
  const markdown = readFileSync(join(ROOT, '../../docs/tokens.md'), 'utf8');
  const rows = markdown.split('\n').filter((line) => line.startsWith('|'));

  it('documents every palette, semantic and geometry token with the correct values', () => {
    const documented = new Set<string>();
    const expectedLight = expectedFor(light);
    const expectedDark = expectedFor(dark);
    for (const row of rows) {
      const cells = row.split('|').map((cell) => cell.trim());
      const name = /`(--ds-(?:palette|color|space|size|radius|stroke|target|focus)-[\w-]+)`/.exec(
        cells[2] ?? '',
      )?.[1];
      if (!name) continue;
      documented.add(name);
      if (name.startsWith('--ds-color-')) {
        expect(cells[3], name).toContain(String(expectedLight[name]));
        expect(cells[4], name).toContain(String(expectedDark[name]));
      } else {
        expect(cells[3], name).toBe(String(expectedLight[name]));
      }
    }
    expect([...documented].sort()).toEqual(
      Object.keys(expectedLight)
        .filter((name) => !name.startsWith('--ds-type-'))
        .sort(),
    );
  });

  it('keeps typography weight, size, line height and tracking aligned', () => {
    const documented = new Set<string>();
    const values: Record<string, unknown> = expectedFor(light);
    for (const row of rows) {
      const cells = row.split('|').map((cell) => cell.trim());
      const prefix = /`(--ds-type-[\w-]+)-\*`/.exec(cells[2] ?? '')?.[1];
      if (!prefix) continue;
      documented.add(prefix);
      expect(cells[3], prefix).toBe(String(values[`${prefix}-font-weight`]));
      expect(cells[4], prefix).toBe(
        `${String(values[`${prefix}-font-size`]).replace('px', '')} / ${String(values[`${prefix}-line-height`]).replace('px', '')}`,
      );
      expect(cells[5]?.split(' ')[0], prefix).toBe(values[`${prefix}-letter-spacing-percent`]);
      expect(cells[6], prefix).toBe(values[`${prefix}-letter-spacing`]);
    }
    expect([...documented].sort()).toEqual(
      Object.keys(values)
        .filter((name) => name.endsWith('-letter-spacing-percent'))
        .map((name) => name.replace('-letter-spacing-percent', ''))
        .sort(),
    );
  });
});

describe('semantic color parity', () => {
  it('exposes exactly 34 roles in Light', () => {
    expect(light.size).toBe(34);
  });

  it('exposes exactly 34 roles in Dark', () => {
    expect(dark.size).toBe(34);
  });

  it('uses the same 34 paths in both themes', () => {
    const lightPaths = [...light.keys()].sort();
    const darkPaths = [...dark.keys()].sort();
    expect(darkPaths).toEqual(lightPaths);
  });
});

describe('generated tokens.css', () => {
  const root = parseCssBlock(css, ':root');
  const darkBlock = parseCssBlock(css, '[data-theme="dark"]');

  it('writes Light color roles on :root', () => {
    const roles = [...light.keys()].map((path) => path.replaceAll('.', '-'));
    for (const role of roles) {
      expect(root.has(`color-${role}`), `missing --ds-color-${role}`).toBe(true);
    }
  });

  it('writes exactly the 34 Dark roles inside [data-theme="dark"]', () => {
    expect(darkBlock.size).toBe(34);
    const roles = [...dark.keys()].map((path) => path.replaceAll('.', '-')).sort();
    expect([...darkBlock.keys()].sort()).toEqual(roles.map((role) => `color-${role}`));
  });

  it('resolves every alias to a palette value (no var() chain, no pending braces)', () => {
    const paletteValues = new Set(
      [...palette.values()].map((value) => String(value).toLowerCase()),
    );

    expect(css).not.toContain('{palette.');
    expect(css).not.toContain('var(');

    for (const [name, value] of [...root, ...darkBlock]) {
      if (!name.startsWith('color-')) continue;
      expect(paletteValues.has(value.toLowerCase()), `${name} = ${value}`).toBe(true);
    }
  });

  it('resolves each Light role to its declared alias chain', () => {
    const refs = new Map([...withPrefix(palette, 'palette'), ...withPrefix(light, 'color')]);
    for (const [path, value] of light) {
      expect(root.get(`color-${path.replaceAll('.', '-')}`)).toBe(resolveAlias(value, refs));
    }
  });

  it('resolves each Dark role to its declared alias chain', () => {
    const refs = new Map([...withPrefix(palette, 'palette'), ...withPrefix(dark, 'color')]);
    for (const [path, value] of dark) {
      expect(darkBlock.get(`color-${path.replaceAll('.', '-')}`)).toBe(resolveAlias(value, refs));
    }
  });

  it('exports the full palette (69 primitives)', () => {
    expect(palette.size).toBe(69);
    for (const [path, value] of palette) {
      expect(root.get(`palette-${path.replaceAll('.', '-')}`)).toBe(value);
    }
  });
});
