import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { Button, IconButton, type ButtonProps, type IconButtonProps } from '../../index';

const icon = <svg data-testid="icon" aria-label="Decorativo" />;

describe('Button public contract', () => {
  it('defaults to a native non-submit button and forwards its ref and native attributes', () => {
    const ref = createRef<HTMLButtonElement>();
    const click = vi.fn();
    render(
      <Button ref={ref} id="join" name="action" value="join" form="signup" onClick={click}>
        Inscrever-se
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Inscrever-se' });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('form', 'signup');
    expect(button).toHaveAttribute('name', 'action');
    expect(button).toHaveAttribute('value', 'join');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveAttribute('data-style', 'primary');
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
  });

  it.each(['left', 'right'] as const)('places a decorative icon on the %s', (position) => {
    render(
      <Button icon={icon} iconPosition={position}>
        Continuar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Continuar' });
    const slot = screen.getByTestId('icon').parentElement;
    expect(slot).toHaveAttribute('aria-hidden', 'true');
    expect(position === 'left' ? button.firstElementChild : button.lastElementChild).toBe(slot);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('uses native disabled behavior and gives it precedence over loading', () => {
    const click = vi.fn();
    render(
      <Button disabled loading loadingLabel="Salvando" icon={icon} onClick={click}>
        Salvar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-state', 'disabled');
    expect(button).not.toHaveAttribute('aria-busy');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });

  it('keeps the native node focused and its original label while loading', () => {
    const click = vi.fn();
    const { rerender } = render(<Button onClick={click}>Salvar</Button>);
    const button = screen.getByRole('button', { name: 'Salvar' });
    button.focus();
    rerender(
      <Button loading onClick={click}>
        Salvar
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Salvar' })).toBe(button);
    expect(button).toHaveFocus();
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Salvar')).toHaveAttribute('data-hidden', 'true');
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });

  it('replaces the icon, preserves the visible label and optionally changes the accessible name', () => {
    render(
      <Button loading loadingLabel="Salvando inscrição" icon={icon}>
        Salvar
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Salvar Salvando inscrição' })).toBeInTheDocument();
    expect(screen.getByText('Salvar')).not.toHaveAttribute('data-hidden');
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });

  it('restores external labeling after loading', () => {
    const { rerender } = render(
      <Button aria-labelledby="external" loading loadingLabel="Salvando">
        Salvar
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Salvar Salvando' })).toHaveAttribute(
      'aria-labelledby',
    );
    rerender(
      <>
        <span id="external">Salvar inscrição</span>
        <Button aria-labelledby="external">Salvar</Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Salvar inscrição' })).not.toHaveAttribute(
      'aria-busy',
    );
  });

  it('submits a form when requested and prevents submission while loading', () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={submit}>
        <Button type="submit">Salvar</Button>
      </form>,
    );
    screen.getByRole('button').click();
    expect(submit).toHaveBeenCalledOnce();
    rerender(
      <form onSubmit={submit}>
        <Button type="submit" loading>
          Salvar
        </Button>
      </form>,
    );
    screen.getByRole('button').click();
    expect(submit).toHaveBeenCalledOnce();
  });

  it('cancels activation bubbling while loading', () => {
    const parent = vi.fn();
    render(
      <div onClick={parent}>
        <Button loading>Salvar</Button>
      </div>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(parent).not.toHaveBeenCalled();
  });

  it('requires label and icon in IconButton and exposes no simulated interaction states', () => {
    expectTypeOf<IconButtonProps>().toExtend<{ label: string; icon: React.ReactElement }>();
    expectTypeOf<'state'>().not.toExtend<keyof ButtonProps>();
    expectTypeOf<'focus'>().not.toExtend<keyof ButtonProps>();
    expectTypeOf<'style'>().not.toExtend<keyof ButtonProps>();
    expectTypeOf<'children'>().not.toExtend<keyof IconButtonProps>();
  });
});

describe('IconButton', () => {
  it('provides an accessible name, native attributes and a ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <>
        <p id="help">Abre a próxima etapa.</p>
        <IconButton ref={ref} icon={icon} label="Continuar" aria-describedby="help" />
      </>,
    );
    const button = screen.getByRole('button', { name: 'Continuar' });
    expect(button).toHaveAccessibleDescription('Abre a próxima etapa.');
    expect(ref.current).toBe(button);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('shares the loading guard and restores its original label and icon', () => {
    const click = vi.fn();
    const { rerender } = render(
      <IconButton loading loadingLabel="Avançando" icon={icon} label="Continuar" onClick={click} />,
    );
    const button = screen.getByRole('button', { name: 'Avançando' });
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    rerender(<IconButton icon={icon} label="Continuar" onClick={click} />);
    expect(button).toHaveAccessibleName('Continuar');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
  });

  it('has no axe violations in default, disabled and busy states', async () => {
    render(
      <main>
        <Button>Inscrever-se</Button>
        <Button disabled>Indisponível</Button>
        <Button loading>Salvar</Button>
        <IconButton icon={icon} label="Continuar" />
        <IconButton loading icon={icon} label="Avançar" />
      </main>,
    );
    expect(
      await axe(document.body, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
