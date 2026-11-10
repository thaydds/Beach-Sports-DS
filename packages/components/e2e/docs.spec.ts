import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from './fixtures';

const pages = [
  ['overview', 'comece-aqui-visão-geral--docs', 'Uma linguagem. Muitas partidas.'],
  ['guide', 'comece-aqui-como-usar--docs', 'Do token ao componente.'],
  ['colors', 'fundamentos-cores--docs', 'Cor com propósito.'],
  ['typography', 'fundamentos-tipografia--docs', 'Ritmo para a leitura.'],
  ['geometry', 'fundamentos-espaço-e-geometria--docs', 'Espaço para jogar.'],
  ['reference', 'referência-contrato-dos-tokens--docs', 'Beach Sports DS · Tokens'],
] as const;

async function openDocs(page: Page, id: string, theme: 'light' | 'dark') {
  await page.addInitScript((value) => {
    if (!localStorage.getItem('beachsports-docs-theme'))
      localStorage.setItem('beachsports-docs-theme', value);
  }, theme);
  await page.goto(`/iframe.html?id=${encodeURIComponent(id)}&viewMode=docs`);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
}

for (const [name, id, heading] of pages) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${name} / ${theme}: accessibility, layout and capture`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await openDocs(page, id, theme);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      // Font loading is part of the contract; do not silently capture a fallback.
      expect(await page.evaluate(() => document.fonts.check('400 16px Inter'))).toBe(true);
      if (name === 'colors') await page.getByText('Explorar a palette completa').click();
      const results = await new AxeBuilder({ page }).include('main').analyze();
      await testInfo.attach('axe', {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
      });
      expect(results.violations).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      // Scrollable reference tables/code are intentional; they must accept keyboard focus.
      const inaccessibleScrollers = await page
        .getByRole('main')
        .evaluate((main) =>
          [...main.querySelectorAll<HTMLElement>('pre, table')]
            .filter((element) => element.scrollWidth > element.clientWidth && element.tabIndex < 0)
            .map((element) => element.tagName),
        );
      expect(inaccessibleScrollers).toEqual([]);
      expect(errors).toEqual([]);
      await testInfo.attach(`${name}-${theme}`, {
        body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
        contentType: 'image/png',
      });
    });
  }
}

test('theme buttons work with a keyboard and survive navigation', async ({ page }) => {
  await openDocs(page, pages[0][1], 'light');
  await page.keyboard.press('Tab'); // Brand link.
  await page.keyboard.press('Tab'); // Light button.
  await expect(page.getByRole('button', { name: 'Light', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Dark', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // Do not run the initialization script again: verify actual persisted state.
  await page.goto(`/iframe.html?id=${encodeURIComponent(pages[2][1])}&viewMode=docs`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Dark', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('color search, empty result and clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openDocs(page, pages[2][1], 'light');
  const search = page.getByRole('searchbox', { name: 'Encontre uma cor' });
  await search.fill('action');
  await expect(page.getByText('6 de 34 papéis')).toBeVisible();
  await expect(page.getByRole('img', { name: /^--ds-color-/ })).toHaveCount(12);
  await page.getByRole('button', { name: 'Copiar --ds-color-action-default', exact: true }).click();
  await expect(page.getByText('Copiado', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'var(--ds-color-action-default)',
  );
  await search.fill('nao-existe');
  await expect(page.getByText(/Nenhuma cor encontrada/)).toBeVisible();
  await expect(page.getByRole('img', { name: /^--ds-color-/ })).toHaveCount(0);
});

test('custom typography text wraps without horizontal overflow', async ({ page }) => {
  await openDocs(page, pages[3][1], 'dark');
  const sample = 'BeachSports'.repeat(15);
  await page.getByRole('textbox', { name: 'Experimente seu próprio texto' }).fill(sample);
  await expect(page.getByText(sample, { exact: true })).toHaveCount(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const theme of ['light', 'dark'] as const) {
  test(`focus example has a visible ring (${theme})`, async ({ page }) => {
    await openDocs(page, pages[4][1], theme);
    const target = page.getByRole('button', { name: 'Experimente o foco' });
    // Traverse real tab order, including all preceding token copy controls.
    for (let step = 0; step < 30; step++) {
      await page.keyboard.press('Tab');
      if (await target.evaluate((element) => element === document.activeElement)) break;
    }
    await expect(target).toBeFocused();
    await expect(target).toHaveCSS('outline-style', 'solid');
    await expect(target).toHaveCSS('outline-width', '2px');
    await expect(target).toHaveCSS('outline-offset', '2px');
  });
}

test('Storybook toolbar and docs theme control stay synchronized', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Manager toolbar is hidden by the mobile shell.');
  await page.goto(`/?path=/docs/${encodeURIComponent(pages[0][1])}`);
  const preview = page.frameLocator('#storybook-preview-iframe');
  await expect(preview.getByRole('main')).toBeVisible();
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await page.getByText('Dark', { exact: true }).click();
  await expect(preview.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(preview.getByRole('button', { name: 'Dark', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await preview.getByRole('button', { name: 'Light', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Light', exact: true })).toBeVisible();
  await expect(preview.locator('html')).toHaveAttribute('data-theme', 'light');
});
