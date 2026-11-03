import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, id: string, theme: string) {
  await page.goto(`/iframe.html?id=componentes-${id}&viewMode=story&globals=theme:${theme}`);
  await expect(
    page.locator('#storybook-root [data-input], #storybook-root [data-checkbox]').first(),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
}
async function color(page: Page, name: string) {
  return page.evaluate((token) => {
    const probe = document.createElement('span');
    probe.style.color = `var(--ds-color-${token})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);
}
async function accessible(page: Page) {
  expect((await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations).toEqual(
    [],
  );
}
for (const theme of ['light', 'dark']) {
  test(`Input dimensions, slots, typography and action targets / ${theme}`, async ({
    page,
  }, info) => {
    await open(page, 'input--sizes', theme);
    const fields = page.locator('[data-input]');
    await expect(fields).toHaveCount(3);
    for (const [i, height] of [44, 48, 56].entries()) {
      const field = fields.nth(i);
      await expect(field).toHaveCSS('height', `${height}px`);
      await expect(field.locator('> [aria-hidden]')).toHaveCSS('width', i === 0 ? '16px' : '20px');
      await expect(field.locator('input')).toHaveCSS('font-size', i === 2 ? '16px' : '15px');
      await expect(field.getByRole('button')).toHaveCSS('width', '44px');
      await expect(field.getByRole('button')).toHaveCSS('height', '44px');
      await expect(field.getByRole('button')).toHaveAttribute('type', 'button');
    }
    await accessible(page);
    await info.attach('input-sizes', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('input.png') }),
      contentType: 'image/png',
    });
  });
  test(`Input pointer, error plus focus, readonly copy and disabled semantics / ${theme}`, async ({
    page,
  }, info) => {
    await open(page, 'input--states', theme);
    const regular = page.getByRole('textbox', { name: 'Preenchido', exact: true });
    const regularRoot = regular.locator('..');
    await expect(regularRoot).toHaveCSS('border-top-color', await color(page, 'border-control'));
    await regular.hover();
    await expect(regularRoot).toHaveCSS('border-top-width', '2px');
    await expect(regularRoot).toHaveCSS('border-top-color', await color(page, 'action-default'));
    const invalid = page.getByRole('textbox', { name: 'Inválido', exact: true });
    await invalid.hover();
    await invalid.focus();
    await expect(invalid.locator('..')).toHaveCSS(
      'border-top-color',
      await color(page, 'status-danger'),
    );
    await expect(invalid.locator('..')).toHaveCSS('outline-width', '2px');
    await expect(invalid.locator('..')).toHaveCSS('outline-color', await color(page, 'focus-ring'));
    const readonly = page.getByRole('textbox', { name: 'Somente leitura', exact: true });
    await readonly.focus();
    await readonly.press('End');
    await readonly.press('a');
    await expect(readonly).toHaveValue('André');
    await expect(readonly).toBeFocused();
    await readonly.evaluate((input: HTMLInputElement) => input.select());
    expect(
      await readonly.evaluate(
        (input: HTMLInputElement) => input.selectionEnd! - input.selectionStart!,
      ),
    ).toBe(5);
    await expect(page.getByRole('textbox', { name: 'Desabilitado', exact: true })).toBeDisabled();
    const disabledError = page.getByRole('textbox', { name: 'Inválido desabilitado', exact: true });
    await expect(disabledError).toBeDisabled();
    await expect(disabledError).toHaveAttribute('aria-invalid', 'true');
    await expect(disabledError.locator('..')).toHaveCSS(
      'background-color',
      await color(page, 'action-disabled-bg'),
    );
    await accessible(page);
    await info.attach('input-states', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
  test(`Input editing and trailing IconButton keyboard activation / ${theme}`, async ({ page }) => {
    await open(page, 'input--interaction', theme);
    const input = page.getByRole('textbox', { name: 'Nome do jogador' });
    await input.fill('Iolanda');
    await expect(page.getByRole('status')).toHaveText('Nome: Iolanda');
    await input.press('Tab');
    await expect(page.getByRole('button', { name: 'Limpar nome' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('');
    await expect(page.getByRole('status')).toHaveText('Nome limpo');
    await accessible(page);
  });
  test(`FormField synchronization, error messages and long reflow / ${theme}`, async ({
    page,
  }, info) => {
    await open(page, 'formfield--states', theme);
    const invalid = page.getByRole('textbox', { name: 'Nome indisponível' });
    await expect(invalid).toHaveAccessibleDescription('Erro: este nome já está cadastrado.');
    await expect(page.getByText('Ajuda que será substituída')).toHaveCount(0);
    for (const [size, height] of [
      ['sm', 44],
      ['md', 48],
      ['lg', 56],
    ] as const)
      await expect(page.getByRole('textbox', { name: `Nome · ${size}` }).locator('..')).toHaveCSS(
        'height',
        `${height}px`,
      );
    await accessible(page);
    await open(page, 'formfield--long-content', theme);
    await page.setViewportSize({ width: 320, height: 852 });
    await page.addStyleTag({ content: 'html { font-size:200% !important; }' });
    const field = page.locator('[data-form-field]');
    await expect(field.locator('label')).toHaveCSS('font-size', '28px');
    await expect(field.locator('input')).toHaveCSS('font-size', '30px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await accessible(page);
    await info.attach('form-field-reflow', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('field.png') }),
      contentType: 'image/png',
    });
  });
  test(`Checkbox matrix, native mixed state, marks and target sizes / ${theme}`, async ({
    page,
  }, info) => {
    await open(page, 'checkbox--variants', theme);
    const roots = page.locator('[data-checkbox]');
    await expect(roots).toHaveCount(12);
    for (const root of await roots.all()) {
      const md = (await root.getAttribute('data-size')) === 'md';
      await expect(root.locator('> span[aria-hidden]')).toHaveCSS('width', md ? '24px' : '20px');
      const box = await root.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(md ? 48 : 44);
      expect(box!.width).toBeGreaterThanOrEqual(md ? 48 : 44);
      if ((await root.textContent())!.includes('mixed'))
        await expect(root.getByRole('checkbox')).toBeChecked({ indeterminate: true });
      if ((await root.textContent())!.includes('desabilitado'))
        await expect(root.getByRole('checkbox')).toBeDisabled();
    }
    await accessible(page);
    await info.attach('checkbox-variants', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('checkbox.png') }),
      contentType: 'image/png',
    });
    await open(page, 'checkbox--without-label', theme);
    await expect(page.getByRole('checkbox', { name: 'Selecionar André' })).toBeChecked({
      indeterminate: true,
    });
    await expect(page.locator('[data-checkbox]')).toHaveCSS('width', '48px');
    await accessible(page);
  });
  test(`Checkbox keyboard, partial group selection, pointer and multiline / ${theme}`, async ({
    page,
  }) => {
    await open(page, 'checkbox--selection', theme);
    const all = page.getByRole('checkbox', { name: 'Selecionar todos' });
    await all.focus();
    await expect(all.locator('..')).toHaveCSS('outline-width', '2px');
    await all.press('Space');
    await expect(all).toBeChecked();
    await expect(page.getByRole('status')).toHaveText('3 jogadores selecionados');
    // The native input covers the whole label target, including its text area.
    await page.getByRole('checkbox', { name: 'André', exact: true }).locator('..').click();
    await expect(all).toBeChecked({ indeterminate: true });
    await expect(page.getByRole('status')).toHaveText('2 jogadores selecionados');
    await all.press('Space');
    await all.press('Space');
    await expect(page.getByRole('status')).toHaveText('0 jogadores selecionados');
    await accessible(page);
    await open(page, 'checkbox--long-label', theme);
    await page.setViewportSize({ width: 320, height: 852 });
    await page.addStyleTag({ content: 'html {font-size:200% !important;}' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await accessible(page);
  });
  test(`Card composes real form components with validation, native data and reset / ${theme}`, async ({
    page,
  }) => {
    await open(page, 'card--registration', theme);
    const input = page.getByRole('textbox', { name: 'Nome do jogador' });
    await page.getByRole('button', { name: 'Adicionar jogador' }).click();
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await input.fill('André');
    await page.getByRole('button', { name: 'Adicionar jogador' }).click();
    await expect(page.getByRole('status')).toHaveText('André adicionado.');
    await expect(page.locator('[data-avatar]')).toBeVisible();
    await expect(page.locator('[data-badge]')).toBeVisible();
    const checkbox = page.getByRole('checkbox');
    await checkbox.uncheck();
    expect(
      await page
        .locator('form')
        .evaluate((form: HTMLFormElement) => new FormData(form).has('confirmed')),
    ).toBe(false);
    await page.locator('form').evaluate((form: HTMLFormElement) => form.reset());
    await expect(checkbox).toBeChecked();
    await accessible(page);
  });
  for (const [slug, name] of [
    ['input', 'Input'],
    ['formfield', 'FormField'],
    ['checkbox', 'Checkbox'],
  ]) {
    test(`${name} MDX reference renders / ${theme}`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=componentes-${slug}--docs&viewMode=docs&globals=theme:${theme}`,
      );
      await expect(page.getByRole('heading', { name, exact: true }).first()).toBeVisible();
      await expect(page.getByText('Propriedades', { exact: true }).first()).toBeVisible();
    });
  }
}
