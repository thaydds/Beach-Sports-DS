import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`Typography scale, root font preferences and contrast / ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=componentes-typography--scale&viewMode=story&globals=theme:${theme}`,
    );
    const samples = page.locator('#storybook-root [data-variant]');
    await expect(samples).toHaveCount(9);
    const sizes = [32, 24, 20, 17, 16, 15, 13, 14, 12];
    const lines = [38, 30, 26, 24, 24, 22, 18, 20, 16];
    const tracking = [-0.32, -0.12, -0.06, -0.034, 0, 0, 0, 0, 0.24];
    for (let i = 0; i < 9; i++) {
      await expect(samples.nth(i)).toHaveCSS('font-size', `${sizes[i]}px`);
      expect(
        parseFloat(await samples.nth(i).evaluate((e) => getComputedStyle(e).lineHeight)),
      ).toBeCloseTo(lines[i]!, 2);
      const spacing = await samples.nth(i).evaluate((e) => getComputedStyle(e).letterSpacing);
      expect(spacing === 'normal' ? 0 : parseFloat(spacing)).toBeCloseTo(tracking[i]!, 3);
    }
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await expect(samples.first()).toHaveCSS('font-size', '64px');
    await expect(samples.first()).toHaveCSS('line-height', '76px');
    await expect(samples.first()).toHaveCSS('letter-spacing', '-0.64px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
  });
  test(`Typography hierarchy, narrow reflow and text spacing / ${theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 852 });
    await page.goto(
      `/iframe.html?id=componentes-typography--hierarchy&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.addStyleTag({
      content:
        '#storybook-root p, #storybook-root h1, #storybook-root h2 { line-height:1.5 !important; letter-spacing:0.12em !important; word-spacing:0.16em !important; margin-bottom:2em !important; }',
    });
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await info.attach(`typography-${theme}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
}
