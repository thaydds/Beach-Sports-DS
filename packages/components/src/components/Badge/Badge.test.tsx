import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';
describe('Badge', () => {
  it.each(['neutral', 'info', 'success', 'warning', 'danger'] as const)(
    'keeps %s informative and non interactive',
    (tone) => {
      const { container } = render(<Badge label="Finalizada" tone={tone} />);
      expect(container.firstElementChild).toHaveAttribute('data-tone', tone);
      expect(container.firstElementChild).not.toHaveAttribute('tabindex');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByText('Finalizada')).toBeVisible();
    },
  );
  it('renders decorative icons without replacing the authoritative text', () => {
    const { container } = render(<Badge label="Ao vivo" size="md" icon={<span>ícone</span>} />);
    expect(container.firstElementChild).toHaveAttribute('data-size', 'md');
    expect(screen.getByText('ícone').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Ao vivo')).toHaveAttribute('data-variant', 'label-m');
  });
  it('forwards ref and permits explicit live announcements', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge label="Salvo" role="status" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('status'));
  });
});
