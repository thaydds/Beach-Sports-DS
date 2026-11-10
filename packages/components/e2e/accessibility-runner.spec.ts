import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from './fixtures';

type StorybookPreview = {
  storyStore: {
    loadStory: (input: { storyId: string }) => Promise<unknown>;
    getStoryContext: (story: unknown) => {
      globals: { a11y: { manual: boolean } };
      parameters: { a11y: { test: string } };
      reporting: { reports: { type: string; status: string }[] };
    };
  };
};

// Read Storybook's rendered context/report rather than repeating our flag logic.
async function auditState(page: Page) {
  return page.evaluate(async () => {
    const preview = Reflect.get(window, '__STORYBOOK_PREVIEW__') as StorybookPreview;
    const story = await preview.storyStore.loadStory({
      storyId: 'componentes-card--optional-regions',
    });
    const context = preview.storyStore.getStoryContext(story);
    const channel = Reflect.get(window, '__STORYBOOK_ADDONS_CHANNEL__') as {
      last: (event: string) => [{ reporters: { type: string; status: string }[] }] | undefined;
    };
    const finished = channel.last('storyFinished')?.[0];
    return {
      manual: context.globals.a11y.manual,
      severity: context.parameters.a11y.test,
      finished: !!finished,
      reports: (finished?.reporters ?? [])
        .filter((report) => report.type === 'a11y')
        .map((report) => report.status),
    };
  });
}

const storyUrl = '/iframe.html?id=componentes-card--optional-regions&viewMode=story';

test('normal Storybook still performs an automatic accessibility audit', async ({
  browser,
  baseURL,
}) => {
  // Deliberately bypass our E2E context fixture: this represents normal browsing.
  const context = await browser.newContext({ baseURL });
  try {
    const page = await context.newPage();
    await page.goto(storyUrl);
    await expect(page.locator('[data-surface]')).toHaveCount(4);
    await expect.poll(async () => (await auditState(page)).reports).toContain('passed');
    await expect.poll(async () => (await auditState(page)).finished).toBe(true);
    expect(await auditState(page)).toMatchObject({ manual: false, severity: 'error' });
  } finally {
    await context.close();
  }
});

test('Playwright owns the audit after each navigation without concurrent addon scans', async ({
  page,
}) => {
  for (let visit = 0; visit < 3; visit += 1) {
    await page.goto(storyUrl);
    await expect(page.locator('[data-surface]')).toHaveCount(4);
    await expect.poll(async () => (await auditState(page)).finished).toBe(true);
    expect(await auditState(page)).toMatchObject({ manual: true, severity: 'error', reports: [] });
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze()).violations,
    ).toEqual([]);
  }
});
