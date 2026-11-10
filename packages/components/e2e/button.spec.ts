import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from './fixtures';

const variants = ['primary', 'secondary', 'ghost', 'destructive'] as const;
const sizes = [
  { name: 'sm', height: 44, padding: 18, font: 14, line: 18, icon: 14 },
  { name: 'md', height: 48, padding: 22, font: 15, line: 20, icon: 16 },
  { name: 'lg', height: 56, padding: 28, font: 16, line: 22, icon: 20 },
] as const;

async function openStory(page: Page, id: string, theme: 'light' | 'dark', args = '') {
  await page.goto(
    `/iframe.html?id=componentes-${id}&viewMode=story&globals=theme:${theme}&args=${args}`,
  );
  await expect(page.locator('#storybook-root button').first()).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('600 15px Inter'))).toBe(true);
}

async function tokenColor(page: Page, token: string) {
  return page.evaluate((name) => {
    const element = document.createElement('span');
    element.style.color = `var(--ds-color-${name})`;
    document.body.append(element);
    const color = getComputedStyle(element).color;
    element.remove();
    return color;
  }, token);
}

for (const theme of ['light', 'dark'] as const) {
  test(`button dimensions, typography and real pointer states / ${theme}`, async ({ page }) => {
    await openStory(page, 'button--variants', theme);
    for (const variant of variants) {
      for (const size of sizes) {
        const button = page.locator(`button[data-style="${variant}"][data-size="${size.name}"]`);
        await expect(button).toHaveCSS('height', `${size.height}px`);
        await expect(button).toHaveCSS('padding-inline-start', `${size.padding}px`);
        await expect(button).toHaveCSS('font-size', `${size.font}px`);
        await expect(button).toHaveCSS('font-weight', '600');
        await expect(button).toHaveCSS('line-height', `${size.line}px`);
        await expect(button).toHaveCSS('border-radius', '999px');
        expect(['normal', '0px']).toContain(
          await button.evaluate((element) => getComputedStyle(element).letterSpacing),
        );
        const base =
          variant === 'primary'
            ? 'action-default'
            : variant === 'destructive'
              ? 'status-danger'
              : null;
        await expect(button).toHaveCSS(
          'background-color',
          base ? await tokenColor(page, base) : 'rgba(0, 0, 0, 0)',
        );
        if (variant === 'secondary') {
          // Browsers may quantize the 1.5px border to device pixels.
          expect(
            Number.parseFloat(
              await button.evaluate((element) => getComputedStyle(element).borderTopWidth),
            ),
          ).toBeGreaterThan(0);
          await expect(button).toHaveCSS(
            'border-top-color',
            await tokenColor(page, 'border-strong'),
          );
        }
        await button.hover();
        const hover =
          variant === 'primary'
            ? 'action-hover'
            : variant === 'destructive'
              ? 'status-danger-hover'
              : 'bg-sunken';
        await expect(button).toHaveCSS('background-color', await tokenColor(page, hover));
        await page.mouse.down();
        const pressed =
          variant === 'primary'
            ? 'action-pressed'
            : variant === 'destructive'
              ? 'status-danger-pressed'
              : 'bg-sunken';
        await expect(button).toHaveCSS('background-color', await tokenColor(page, pressed));
        await page.mouse.up();
        await page.mouse.move(0, 0);
      }
    }
  });

  test(`icon-only target dimensions and inherited icon colors / ${theme}`, async ({ page }) => {
    await openStory(page, 'iconbutton--variants', theme);
    for (const variant of variants) {
      for (const size of sizes) {
        const button = page.locator(`button[data-style="${variant}"][data-size="${size.name}"]`);
        await expect(button).toHaveCSS('width', `${size.height}px`);
        await expect(button).toHaveCSS('height', `${size.height}px`);
        const icon = button.locator('> span');
        await expect(icon).toHaveAttribute('aria-hidden', 'true');
        await expect(icon).toHaveCSS('width', `${size.icon}px`);
        await expect(icon).toHaveCSS('height', `${size.icon}px`);
        await expect(icon.locator('> span')).toHaveCSS(
          'background-color',
          await button.evaluate((element) => getComputedStyle(element).color),
        );
      }
    }
  });

  for (const id of [
    'button--variants',
    'button--icons',
    'button--states',
    'button--long-label',
    'iconbutton--variants',
    'iconbutton--states',
  ]) {
    test(`${id} / ${theme}: contrast, overflow and capture`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await openStory(page, id, theme);
      const result = await new AxeBuilder({ page }).include('#storybook-root').analyze();
      expect(result.violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(errors).toEqual([]);
      if (id === 'button--long-label') {
        const button = page.getByRole('button');
        expect((await button.boundingBox())?.height).toBeGreaterThan(48);
        expect(await button.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
          true,
        );
      }
      await testInfo.attach(`${id}-${theme}`, {
        body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
        contentType: 'image/png',
      });
    });
  }

  test(`loading preserves width with either icon position / ${theme}`, async ({ page }) => {
    for (const iconOnly of [false, true]) {
      // The IconButton path proves the box is stable when its glyph is replaced.
      const id = iconOnly ? 'iconbutton--playground' : 'button--playground';
      await openStory(page, id, theme);
      const before = await page.getByRole('button').boundingBox();
      await openStory(page, id, theme, 'loading:true');
      const button = page.getByRole('button');
      await expect(button).toHaveAttribute('aria-busy', 'true');
      expect(await button.boundingBox()).toMatchObject({
        width: before?.width,
        height: before?.height,
      });
      await expect(button.locator('[aria-hidden="true"] span').last()).toHaveCSS('width', '16px');
    }
    await openStory(page, 'button--icons', theme);
    const widths = await page
      .getByRole('button')
      .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().width));
    await openStory(page, 'button--icons', theme, 'loading:true');
    expect(
      await page
        .getByRole('button')
        .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().width)),
    ).toEqual(widths);
    for (const button of await page.getByRole('button').all()) {
      await expect(button).toHaveAttribute('aria-disabled', 'true');
      await expect(button.locator('span[data-hidden]')).toHaveCount(0);
      await expect(button.locator('[aria-hidden="true"]').first()).toHaveCSS('width', '16px');
    }
    await openStory(page, 'button--states', theme);
    for (const variant of variants) {
      const group = page.getByRole('region', { name: variant, exact: true });
      const busy = group.getByRole('button', { name: 'Salvar Salvando', exact: true });
      expect(await busy.nth(0).boundingBox()).toMatchObject({
        width: (await busy.nth(1).boundingBox())?.width,
      });
      for (const button of await busy.all()) {
        await expect(button).toHaveAttribute('aria-disabled', 'true');
        await expect(button.locator('span[data-hidden]')).toHaveCount(0);
        await expect(button.locator('[aria-hidden="true"]').first()).toHaveCSS('width', '16px');
      }
    }
  });

  test(`keyboard, focus, implicit submit and duplicate activation / ${theme}`, async ({ page }) => {
    await openStory(page, 'button--form', theme);
    const input = page.getByRole('textbox', { name: 'Nome do time' });
    const submit = page.locator('button[type="submit"]');
    // The CSF play() completes one operation before this browser journey.
    await expect(page.getByRole('status')).toHaveText('1 envio(s). Pronto para salvar.');
    await input.focus();
    await page.keyboard.press('Tab');
    await expect(submit).toBeFocused();
    await expect(submit).toHaveCSS('outline-style', 'solid');
    await expect(submit).toHaveCSS('outline-width', '2px');
    await expect(submit).toHaveCSS('outline-offset', '2px');
    const before = await submit.boundingBox();
    await page.keyboard.press('Enter');
    await expect(submit).toBeFocused();
    await expect(submit).toHaveAttribute('aria-disabled', 'true');
    expect(await submit.boundingBox()).toEqual(before);
    await page.keyboard.press('Space');
    await submit.click({ force: true });
    await input.focus();
    await page.keyboard.press('Enter'); // Implicit submission also passes through the busy button.
    await expect(page.getByRole('status')).toHaveText('2 envio(s). Operação em andamento.');
    await page.keyboard.press('Tab');
    await expect(submit).toBeFocused(); // Busy stays in the tab order.
    await page.keyboard.press('Tab');
    const complete = page.getByRole('button', { name: 'Concluir operação' });
    await expect(complete).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(submit).not.toHaveAttribute('aria-busy');
    await expect(complete).toBeDisabled();
    const result = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(result.violations).toEqual([]);
  });

  for (const [id, heading] of [
    ['button', 'Uma ação clara. Em cada tamanho.'],
    ['iconbutton', 'Uma ação compacta. Com nome acessível.'],
  ]) {
    test(`${id} docs render / ${theme}`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=componentes-${id}--docs&viewMode=docs&globals=theme:${theme}`,
      );
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    });
  }
}

test('reduced motion leaves a static visible spinner; forced colors retain a boundary', async ({
  page,
}) => {
  await openStory(page, 'iconbutton--playground', 'light', 'loading:true');
  const button = page.getByRole('button');
  const spinner = button.locator('> span > span');
  await expect(spinner).toHaveCSS('animation-name', 'none');
  await expect(spinner).not.toHaveCSS('mask-image', 'none');
  await expect(button).toHaveCSS('transition-property', 'none');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(spinner).toHaveCSS(
    'background-color',
    await button.evaluate((element) => getComputedStyle(element).color),
  );
  await openStory(page, 'button--playground', 'light');
  expect(
    Number.parseFloat(await button.evaluate((element) => getComputedStyle(element).borderTopWidth)),
  ).toBeGreaterThan(0);
});
