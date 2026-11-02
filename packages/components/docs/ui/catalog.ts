import { darkTokens, tokens } from '@beachsports/tokens';

export type Theme = 'light' | 'dark';
export const catalog = Object.entries(tokens).map(([name, value]) => ({ name, value }));
export const semanticColors = catalog.filter(({ name }) => name.startsWith('--ds-color-'));
export const palette = catalog.filter(({ name }) => name.startsWith('--ds-palette-'));
export const spaces = catalog.filter(({ name }) => name.startsWith('--ds-space-'));
export const typeStyles = catalog
  .filter(({ name }) => /^--ds-type-(display|heading|body|label|control)-.+-font-size$/.test(name))
  .map(({ name }) => name.slice('--ds-type-'.length, -'-font-size'.length));

export function tokenValue(name: string, theme: Theme = 'light'): string {
  const values: Readonly<Record<string, string | number>> = theme === 'dark' ? darkTokens : tokens;
  const value = values[name];
  if (value === undefined) throw new Error(`Unknown design token: ${name}`);
  return String(value);
}

export function familyTokens(group: string) {
  return catalog.filter(({ name }) => name.startsWith(`--ds-${group}-`));
}

export function styleLabel(style: string): string {
  const [family, size] = style.split('-');
  return `${family ? family[0]?.toUpperCase() : ''}${family?.slice(1) ?? ''} / ${size?.toUpperCase() ?? ''}`;
}

export function trackingInEm(style: string): string {
  return `${Number.parseFloat(tokenValue(`--ds-type-${style}-letter-spacing-percent`)) / 100}em`;
}
