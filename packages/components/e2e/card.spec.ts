import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

for (const theme of ['light', 'dark']) {
  test(`Card four combinations, tokens and geometry / ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=componentes-card--variants&viewMode=story&globals=theme:${theme}`,
    );
    const cards = page.locator('[data-surface]');
    await expect(cards).toHaveCount(4);
    for (const card of await cards.all()) {
      const density = await card.getAttribute('data-density');
      const surface = await card.getAttribute('data-surface');
      const space = density === 'compact' ? '16px' : '24px';
      await expect(card).toHaveCSS('padding-top', space);
      await expect(card).toHaveCSS('row-gap', space);
      await expect(card).toHaveCSS('border-radius', '16px');
      await expect(card).toHaveCSS('box-shadow', 'none');
      await expect(card).not.toHaveAttribute('tabindex');
      await expect(card.locator('h2')).toHaveCSS(
        'font-size',
        density === 'compact' ? '17px' : '20px',
      );
      await expect(card.locator('[data-slot="action"] button')).toHaveCSS('width', '44px');
      await expect(card.locator('[data-slot="action"] button > span')).toHaveCSS('width', '14px');
      const result = await card.evaluate((e, value) => {
        const probe = document.createElement('div');
        probe.style.backgroundColor = `var(--ds-color-bg-${value === 'outlined' ? 'surface' : 'raised'})`;
        probe.style.borderColor = `var(--ds-color-border-${value === 'outlined' ? 'strong' : 'subtle'})`;
        e.append(probe);
        const actual = getComputedStyle(e),
          expected = getComputedStyle(probe);
        const match =
          actual.backgroundColor === expected.backgroundColor &&
          actual.borderTopColor === expected.borderTopColor;
        probe.remove();
        return match;
      }, surface);
      expect(result).toBe(true);
    }
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
  });
  test(`Card narrow content, root font preference and capture / ${theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 852 });
    await page.goto(
      `/iframe.html?id=componentes-card--long-content&viewMode=story&globals=theme:${theme}`,
    );
    const card = page.locator('[data-surface]');
    await expect(card).toBeVisible();
    await page.addStyleTag({ content: 'html { font-size:200% !important; }' });
    await expect(card.locator('h2')).toHaveCSS('font-size', '34px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const title = await card.locator('h2').boundingBox();
    const action = await card.locator('[data-slot="action"]').boundingBox();
    expect(title!.x + title!.width).toBeLessThanOrEqual(action!.x);
    const body = await card.locator('[data-slot="body"]').boundingBox();
    expect(title!.y + title!.height).toBeLessThan(body!.y);
    for (const button of await card.getByRole('button').all()) {
      const box = await button.boundingBox();
      expect(box!.x + box!.width).toBeLessThanOrEqual(
        (await card.boundingBox())!.x + (await card.boundingBox())!.width,
      );
    }
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
    await info.attach(`card-${theme}`, {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('card.png') }),
      contentType: 'image/png',
    });
  });
  test(`Card action focus, passive container and optional regions / ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=componentes-card--interaction&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.getByRole('status')).toContainText('Aguardando confirmação.');
    const action = page.getByRole('button', { name: 'Mais ações dos jogadores confirmados' });
    await action.focus();
    await expect(action).toHaveCSS('outline-width', '2px');
    await expect(action).toHaveCSS('outline-offset', '2px');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toContainText('Ações: 1.');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Confirmar', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toContainText('Jogadores confirmados.');
    await page.goto(
      `/iframe.html?id=componentes-card--optional-regions&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator('[data-surface]')).toHaveCount(4);
    await expect(page.locator('[data-slot="header"]')).toHaveCount(2);
    await expect(page.locator('[data-slot="footer"]')).toHaveCount(1);
    await expect(page.locator('[data-slot="action"]')).toHaveCount(0);
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
  });
}

for (const theme of ['light', 'dark']) {
  test(`Card documentation / ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=componentes-card--docs&viewMode=docs&globals=theme:${theme}`);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Conteúdo agrupado. Ações explícitas.' }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  });
}
