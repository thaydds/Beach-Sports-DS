import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Checkbox } from './Checkbox';
import { PlayerSelection } from '../../../docs/examples/FormExamples';

describe('Checkbox', () => {
  it('uses a real native checkbox with label, ref and form attributes', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Checkbox label="André" ref={ref} name="players" value="andre" required defaultChecked />,
    );
    const input = screen.getByRole('checkbox', { name: 'André' });
    expect(ref.current).toBe(input);
    expect(input).toBeChecked();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('name', 'players');
    expect(input).toHaveAttribute('value', 'andre');
  });
  it('activates through its label and supports uncontrolled and controlled selection', () => {
    const change = vi.fn();
    const { rerender } = render(<Checkbox label="André" onChange={change} />);
    fireEvent.click(screen.getByText('André'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(change).toHaveBeenCalledOnce();
    rerender(<Checkbox key="controlled" label="André" checked={false} onChange={change} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
  it('sets native indeterminate, preserves it while disabled and synchronizes prop changes', () => {
    const { rerender } = render(
      <Checkbox label="Todos" indeterminate disabled checked={false} onChange={() => {}} />,
    );
    expect(screen.getByRole('checkbox')).toBePartiallyChecked();
    expect(screen.getByRole('checkbox')).toBeDisabled();
    rerender(<Checkbox label="Todos" indeterminate={false} checked onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBePartiallyChecked();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
  it('keeps an accessible name with no visual label or label gap', () => {
    const { container } = render(<Checkbox label="Selecionar André" showLabel={false} />);
    expect(screen.getByRole('checkbox', { name: 'Selecionar André' })).toBeInTheDocument();
    expect(screen.queryByText('Selecionar André')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('data-label', 'false');
  });
  it('includes only checked named values in native FormData', () => {
    render(
      <form aria-label="Time">
        <Checkbox label="André" name="players" value="andre" defaultChecked />
        <Checkbox label="Iolanda" name="players" value="iolanda" />
        <Checkbox label="Gustavo" name="players" value="gustavo" defaultChecked disabled />
      </form>,
    );
    expect(new FormData(screen.getByRole<HTMLFormElement>('form')).getAll('players')).toEqual([
      'andre',
    ]);
  });
  it('updates parent mixed state and child selection in the documented group example', () => {
    render(<PlayerSelection />);
    expect(screen.getByRole('checkbox', { name: 'Selecionar todos' })).toBePartiallyChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todos' }));
    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'André' }));
    expect(screen.getByRole('checkbox', { name: 'Selecionar todos' })).toBePartiallyChecked();
    expect(screen.getByRole('status')).toHaveTextContent('2 jogadores selecionados');
  });
  it('has accessible native group semantics', async () => {
    const { container } = render(<PlayerSelection />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
function typeContracts() {
  // @ts-expect-error Hidden labels still require an accessible name.
  const name = <Checkbox showLabel={false} />;
  // @ts-expect-error Checkbox has no readOnly state.
  const readOnly = <Checkbox label="Nome" readOnly />;
  // @ts-expect-error No undocumented sizes.
  const size = <Checkbox label="Nome" size="lg" />;
  return [name, readOnly, size];
}
void typeContracts;
