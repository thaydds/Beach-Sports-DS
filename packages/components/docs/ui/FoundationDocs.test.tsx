import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { Colors, Geometry, Overview, Typography } from './FoundationDocs';

vi.mock('storybook/preview-api', () => ({
  addons: { getChannel: () => ({ on: vi.fn(), off: vi.fn(), emit: vi.fn() }) },
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = 'light';
});

describe('visual documentation', () => {
  it('shows the 34 color roles in both themes and filters by role', () => {
    render(
      <div>
        <Colors />
      </div>,
    );
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent('34 de 34 papéis');
    expect(screen.getAllByRole('img', { name: /^--ds-color-/ })).toHaveLength(68);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Encontre uma cor' }), {
      target: { value: 'action' },
    });
    expect(screen.getAllByRole('img', { name: /^--ds-color-/ })).toHaveLength(12);
    expect(screen.getByText('6 de 34 papéis')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Encontre uma cor' }), {
      target: { value: 'nao-existe' },
    });
    expect(screen.queryAllByRole('img', { name: /^--ds-color-/ })).toHaveLength(0);
    expect(screen.getByText(/Nenhuma cor encontrada/)).toBeInTheDocument();
  });

  it('switches the document theme and persists the selection', () => {
    render(
      <div>
        <Overview />
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('beachsports-docs-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('copies a CSS variable expression without changing the token', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(
      <div>
        <Colors />
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copiar --ds-color-action-default' }));
    await waitFor(() => expect(screen.getByText('Copiado')).toBeInTheDocument());
    expect(writeText).toHaveBeenCalledWith('var(--ds-color-action-default)');
  });

  it('previews custom text in all 12 native typography styles', () => {
    render(
      <div>
        <Typography />
      </div>,
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Experimente seu próprio texto' }), {
      target: { value: 'Vento a favor' },
    });
    expect(screen.getAllByText('Vento a favor')).toHaveLength(12);
  });

  it.each([
    ['overview', Overview],
    ['colors', Colors],
    ['typography', Typography],
    ['geometry', Geometry],
  ] as const)('has accessible documentation structure (%s)', async (_name, Page) => {
    render(
      <div>
        <Page />
      </div>,
    );
    // Browser validation covers layout and contrast; jsdom cannot measure them.
    expect(
      await axe(document.body, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
