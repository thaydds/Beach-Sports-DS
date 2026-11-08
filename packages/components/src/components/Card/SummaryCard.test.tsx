import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlayerCard, MatchCard } from '../../index';

describe('Figma Card compositions', () => {
  it('renders a passive named article by default and omits the player visual in Match', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <MatchCard
        ref={ref}
        title="Time A vs Time B"
        description="Hoje · Areia 2"
        badge="Agendada"
      />,
    );
    expect(ref.current).toBe(screen.getByRole('article', { name: 'Time A vs Time B' }));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="visual"]')).toBeNull();
    expect(ref.current).toHaveAccessibleDescription('Hoje · Areia 2');
  });
  it('uses controlled selection, a native button and no implicit form submission', () => {
    const change = vi.fn();
    const { rerender } = render(
      <PlayerCard
        name="Lana"
        initials="LS"
        description="Nível 12"
        badge="V 12"
        onSelectedChange={change}
      />,
    );
    const button = screen.getByRole('button', { name: /^Lana/ });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(change).toHaveBeenLastCalledWith(true);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    rerender(
      <PlayerCard
        name="Lana"
        initials="LS"
        description="Nível 12"
        badge="V 12"
        selected
        onSelectedChange={change}
      />,
    );
    fireEvent.click(button);
    expect(change).toHaveBeenLastCalledWith(false);
  });
  it('blocks disabled selection and preserves explicit accessible names', () => {
    const change = vi.fn();
    render(
      <PlayerCard
        name="Lana"
        initials="LS"
        description="Nível 12"
        badge="V 12"
        disabled
        aria-label="Lana indisponível"
        onSelectedChange={change}
      />,
    );
    const button = screen.getByRole('button', { name: 'Lana indisponível' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(change).not.toHaveBeenCalled();
    expect(button).not.toHaveAttribute('aria-labelledby');
  });
});
