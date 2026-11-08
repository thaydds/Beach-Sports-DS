import { expect, test, type Page, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
const contract = JSON.parse(
  readFileSync(new URL('../../../design/figma/component-contract.json', import.meta.url), 'utf8'),
) as {
  sets: {
    name: string;
    variants: {
      properties: Record<string, string>;
      fills: { token: string | null }[];
      geometry: {
        cornerRadius: number | object;
        height: number;
        strokeWeight: number | object;
        paddingLeft: number;
        itemSpacing: number;
      };
      strokes: { token: string | null }[];
    }[];
  }[];
};

type Properties = Record<string, string>;
async function color(page: Page, token: string) {
  return page.evaluate((name) => {
    const el = document.createElement('span');
    el.style.color = `var(${name})`;
    document.body.append(el);
    const value = getComputedStyle(el).color;
    el.remove();
    return value;
  }, token);
}
async function open(page: Page, story: string, theme: string) {
  await page.goto(`/iframe.html?id=componentes-${story}&viewMode=story&globals=theme:${theme}`);
  await expect(page.locator('#storybook-root').locator('> *').first()).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
}
async function attributes(locator: Locator) {
  return locator.evaluate((el) =>
    Object.fromEntries([...el.attributes].map((a) => [a.name, a.value])),
  );
}
const cases = [
  ['Button', 'button--variants', 'button[data-style]'],
  ['Icon Button', 'iconbutton--variants', 'button[data-style]'],
  ['Avatar', 'avatar--variants', '[data-avatar]'],
  ['Badge', 'badge--variants', '[data-badge]'],
  ['Chip', 'chip--variants', '[data-chip]'],
  ['Input', 'input--sizes', '[data-input]'],
  ['Checkbox', 'checkbox--variants', '[data-checkbox]'],
  ['ScoreMatch', 'scorematch--variants', '[data-score-match]'],
  ['Ranking', 'ranking--densities', '[data-ranking]'],
  ['RankingItem', 'rankingitem--variants', '[data-ranking-item]'],
  ['Card', 'card--figma-compositions', '[data-summary-card]'],
] as const;
for (const theme of ['light', 'dark']) {
  for (const [name, story, selector] of cases) {
    test(`exported ${name} root contract / ${theme}`, async ({ page }) => {
      await open(page, story, theme);
      const set = contract.sets.find((s) => s.name === name)!;
      const roots = page.locator(`#storybook-root ${selector}`);
      expect(await roots.count()).toBeGreaterThan(0);
      for (const root of await roots.all()) {
        const a = await attributes(root);
        const cap = (v?: string) => (v ? v[0]!.toUpperCase() + v.slice(1) : undefined);
        const p: Properties = {};
        if (a['data-size']) p.Size = a['data-size'].toUpperCase();
        if (a['data-style']) p.Style = cap(a['data-style'])!;
        if (name === 'Avatar')
          p.Content = (await root.locator('[data-variant]').count()) ? 'Initials' : 'Fallback';
        if (name === 'Badge') p.Tone = cap(a['data-tone'])!;
        if (name === 'Chip')
          p.State =
            a['data-disabled'] === 'true'
              ? 'Disabled'
              : a['data-selected'] === 'true'
                ? 'Selected'
                : 'Default';
        if (name === 'Input') {
          p.State = 'Default';
          p.Validation = 'None';
          p.Content = 'Placeholder';
        }
        if (name === 'Checkbox') {
          const input = root.locator('input');
          p.State = (await input.isDisabled()) ? 'Disabled' : 'Default';
          p.Value = (await input.evaluate((e) => (e as HTMLInputElement).indeterminate))
            ? 'Mixed'
            : (await input.isChecked())
              ? 'Checked'
              : 'Unchecked';
        }
        if (name === 'ScoreMatch') {
          p.Density = cap(a['data-score-density'])!;
          p.State = cap(a['data-state'])!;
        }
        if (name === 'Ranking' || name === 'RankingItem') p.Density = cap(a['data-density'])!;
        if (name === 'RankingItem') p.Emphasis = cap(a['data-emphasis'])!;
        if (name === 'Card') {
          p.Type = cap(a['data-summary-card'])!;
          p.State =
            a['data-disabled'] === 'true'
              ? 'Disabled'
              : a['data-selected'] === 'true'
                ? 'Selected'
                : 'Default';
        }
        if (name === 'Button' || name === 'Icon Button') p.State = 'Default';
        const variant = set.variants.find((v) =>
          Object.entries(p).every(([k, value]) => (v.properties as Properties)[k] === value),
        );
        expect(variant, `${name}: ${JSON.stringify(p)}`).toBeDefined();
        const v = variant!;
        if (name === 'Card') {
          await root.evaluate((el) => (el.style.width = '345px'));
          // Unitless line-height can quantize to 1/64px; retain text reflow instead of fixing content height.
          expect(Math.abs((await root.boundingBox())!.height - v.geometry.height)).toBeLessThan(
            0.1,
          );
          await expect(root).toHaveCSS('padding-left', `${v.geometry.paddingLeft}px`);
          await expect(root).toHaveCSS('gap', `${v.geometry.itemSpacing}px`);
          expect(typeof v.geometry.strokeWeight).toBe('number');
          if (typeof v.geometry.strokeWeight === 'number') {
            await expect(root).toHaveCSS('border-top-width', `${v.geometry.strokeWeight}px`);
          }
          await expect(root).toHaveCSS('border-top-color', await color(page, v.strokes[0]!.token!));
        }
        const fill = v.fills[0]?.token;
        await expect(root).toHaveCSS(
          'background-color',
          fill ? await color(page, fill) : 'rgba(0, 0, 0, 0)',
        );
        if (typeof v.geometry.cornerRadius === 'number' && name !== 'RankingItem')
          await expect(root).toHaveCSS('border-radius', `${v.geometry.cornerRadius}px`);
        if (['Button', 'Icon Button', 'Avatar', 'Badge', 'Chip', 'Input'].includes(name))
          await expect(root).toHaveCSS('height', `${v.geometry.height}px`);
      }
    });
  }
  test(`Figma Card pointer, keyboard, reflow and explicit accessibility findings / ${theme}`, async ({
    page,
  }, info) => {
    await open(page, 'card--figma-compositions', theme);
    const first = page.locator('[data-summary-card]').first();
    await first.evaluate((e) => (e.style.width = '345px'));
    await expect(first).toHaveCSS('height', '82px');
    await expect(first.locator('[data-slot="title"]')).toHaveCSS('font-size', '15px');
    await expect(first.locator('[data-slot="title"]')).toHaveCSS('line-height', '20px');
    await expect(first.locator('[data-slot="badge"]')).toHaveCSS('font-size', '11px');
    await first.hover();
    await expect(first).toHaveCSS('background-color', await color(page, '--ds-color-bg-sunken'));
    const result = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    await info.attach('figma-card-accessibility.json', {
      body: JSON.stringify(result, null, 2),
      contentType: 'application/json',
    });
    // Fidelity exposes a source-design defect. It is tracked, not silently fixed or waived globally.
    expect(result.violations.map((v) => v.id)).toEqual(theme === 'light' ? ['color-contrast'] : []);
    if (theme === 'light')
      for (const node of result.violations[0]!.nodes)
        expect(node.html).toContain('data-slot="badge"');
    await info.attach('figma-card', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('figma-card.png') }),
      contentType: 'image/png',
    });
    await open(page, 'card--figma-selection', theme);
    const button = page.getByRole('button', { name: /^Lana Souza/ });
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await button.focus();
    await button.press('Space');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toHaveCSS('outline-width', '2px');
    await button.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await page.setViewportSize({ width: 320, height: 852 });
    await open(page, 'card--figma-long-content', theme);
    await page.addStyleTag({ content: 'html {font-size:200% !important;}' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
