import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Loading } from '../../index';

describe('Loading', () => {
  it('has a nonvisual status name, forwards ref and renders no text', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Loading ref={ref} label="Buscando histórico" id="history-loading" />);
    const status = screen.getByRole('status', { name: 'Buscando histórico' });
    expect(status).toBe(ref.current);
    expect(status).toHaveAttribute('id', 'history-loading');
    expect(status).toHaveTextContent('');
    expect(status).toHaveAttribute('data-size', 'sm');
    expect(status.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
  it.each(['sm', 'md', 'lg'] as const)(
    'supports the %s size and has no axe violations',
    async (size) => {
      const { container } = render(<Loading size={size} />);
      expect(screen.getByRole('status')).toHaveAttribute('data-size', size);
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
