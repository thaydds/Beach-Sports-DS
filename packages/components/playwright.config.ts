import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: fileURLToPath(new URL('./playwright-report', import.meta.url)),
        open: 'never',
      },
    ],
  ],
  outputDir: fileURLToPath(new URL('./test-results', import.meta.url)),
  use: {
    baseURL: 'http://127.0.0.1:6007',
    browserName: 'chromium',
    reducedMotion: 'reduce',
    locale: 'pt-BR',
    timezoneId: 'America/Fortaleza',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 393, height: 852 } } },
  ],
  webServer: {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    command:
      'pnpm exec vite preview --outDir packages/components/storybook-static --host 127.0.0.1 --port 6007 --strictPort',
    url: 'http://127.0.0.1:6007/iframe.html',
    reuseExistingServer: false,
  },
});
