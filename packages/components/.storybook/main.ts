import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook 9 + react-vite.
 *
 * `base` is required for GitHub Pages project sites: the docs are served from
 * `/Beach-Sports-DS/`, and without it every asset 404s. The deploy workflow
 * sets `STORYBOOK_BASE_PATH`; local dev keeps `/`.
 */
const config: StorybookConfig = {
  stories: ['../docs/**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Storybook 9 enables autodocs only for entries tagged `autodocs`, which
  // keeps one docs page per component instead of dozens of generated pages.
  viteFinal(viteConfig) {
    viteConfig.base = process.env.STORYBOOK_BASE_PATH ?? '/';
    return viteConfig;
  },
};

export default config;
