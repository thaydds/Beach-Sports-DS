import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Input } from './Input';
import { FormExample } from '../../../docs/examples/ButtonExamples';

describe('Input', () => {
  it('forwards native attributes and ref to the editable input, with className on the root', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <Input
        ref={ref}
        aria-label="E-mail"
        type="email"
        name="email"
        id="email"
        autoComplete="email"
        required
        className="layout"
      />,
    );
    expect(ref.current).toBe(screen.getByRole('textbox'));
    expect(ref.current).toHaveAttribute('type', 'email');
    expect(ref.current).toHaveAttribute('autocomplete', 'email');
    expect(ref.current).toBeRequired();
    expect(container.firstChild).toHaveClass('layout');
  });
  it('supports uncontrolled editing and controlled updates without fabricating content state', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Input aria-label="Nome" defaultValue="André" onChange={onChange} />,
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Iolanda' } });
    expect(screen.getByRole('textbox')).toHaveValue('Iolanda');
    expect(onChange).toHaveBeenCalledOnce();
    rerender(<Input key="controlled" aria-label="Nome" value="Gustavo" onChange={onChange} />);
    expect(screen.getByRole('textbox')).toHaveValue('Gustavo');
  });
  it('removes absent slots and hides a decorative leading icon from the accessible name', () => {
    const { container, rerender } = render(<Input aria-label="Nome" />);
    expect(container.querySelector('[aria-hidden]')).toBeNull();
    rerender(<Input aria-label="Nome" leadingIcon={<span>Ícone</span>} />);
    expect(screen.getByRole('textbox')).toHaveAccessibleName('Nome');
    expect(screen.getByText('Ícone').parentElement).toHaveAttribute('aria-hidden', 'true');
  });
  it('composes a real IconButton whose activation never submits the form', () => {
    const onClick = vi.fn(),
      submit = vi.fn();
    render(
      <form onSubmit={submit}>
        <Input aria-label="Nome" trailingAction={{ icon: <span />, label: 'Limpar', onClick }} />
      </form>,
    );
    const action = screen.getByRole('button', { name: 'Limpar' });
    expect(action).toHaveAttribute('data-size', 'sm');
    expect(action).toHaveAttribute('type', 'button');
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });
  it('keeps readOnly focusable while blocking mutating actions; informational actions can opt in', () => {
    const action = { icon: <span />, label: 'Limpar', onClick: vi.fn() };
    const { rerender } = render(
      <Input aria-label="Nome" defaultValue="André" readOnly trailingAction={action} />,
    );
    expect(screen.getByRole('textbox')).not.toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByRole('button')).toBeDisabled();
    rerender(
      <Input aria-label="Nome" readOnly trailingAction={{ ...action, changesValue: false }} />,
    );
    expect(screen.getByRole('button')).not.toBeDisabled();
    rerender(
      <Input aria-label="Nome" disabled trailingAction={{ ...action, changesValue: false }} />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
  it('communicates validation independently of readOnly and disabled', () => {
    const { rerender } = render(<Input aria-label="Nome" validation="error" readOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    rerender(<Input aria-label="Nome" validation="error" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
  it('updates the existing Button form example to use FormField/Input and preserves submit behavior', () => {
    render(<FormExample />);
    expect(
      screen.getByRole('textbox', { name: 'Nome do time' }).closest('[data-form-field]'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar time' }));
    expect(screen.getByRole('status')).toHaveTextContent('1 envio(s). Operação em andamento.');
  });
  it('has accessible composed controls', async () => {
    const { container } = render(
      <Input
        aria-label="Nome"
        leadingIcon={<span />}
        trailingAction={{ icon: <span />, label: 'Opções' }}
      />,
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});

function typeContracts() {
  // @ts-expect-error Checkbox has its own component.
  const checkbox = <Input type="checkbox" />;
  // @ts-expect-error size is the documented scale, not the native character count.
  const size = <Input size={20} />;
  // @ts-expect-error Actions must have accessible names.
  const action = <Input trailingAction={{ icon: <span /> }} />;
  // @ts-expect-error Style overrides bypass the token contract.
  const style = <Input style={{ color: 'red' }} />;
  return [checkbox, size, action, style];
}
void typeContracts;
