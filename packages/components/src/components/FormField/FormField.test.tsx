import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import { FormField } from './FormField';
import { RegistrationCard } from '../../../docs/examples/FormExamples';

describe('FormField', () => {
  it('creates unique label/input/message associations and forwards the input ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <>
        <FormField label="Nome" helper="Nome completo" ref={ref} />
        <FormField label="Apelido" helper="Nome curto" />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Nome' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAccessibleDescription('Nome completo');
    expect(input.id).not.toBe(screen.getByRole('textbox', { name: 'Apelido' }).id);
    expect(screen.getByText('Nome').closest('label')).toHaveAttribute('for', input.id);
  });
  it('preserves external descriptions and replaces helper with the error message', () => {
    const { rerender } = render(
      <>
        <p id="external">Dado público.</p>
        <FormField label="Nome" id="name" helper="Ajuda" aria-describedby="external" />
      </>,
    );
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Dado público. Ajuda');
    rerender(
      <>
        <p id="external">Dado público.</p>
        <FormField
          label="Nome"
          id="name"
          helper="Ajuda"
          aria-describedby="external"
          validation="error"
          errorMessage="Erro: nome duplicado."
        />
      </>,
    );
    expect(screen.queryByText('Ajuda')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
      'Dado público. Erro: nome duplicado.',
    );
    expect(screen.getByRole('textbox')).toBeInvalid();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('does not reserve helper space or reference a nonexistent message', () => {
    const { container } = render(<FormField label="Nome" />);
    expect(container.querySelector('[data-form-field]')?.children).toHaveLength(2);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });
  it('synchronizes required, size, validation and disabled with the composed Input', () => {
    render(
      <FormField label="Nome" size="lg" required disabled validation="error" errorMessage="Erro" />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(input).toBeInvalid();
    expect(input.closest('[data-input]')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Nome').closest('label')).not.toHaveAttribute('aria-disabled');
  });
  it('keeps the Card registration flow composed from public components', () => {
    const { container } = render(<RegistrationCard />);
    expect(container.querySelectorAll('[data-form-field]')).toHaveLength(2);
    expect(container.querySelector('[data-checkbox]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar jogador' }));
    expect(screen.getByRole('textbox', { name: 'Nome do jogador' })).toHaveAccessibleDescription(
      'Erro: informe o nome do jogador.',
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome do jogador' }), {
      target: { value: 'André' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar jogador' }));
    expect(screen.getByRole('status')).toHaveTextContent('André adicionado.');
    expect(container.querySelector('[data-avatar]')).toBeInTheDocument();
    expect(container.querySelector('[data-badge]')).toBeInTheDocument();
  });
  it('has accessible validation and form composition', async () => {
    const { container } = render(<RegistrationCard />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
function typeContracts() {
  // @ts-expect-error Visible label is required.
  const label = <FormField />;
  // @ts-expect-error Error validation needs an explanation.
  const error = <FormField label="Nome" validation="error" />;
  // @ts-expect-error Do not silently display an error under non-error validation.
  const conflicting = <FormField label="Nome" errorMessage="Erro" />;
  return [label, error, conflicting];
}
void typeContracts;
