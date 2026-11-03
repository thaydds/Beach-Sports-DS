import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Chip } from './Chip';
describe('Chip', () => {
  it('is controlled and never toggles on removal', () => {
    const select = vi.fn(),
      remove = vi.fn();
    const { rerender } = render(<Chip label="André" onSelectedChange={select} onRemove={remove} />);
    fireEvent.click(screen.getByRole('button', { name: 'André', pressed: false }));
    expect(select).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'André' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Remover André' }));
    expect(remove).toHaveBeenCalledOnce();
    expect(select).toHaveBeenCalledOnce();
    rerender(<Chip label="André" selected onSelectedChange={select} onRemove={remove} />);
    fireEvent.click(screen.getByRole('button', { name: 'André', pressed: true }));
    expect(select).toHaveBeenLastCalledWith(false);
  });
  it('uses sibling native buttons without submitting the surrounding form', () => {
    const { container } = render(
      <form>
        <Chip label="André" onSelectedChange={vi.fn()} onRemove={vi.fn()} />
      </form>,
    );
    expect(container.querySelector('button button')).toBeNull();
    for (const button of screen.getAllByRole('button'))
      expect(button).toHaveAttribute('type', 'button');
  });
  it('disabled blocks both actions and announces its native disabled state', () => {
    const select = vi.fn(),
      remove = vi.fn();
    render(<Chip label="André" disabled selected onSelectedChange={select} onRemove={remove} />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(select).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
  it('omits icon and removal slots when absent and supports explicit removal names', () => {
    const { container, rerender } = render(<Chip label="André" onSelectedChange={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(container.querySelector('[aria-hidden]')).toBeNull();
    rerender(
      <Chip
        label="André"
        icon={<span>pessoa</span>}
        onSelectedChange={vi.fn()}
        onRemove={vi.fn()}
        removeLabel="Excluir filtro de jogador André"
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Excluir filtro de jogador André' }),
    ).toBeInTheDocument();
    expect(screen.getByText('pessoa').parentElement).toHaveAttribute('aria-hidden', 'true');
  });
});

function typeContracts() {
  // @ts-expect-error Selection is controlled; a callback is required.
  const inert = <Chip label="André" />;
  return inert;
}
void typeContracts;
