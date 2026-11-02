import type { Preview } from '@storybook/react-vite';

import '@beachsports/tokens/css/tokens.css';
import '../src/styles/reset.css';
import '../src/styles/base.css';

type Theme = 'light' | 'dark';

function storedTheme(): Theme {
  try {
    return localStorage.getItem('beachsports-docs-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

const preview: Preview = {
  parameters: {
    layout: 'padded',
    options: { storySort: { order: ['Comece aqui', 'Fundamentos', 'Referência'] } },
    viewport: {
      options: {
        mobile: {
          name: 'Mobile — 393×852',
          styles: { width: '393px', height: '852px' },
        },
      },
    },
    a11y: {
      // Accessibility violations fail the story, not just warn.
      test: 'error',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Tema do design system',
      toolbar: {
        title: 'Tema',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: storedTheme(),
    viewport: { value: 'mobile', isRotated: false },
  },
  decorators: [
    (Story, context) => {
      const theme: Theme = context.globals.theme === 'dark' ? 'dark' : 'light';

      // Also theme MDX docs outside the story wrapper.
      document.documentElement.dataset.theme = theme;
      return (
        <div
          data-theme={theme}
          style={{
            colorScheme: theme,
            minHeight: '100%',
            padding: 'var(--ds-space-16)',
            background: 'var(--ds-color-bg-base)',
            color: 'var(--ds-color-text-primary)',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
