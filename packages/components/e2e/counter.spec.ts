import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';
for (const theme of ['light', 'dark'])
  test(`Counter editing, boundaries and row composition / ${theme}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(
      `/iframe.html?id=componentes-counter--in-match&viewMode=story&globals=theme:${theme}`,
    );
    const field = page.getByRole('spinbutton', { name: 'Placar Time A', exact: true });
    await expect(field).toHaveValue('21');
    await field.fill('09');
    await field.press('ArrowUp');
    await expect(field).toHaveValue('10');
    await field.press('Home');
    await expect(field).toHaveValue('00');
    await expect(
      page.getByRole('button', { name: 'Diminuir Placar Time A', exact: true }),
    ).toBeDisabled();
    await field.fill('99');
    await expect(
      page.getByRole('button', { name: 'Aumentar Placar Time A', exact: true }),
    ).toBeDisabled();
    await field.fill('21');
    await field.blur();
    for (const counter of await page.locator('[data-counter]').all()) {
      await expect(counter).toHaveCSS('width', '158px');
      await expect(counter).toHaveCSS('height', '106px');
      for (const button of await counter.getByRole('button').all()) {
        await expect(button).toHaveCSS('width', '44px');
        await expect(button).toHaveCSS('height', '44px');
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
    await field.focus();
    await field.selectText();
    await field.press('2');
    await field.press('1');
    await info.attach('counter-rows', {
      body: await page.screenshot({ path: info.outputPath('counter.png'), fullPage: true }),
      contentType: 'image/png',
    });
  });
