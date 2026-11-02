import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
