import { join } from 'node:path';

import StyleDictionary from 'style-dictionary';
import type { Config, DesignTokens, TransformedToken } from 'style-dictionary/types';

export type Theme = 'light' | 'dark';

export const PACKAGE_ROOT = import.meta.dirname;

/**
 * Deterministic DTCG/Figma path → CSS custom property name.
 *
 * `color.status.danger-hover` → `--ds-color-status-danger-hover`
 * `type.label-s.font-size`    → `--ds-type-label-s-font-size`
 *
 * No manual aliases and no casing conventions: lowercase, `-` separated.
 */
export function cssVarName(path: readonly string[]): string {
  return `--ds-${path
    .join('-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replaceAll('/', '-')
    .toLowerCase()}`;
}

export const CSS_NAME_TRANSFORM = 'name/beach-sports-css';

// Root descriptions belong to input documents, not merged token nodes.
StyleDictionary.registerParser({
  name: 'beach-sports-json',
  pattern: /\.tokens\.json$/,
  parser: ({ contents }) => {
    const data = JSON.parse(contents) as DesignTokens;
    delete data.$description;
    return data;
  },
});

StyleDictionary.registerTransform({
  name: CSS_NAME_TRANSFORM,
  type: 'name',
  transform: (token: TransformedToken) => cssVarName(token.path),
});

function cssValue(token: TransformedToken): string {
  const value: unknown = token.$value;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function toCssDeclarations(tokens: readonly TransformedToken[]): string {
  return tokens
    .filter((token) => token.path.length > 0)
    .map((token) => `  ${cssVarName(token.path)}: ${cssValue(token)};`)
    .join('\n');
}

function themeBlock(selector: string, scheme: Theme, tokens: readonly TransformedToken[]): string {
  return `${selector} {\n  color-scheme: ${scheme};\n${toCssDeclarations(tokens)}\n}\n`;
}

StyleDictionary.registerFormat({
  name: 'css/beach-sports-root',
  format: ({ dictionary }) => themeBlock(':root', 'light', dictionary.allTokens),
});

StyleDictionary.registerFormat({
  name: 'css/beach-sports-dark',
  format: ({ dictionary }) =>
    themeBlock(
      '[data-theme="dark"]',
      'dark',
      dictionary.allTokens.filter((token) => token.path[0] === 'color'),
    ),
});

/**
 * One Style Dictionary instance per theme.
 *
 * Light and Dark are two passes over the same palette/foundations/typography
 * tree. Loading both semantic files at once would collide their keys, so each
 * pass swaps only the semantic source and resolves the aliases for that theme.
 */
export function createStyleDictionary(theme: Theme): StyleDictionary {
  const semantic = join(PACKAGE_ROOT, 'src', `semantic.${theme}.tokens.json`);
  const config: Config = {
    usesDtcg: true,
    parsers: ['beach-sports-json'],
    source: [
      join(PACKAGE_ROOT, 'src', 'palette.tokens.json'),
      join(PACKAGE_ROOT, 'src', 'foundations.tokens.json'),
      join(PACKAGE_ROOT, 'src', 'typography.tokens.json'),
      semantic,
    ],
    platforms: {
      css: {
        transforms: [CSS_NAME_TRANSFORM],
        buildPath: join(PACKAGE_ROOT, 'dist', 'css') + '/',
        files: [
          {
            destination: `tokens.${theme}.css`,
            format: theme === 'light' ? 'css/beach-sports-root' : 'css/beach-sports-dark',
          },
        ],
      },
    },
  };

  return new StyleDictionary(config);
}

export async function getThemeTokens(theme: Theme): Promise<TransformedToken[]> {
  const sd = createStyleDictionary(theme);
  await sd.buildAllPlatforms();
  const dictionary = await sd.getPlatformTokens('css');
  return dictionary.allTokens.filter((token) => token.path.length > 0);
}
