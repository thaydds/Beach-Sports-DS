import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { Colors, Geometry, Overview, TechnicalReference, Typography } from './FoundationDocs';

const guide = readFileSync(resolve(import.meta.dirname, '../../../../docs/consumption.md'), 'utf8');
const reference = readFileSync(resolve(import.meta.dirname, '../../../../docs/tokens.md'), 'utf8');

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
    expect(screen.getByRole('searchbox').closest('[data-form-field]')).toBeInTheDocument();
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

  const pages = [
    ['overview', Overview],
    ['colors', Colors],
    ['typography', Typography],
    ['geometry', Geometry],
    ['guide', () => <TechnicalReference markdown={guide} section="COMO USAR" />],
    ['reference', () => <TechnicalReference markdown={reference} />],
  ] as const;
  it.each(
    pages.flatMap(([name, Page]) =>
      (['light', 'dark'] as const).map((theme) => ({ name, Page, theme })),
    ),
  )('has accessible structure ($name / $theme)', async ({ Page, theme }) => {
    localStorage.setItem('beachsports-docs-theme', theme);
    render(
      <div>
        <Page />
      </div>,
    );
    // Browser validation covers layout and contrast; jsdom cannot measure them.
    expect(
      await axe(document.body, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
    expect(document.documentElement).toHaveAttribute('data-theme', theme);
  });
});
