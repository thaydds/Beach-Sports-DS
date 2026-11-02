import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

/**
 * Toolchain smoke test: proves jsdom, Testing Library, jest-dom and vitest-axe
 * are wired before the first component exists.
 */
describe('components toolchain', () => {
  it('renders a heading without accessibility violations', async () => {
    render(
      <main>
        <h1>Beach Sports DS</h1>
        <p>Design system toolchain.</p>
      </main>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Beach Sports DS');
    // jsdom has no canvas, so axe cannot compute color contrast here. Contrast
    // is enforced by addon-a11y in Storybook, which runs in a real browser.
    expect(
      await axe(document.body, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
