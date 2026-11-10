import { test as base } from '@playwright/test';

export { expect, type Page, type Locator } from '@playwright/test';

// AxeBuilder owns accessibility scans in this suite. Set this before any frame
// boots Storybook, otherwise its automatic afterEach scan can race with ours.
export const test = base.extend({
  context: async ({ context }, runFixture) => {
    await context.addInitScript(() => {
      Object.defineProperty(globalThis, '__BEACHSPORTS_PLAYWRIGHT_A11Y__', { value: true });
    });
    await runFixture(context);
  },
});
