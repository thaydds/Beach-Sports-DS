import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string, theme = 'light', args = '') {
  await page.goto(
    `/iframe.html?id=componentes-${id}&viewMode=story&globals=theme:${theme}&args=${args}`,
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
}

for (const theme of ['light', 'dark']) {
  test(`spinner sizes, color, motion and nonvisual name / ${theme}`, async ({ page }) => {
    await openStory(page, 'loading--sizes', theme);
    const spinners = page.getByRole('status');
    await expect(spinners).toHaveCount(3);
    for (const [i, size] of [16, 24, 32].entries()) {
      await expect(spinners.nth(i)).toHaveCSS('width', `${size}px`);
      await expect(spinners.nth(i)).toHaveCSS('height', `${size}px`);
      await expect(spinners.nth(i)).toHaveText('');
      await expect(spinners.nth(i)).toHaveAccessibleName('Carregando');
      await expect(spinners.nth(i).locator('circle')).toHaveCSS('stroke-width', '2px');
      await expect(spinners.nth(i).locator('svg')).toHaveCSS('animation-name', 'none');
    }
    const expected = await spinners.first().evaluate((el) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--ds-color-action-default)';
      el.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect(spinners.first()).toHaveCSS('color', expected);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(spinners.first().locator('svg')).not.toHaveCSS('animation-name', 'none');
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
  });

  test(`native focus containment, Escape, backdrop, reopen and naming / ${theme}`, async ({
    page,
  }) => {
    await openStory(page, 'modal--playground', theme);
    const dialog = page.getByRole('dialog', { name: 'Salvar partida?' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toBeFocused();
    await expect(dialog).toHaveAccessibleDescription(
      'Os times e o resultado ficarão disponíveis em todos os dispositivos.',
    );
    await expect(dialog).toHaveCSS('padding', '24px');
    await expect(dialog).toHaveCSS('gap', '16px');
    await expect(dialog).toHaveCSS('border-radius', '16px');
    const box = (await dialog.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(480);
    expect(box.x).toBeGreaterThanOrEqual(16);
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('textbox')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    // The explicit Tab guard cycles inside the native modal, including reverse Tab.
    await expect(dialog.getByRole('button', { name: 'Salvar partida' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('textbox')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    const trigger = page.getByRole('button', { name: 'Abrir modal' });
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toBeVisible();
  });

  test(`saving prevents dismissal and repeated writes / ${theme}`, async ({ page }) => {
    await openStory(page, 'modal--saving', theme);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-busy', 'true');
    await page.keyboard.press('Escape');
    await page.mouse.click(2, 2);
    await expect(dialog).toBeVisible();
    const save = dialog.locator('button').last();
    await save.click({ force: true });
    await expect(page.getByText('Envios: 0')).toBeAttached();
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  });

  test(`error recovery preserves form values and accepts only one activation / ${theme}`, async ({
    page,
  }) => {
    await openStory(page, 'modal--error', theme);
    const dialog = page.getByRole('dialog');
    const name = dialog.getByRole('textbox');
    await name.fill('Jogo de quinta');
    await dialog.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(dialog).toHaveAttribute('aria-busy', 'true');
    await page.keyboard.press('Enter');
    await expect(dialog.getByRole('alert')).toBeVisible();
    await expect(name).toHaveValue('Jogo de quinta');
    await expect(page.getByText('Envios: 1')).toBeAttached();
    expect((await new AxeBuilder({ page }).include('dialog').analyze()).violations).toEqual([]);
  });

  for (const story of ['playground', 'error', 'long-content', 'without-title']) {
    test(`modal ${story} responsive and accessible / ${theme}`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await openStory(page, `modal--${story}`, theme);
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      expect((await new AxeBuilder({ page }).include('dialog').analyze()).violations).toEqual([]);
      const bounds = (await dialog.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(16);
      expect(bounds.y).toBeGreaterThanOrEqual(16);
      expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
      if (story === 'long-content') {
        expect(await dialog.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
        await dialog.getByRole('button', { name: 'Salvar partida' }).scrollIntoViewIfNeeded();
        await expect(dialog.getByRole('button', { name: 'Salvar partida' })).toBeInViewport();
      }
      expect(errors).toEqual([]);
      await testInfo.attach(`modal-${story}-${theme}`, {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      });
    });
  }
}

test('320px, enlarged text, outside dismissal disabled and forced colors', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openStory(page, 'modal--playground', 'light', 'closeOnEscape:false;closeOnBackdrop:false');
  const dialog = page.getByRole('dialog');
  await page.keyboard.press('Escape');
  await page.mouse.click(2, 2);
  await expect(dialog).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(dialog).toHaveCSS('border-top-style', 'solid');
  expect((await dialog.boundingBox())!.width).toBeLessThanOrEqual(288);
});

for (const [component, heading] of [
  ['loading', 'Loading sem texto visual'],
  ['modal', 'Modal composto, com foco contido'],
]) {
  test(`${component} technical docs render`, async ({ page }) => {
    await page.goto(`/iframe.html?id=componentes-${component}--docs&viewMode=docs`);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  });
}
