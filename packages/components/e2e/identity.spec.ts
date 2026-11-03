import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, id: string, theme: string) {
  await page.goto(`/iframe.html?id=componentes-${id}&viewMode=story&globals=theme:${theme}`);
  await expect(
    page
      .locator(
        '#storybook-root [data-avatar], #storybook-root [data-badge], #storybook-root [data-chip]',
      )
      .first(),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
}
for (const theme of ['light', 'dark']) {
  test(`Avatar dimensions, fallback assets and names / ${theme}`, async ({ page }, info) => {
    await open(page, 'avatar--variants', theme);
    const avatars = page.locator('[data-avatar]');
    await expect(avatars).toHaveCount(6);
    for (const [i, size] of [32, 32, 44, 44, 64, 64].entries()) {
      await expect(avatars.nth(i)).toHaveCSS('width', `${size}px`);
      await expect(avatars.nth(i)).toHaveCSS('height', `${size}px`);
      if (i % 2 === 1) {
        const glyph = avatars.nth(i).locator('> span');
        await expect(glyph).toHaveCSS('width', `${size / 2}px`);
        await expect(glyph).not.toHaveCSS('mask-image', 'none');
      }
    }
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
    await info.attach('avatar', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('avatar.png') }),
      contentType: 'image/png',
    });
    await page.addStyleTag({ content: 'html { font-size:200% !important; }' });
    await expect(avatars.nth(4)).toHaveCSS('width', '128px');
    const text = avatars.nth(4).locator('[data-variant]');
    await expect(text).toHaveCSS('font-size', '48px');
    await open(page, 'avatar--image-failure', theme);
    await expect(page.locator('[data-avatar] img')).toHaveCount(0);
    await expect(page.getByRole('img', { name: 'André Nunes' })).toContainText('AN');
    await page.route('**/avatar-unavailable.png', (route) =>
      route.fulfill({
        contentType: 'image/png',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6zbkAAAAASUVORK5CYII=',
          'base64',
        ),
      }),
    );
    await open(page, 'avatar--image-failure', theme);
    await expect(page.locator('[data-avatar] img')).toBeVisible();
    await expect(page.locator('[data-avatar] img')).toHaveCSS('object-fit', 'cover');
    await open(page, 'avatar--people', theme);
    await expect(page.getByRole('img')).toHaveCount(0);
    await expect(page.locator('[data-avatar][aria-hidden="true"]')).toHaveCount(3);
  });
  test(`Badge ten combinations, text contrast and long content / ${theme}`, async ({
    page,
  }, info) => {
    await open(page, 'badge--variants', theme);
    const badges = page.locator('[data-badge]');
    await expect(badges).toHaveCount(10);
    for (const badge of await badges.all()) {
      const md = (await badge.getAttribute('data-size')) === 'md';
      await expect(badge).toHaveCSS('height', md ? '28px' : '24px');
      await expect(badge).toHaveCSS('padding-inline-start', md ? '10px' : '8px');
      await expect(badge.locator('> [aria-hidden]')).toHaveCSS('width', md ? '16px' : '12px');
    }
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
    await info.attach('badge', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('badge.png') }),
      contentType: 'image/png',
    });
    await page.setViewportSize({ width: 320, height: 852 });
    await open(page, 'badge--long-label', theme);
    await page.addStyleTag({ content: 'html { font-size:200% !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
  test(`Chip matrix, target sizes and contrast / ${theme}`, async ({ page }, info) => {
    await open(page, 'chip--variants', theme);
    const chips = page.locator('[data-chip]');
    await expect(chips).toHaveCount(6);
    for (const chip of await chips.all()) {
      const md = (await chip.getAttribute('data-size')) === 'md';
      await expect(chip).toHaveCSS('height', md ? '48px' : '44px');
      for (const button of await chip.getByRole('button').all()) {
        const box = await button.boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
      await expect(chip.locator('button button')).toHaveCount(0);
    }
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
    await info.attach('chip', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('chip.png') }),
      contentType: 'image/png',
    });
    await page.setViewportSize({ width: 320, height: 852 });
    await open(page, 'chip--long-label', theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const remove = page.getByRole('button', { name: /^Remover/ });
    await expect(remove).toHaveCSS('width', '44px');
  });
  test(`Chip keyboard selection, independent removal and focus recovery / ${theme}`, async ({
    page,
  }) => {
    await open(page, 'chip--interaction', theme);
    const select = page.getByRole('button', { name: 'André', exact: true });
    await expect(select).toHaveAttribute('aria-pressed', 'true'); // CSF play selects once.
    await select.focus();
    await page.keyboard.press('Space');
    await expect(select).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('Enter');
    await expect(select).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-chip]')).toHaveCSS('outline-width', '2px');
    await page.keyboard.press('Tab');
    const remove = page.getByRole('button', { name: 'Remover André' });
    await expect(remove).toBeFocused();
    await expect(remove).toHaveCSS('outline-width', '2px');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toHaveText('André removido.');
    await expect(page.getByRole('button', { name: 'Restaurar' })).toBeFocused();
  });
  test(`Card public Avatar and new participant composition / ${theme}`, async ({ page }) => {
    await open(page, 'card--playground', theme);
    const avatars = page.locator('[data-avatar]');
    await expect(avatars).toHaveCount(3);
    await expect(page.getByRole('img', { name: 'André' })).toHaveCSS('width', '44px');
    await open(page, 'card--participants', theme);
    await expect(page.locator('[data-avatar]')).toHaveCount(1);
    await expect(page.locator('[data-badge]')).toHaveCount(2);
    await page.getByRole('button', { name: 'André', exact: true }).click();
    await expect(page.getByRole('button', { name: 'André', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // Wait for the selected text paint before auditing its contrast.
    const selectedColor = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--ds-color-action-fg)';
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect(page.locator('[data-chip] [data-variant]')).toHaveCSS('color', selectedColor);
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
  });
  for (const [component, heading] of [
    ['avatar', 'Uma identidade. Com nome completo.'],
    ['badge', 'Status legível. Sem ação implícita.'],
    ['chip', 'Selecionar e remover. Ações independentes.'],
  ]) {
    test(`${component} documentation / ${theme}`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=componentes-${component}--docs&viewMode=docs&globals=theme:${theme}`,
      );
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    });
  }
}
