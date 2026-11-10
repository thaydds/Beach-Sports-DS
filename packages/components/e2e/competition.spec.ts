import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from './fixtures';

async function open(page: Page, id: string, theme: string) {
  await page.goto(`/iframe.html?id=componentes-${id}&viewMode=story&globals=theme:${theme}`);
  await expect(
    page.locator('#storybook-root [data-score-match], #storybook-root [data-ranking]').first(),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
}
async function accessible(page: Page) {
  expect((await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations).toEqual(
    [],
  );
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const theme of ['light', 'dark']) {
  test(`ScoreMatch four combinations, public primitives and data preservation / ${theme}`, async ({
    page,
  }, info) => {
    await open(page, 'scorematch--variants', theme);
    const matches = page.locator('[data-score-match]');
    await expect(matches).toHaveCount(4);
    for (const match of await matches.all()) {
      const expanded = (await match.getAttribute('data-score-density')) === 'expanded';
      const finished = (await match.getAttribute('data-state')) === 'finished';
      await expect(match.locator('[data-slot="score"]').first()).toHaveCSS(
        'font-size',
        expanded ? '32px' : '24px',
      );
      await expect(match.locator('[data-slot="players"]')).toHaveCount(2);
      await expect(
        match.getByText('André, Andressa, Arrana, Erick, Gustavo e Iolanda', { exact: true }),
      ).toBeVisible();
      await expect(
        match.getByText('Lana, LL, Richard, Sabrina, Thay e Tigrinho', { exact: true }),
      ).toBeVisible();
      await expect(match.locator('[data-avatar]')).toHaveCount(expanded ? 2 : 0);
      await expect(match.locator('[data-badge]')).toHaveCount(finished ? 2 : 1);
      await expect(
        match.getByText(finished ? 'Finalizada' : 'Ao vivo', { exact: true }),
      ).toBeVisible();
      await expect(match.getByText('Time A · Vencedor', { exact: true })).toHaveCount(
        finished ? 1 : 0,
      );
      const action = match.getByRole('button');
      await expect(action).toHaveCSS('width', '44px');
      await expect(action).toHaveCSS('height', '44px');
      await expect(match).not.toHaveAttribute('tabindex');
    }
    await accessible(page);
    await noOverflow(page);
    await info.attach('score-match', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('score.png') }),
      contentType: 'image/png',
    });
  });
  test(`ScoreMatch preserves two teams in a 393px app viewport / ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await open(page, 'scorematch--playground', theme);
    await page.locator('[data-score-match]').evaluate((node) => {
      node.style.width = '345px';
    });
    const teams = page.locator('[data-slot="team"]');
    const first = await teams.first().boundingBox(),
      second = await teams.last().boundingBox();
    expect(second!.y).toBeCloseTo(first!.y, 1);
    expect(second!.x).toBeGreaterThan(first!.x);
    await noOverflow(page);
    await accessible(page);
  });
  test(`Ranking keeps native columns in a 393px app viewport / ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await open(page, 'ranking--playground', theme);
    await page.locator('[data-ranking]').evaluate((node) => {
      node.style.width = '345px';
    });
    await expect(page.getByRole('columnheader').first()).toBeVisible();
    await expect(page.locator('[data-ranking] tbody')).toHaveCSS('display', 'table-row-group');
    const row = page.locator('[data-ranking] tbody tr').first();
    const player = await row.getByRole('rowheader').boundingBox();
    const points = await row.locator('td').last().boundingBox();
    expect(points!.x).toBeGreaterThan(player!.x);
    await noOverflow(page);
    await accessible(page);
  });
  test(`ScoreMatch action focus and consumer-controlled result confirmation / ${theme}`, async ({
    page,
  }) => {
    await open(page, 'scorematch--interaction', theme);
    const more = page.getByRole('button', { name: 'Mais ações da partida #014' });
    await more.focus();
    await expect(more).toHaveCSS('outline-width', '2px');
    await more.press('Enter');
    await expect(page.getByRole('status')).toContainText('Ações: 1.');
    await more.press('Tab');
    await expect(page.getByRole('button', { name: 'Confirmar resultado' })).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByText('Finalizada', { exact: true })).toBeVisible();
    await expect(page.getByText('Time A · Vencedor', { exact: true })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Vencedor: Time A.');
    await expect(page.getByRole('button', { name: 'Confirmar resultado' })).toBeDisabled();
    await accessible(page);
  });
  test(`ScoreMatch narrow stacking, long names and text at 200 percent / ${theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 852 });
    await open(page, 'scorematch--long-content', theme);
    const teams = page.locator('[data-slot="team"]');
    const first = await teams.first().boundingBox(),
      second = await teams.last().boundingBox();
    expect(second!.y).toBeGreaterThan(first!.y + first!.height);
    await page.addStyleTag({ content: 'html {font-size:200% !important;}' });
    await expect(page.locator('[data-slot="score"]').first()).toHaveCSS('font-size', '48px');
    await expect(page.locator('[data-slot="players"]').first()).toContainText(
      'André, Andressa, Arrana, Erick, Gustavo e Iolanda',
    );
    await noOverflow(page);
    await accessible(page);
    await info.attach('score-narrow', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
  test(`Ranking densities, aligned columns, decorative avatars and native headers / ${theme}`, async ({
    page,
  }, info) => {
    // Keep this canonical geometry check wide even in the mobile project; reflow has its own case.
    await page.setViewportSize({ width: 1440, height: 1000 });
    await open(page, 'ranking--densities', theme);
    const rankings = page.locator('[data-ranking]');
    await expect(rankings).toHaveCount(2);
    for (const [i, ranking] of (await rankings.all()).entries()) {
      const rows = ranking.locator('tbody tr');
      await expect(rows).toHaveCount(5);
      await expect(ranking.getByRole('columnheader')).toHaveCount(3);
      await expect(ranking.getByRole('rowheader')).toHaveCount(5);
      await expect(ranking.locator('caption h2')).toHaveCSS('font-size', '20px');
      await expect(ranking.locator('[data-avatar]').first()).toHaveCSS(
        'width',
        i === 0 ? '32px' : '44px',
      );
      await expect(rows.first()).toHaveCSS('height', i === 0 ? '56px' : '76px');
      expect((await rows.nth(1).boundingBox())!.height).toBeCloseTo(i === 0 ? 64 : 94, 1);
      await expect(rows.first().getByRole('rowheader')).toHaveCSS('text-align', 'start');
      const position = await ranking.getByRole('columnheader', { name: 'Posição' }).boundingBox();
      const points = await ranking.getByRole('columnheader', { name: 'Pontos' }).boundingBox();
      expect(position!.width).toBe(84);
      expect(points!.width).toBe(84);
      await expect(rows.first().locator('td').last().locator('p')).toHaveText('120');
      await expect(ranking.getByText('Você', { exact: true })).toBeVisible();
      await expect(rows.nth(1)).toHaveAttribute('data-emphasis', 'highlighted');
      await expect(rows.nth(1)).not.toHaveAttribute('aria-selected');
    }
    await expect(page.getByRole('img')).toHaveCount(0);
    await accessible(page);
    await info.attach('ranking', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('ranking.png') }),
      contentType: 'image/png',
    });
  });
  test(`Ranking independent markers, ties and variable item count preserve focus / ${theme}`, async ({
    page,
  }) => {
    await open(page, 'ranking--optional-regions', theme);
    await expect(page.locator('[data-avatar]')).toHaveCount(0);
    const rows = page.locator('[data-ranking] tbody tr');
    await expect(rows.nth(1)).toHaveAttribute('data-emphasis', 'default');
    await expect(rows.nth(1)).toContainText('Você');
    await expect(rows.nth(2)).toHaveAttribute('data-emphasis', 'highlighted');
    await expect(rows.nth(2).getByText('Você')).toHaveCount(0);
    await expect(rows.nth(1).locator('td').first()).toHaveText('2');
    await expect(rows.nth(2).locator('td').first()).toHaveText('2');
    await accessible(page);
    await open(page, 'ranking--collection', theme);
    const toggle = page.getByRole('button', { name: 'Mostrar 5 jogadores' });
    await toggle.focus();
    await toggle.press('Enter');
    await expect(page.getByRole('rowheader')).toHaveCount(5);
    await expect(page.getByRole('button', { name: 'Mostrar 3 jogadores' })).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByRole('rowheader')).toHaveCount(3);
    await expect(page.getByRole('status')).toHaveText('3 jogadores na classificação.');
    await accessible(page);
  });
  test(`Ranking narrow names, preserved points and text enlargement / ${theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 852 });
    await open(page, 'ranking--long-content', theme);
    await expect(page.locator('[data-avatar]').first()).not.toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'André Nunes de Albuquerque' })).toBeVisible();
    await expect(
      page.locator('[data-ranking] tbody tr').nth(1).locator('td').last().locator('p'),
    ).toHaveText('110');
    await page.addStyleTag({ content: 'html {font-size:200% !important;}' });
    await expect(page.locator('[data-ranking] tbody [data-variant="label-m"]').first()).toHaveCSS(
      'font-size',
      '28px',
    );
    await noOverflow(page);
    await accessible(page);
    await info.attach('ranking-narrow', {
      body: await page.screenshot({ fullPage: true, path: info.outputPath('ranking-narrow.png') }),
      contentType: 'image/png',
    });
  });
  test(`RankingItem four variants keep required table semantics / ${theme}`, async ({ page }) => {
    await open(page, 'rankingitem--variants', theme);
    await expect(page.getByRole('table')).toHaveCount(2);
    await expect(page.locator('[data-ranking-item]')).toHaveCount(4);
    await accessible(page);
  });
  test(`Existing Card, Avatar and Badge stories reuse the new compositions / ${theme}`, async ({
    page,
  }) => {
    for (const id of [
      'card--competition',
      'avatar--ranking-composition',
      'badge--match-composition',
    ]) {
      await open(page, id, theme);
      await accessible(page);
    }
  });
  for (const [slug, name] of [
    ['scorematch', 'ScoreMatch'],
    ['ranking', 'Ranking'],
    ['rankingitem', 'RankingItem'],
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

for (const theme of ['light', 'dark']) {
  test(`Score content slots use native DS Inputs in both densities / ${theme}`, async ({
    page,
  }) => {
    for (const story of ['editable', 'editable-expanded']) {
      await page.goto(
        `/iframe.html?id=componentes-scorematch--${story}&viewMode=story&globals=theme:${theme}`,
      );
      const panel = page.getByRole('article');
      await expect(panel.getByRole('textbox')).toHaveCount(2);
      for (const input of await panel.locator('[data-input]').all()) {
        await expect(input).toHaveCSS('width', '56px');
        await expect(input).toHaveCSS('height', '56px');
      }
      await panel.getByRole('textbox', { name: 'Placar Time A' }).fill('25');
      await expect(panel.getByRole('textbox', { name: 'Placar Time A' })).toHaveValue('25');
      await expect(panel.getByText('Time B', { exact: true })).toBeVisible();
      expect(
        (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
      ).toEqual([]);
      await page.setViewportSize({ width: 320, height: 852 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}
