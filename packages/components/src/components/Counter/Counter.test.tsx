import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Counter, type CounterDigits } from './Counter';
function Demo({
  digits = 2,
  disabled = false,
  readOnly = false,
}: {
  digits?: CounterDigits;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const [value, setValue] = useState(9);
  return (
    <Counter
      label="Time A"
      value={value}
      digits={digits}
      disabled={disabled}
      readOnly={readOnly}
      onChange={setValue}
    />
  );
}
describe('Counter', () => {
  it.each([1, 2, 3] as const)('one integer/spinbutton with %i visual cells', (digits) => {
    render(<Counter label="Time A" value={0} digits={digits} onChange={vi.fn()} />);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);
    expect(screen.getByRole('spinbutton')).toHaveValue('0'.repeat(digits));
    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-valuemax',
      String(10 ** digits - 1),
    );
    expect(screen.getByRole('button', { name: 'Diminuir Time A' })).toBeDisabled();
  });
  it('carries09→10, handles keyboard and never goes below zero', () => {
    render(<Demo />);
    const input = screen.getByRole('spinbutton');
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Time A' }));
    expect(input).toHaveValue('10');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('09');
    fireEvent.keyDown(input, { key: 'Home' });
    expect(input).toHaveValue('00');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('00');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('01');
  });
  it('supports continuous typing/paste and padding on blur; rejects fractions, overflow and negative input', () => {
    render(<Demo />);
    const input = screen.getByRole('spinbutton');
    for (const text of ['', '-1', '1.5', '100', 'abc']) {
      fireEvent.change(input, { target: { value: text } });
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-valuenow', '9');
    }
    fireEvent.change(input, { target: { value: '21' } });
    expect(input).toHaveAttribute('aria-valuenow', '21');
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('07');
    fireEvent.change(input, { target: { value: '99' } });
    expect(screen.getByRole('button', { name: 'Aumentar Time A' })).toBeDisabled();
  });
  it.each(['disabled', 'readOnly'] as const)('blocks edits for %s', (property) => {
    render(<Demo {...{ [property]: true }} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Time A' }));
    fireEvent.change(input, { target: { value: '22' } });
    expect(input).toHaveValue('09');
  });
  it('never clamps props on digits reduction; exposes invalid combination until corrected', () => {
    const change = vi.fn(),
      valid = vi.fn();
    const { rerender } = render(
      <Counter label="Time A" digits={3} value={123} onChange={change} onValidityChange={valid} />,
    );
    rerender(
      <Counter label="Time A" digits={2} value={123} onChange={change} onValidityChange={valid} />,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue('123');
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
    expect(valid).toHaveBeenLastCalledWith(false);
    expect(change).not.toHaveBeenCalled();
    rerender(
      <Counter label="Time A" digits={2} value={23} onChange={change} onValidityChange={valid} />,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue('23');
    expect(valid).toHaveBeenLastCalledWith(true);
  });
});
