import { StrictMode, createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Button, Modal } from '../../index';

// jsdom has no top layer. Real focus containment / inertness are tested in Chromium.
const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
});
afterEach(() => {
  cleanup();
  if (originalShow) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShow);
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose);
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

describe('Modal', () => {
  it('names and describes the dialog and preserves native slot composition', async () => {
    render(
      <Modal
        open
        title="Salvar partida?"
        description="Confira os dados."
        onClose={vi.fn()}
        actions={<Button>Salvar</Button>}
      >
        <input aria-label="Nome" defaultValue="Terça" />
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Salvar partida?' });
    expect(dialog).toHaveAccessibleDescription('Confira os dados.');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('heading')).toHaveFocus();
    expect(
      await axe(dialog, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
  it('supports a nonvisual name and optional title and description', () => {
    render(
      <Modal open label="Detalhes" onClose={vi.fn()}>
        Conteúdo
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Detalhes' });
    expect(dialog).not.toHaveAttribute('aria-labelledby');
    expect(dialog).not.toHaveAttribute('aria-describedby');
    expect(dialog).toHaveFocus();
  });
  it('keeps mounted field values through busy and error updates', () => {
    const onClose = vi.fn();
    const activate = vi.fn();
    const content = <input aria-label="Nome" defaultValue="Terça" />;
    const actions = <Button onClick={activate}>Salvar</Button>;
    const { rerender } = render(
      <Modal open title="Salvar" onClose={onClose} actions={actions}>
        {content}
      </Modal>,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Quinta' } });
    rerender(
      <Modal open busy title="Salvar" onClose={onClose} actions={actions}>
        {content}
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-busy', 'true');
    expect(input).toHaveValue('Quinta');
    expect(input.parentElement).toHaveAttribute('inert');
    fireEvent.click(screen.getByText('Salvar', { selector: 'button span' }));
    const cancel = new Event('cancel', { bubbles: false, cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
    expect(activate).not.toHaveBeenCalled();
    rerender(
      <Modal open title="Salvar" onClose={onClose} actions={actions}>
        {content}
        <p role="alert">Tente de novo</p>
      </Modal>,
    );
    expect(screen.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('Quinta');
    expect(input.parentElement).not.toHaveAttribute('inert');
  });
  it('requests escape dismissal only when allowed and waits for controlled closure', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Modal open title="Detalhes" onClose={onClose} />);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledExactlyOnceWith('escape');
    expect(screen.getByRole('dialog')).toBeVisible();
    rerender(<Modal open closeOnEscape={false} title="Detalhes" onClose={onClose} />);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<Modal open={false} title="Detalhes" onClose={onClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('handles initial focus, StrictMode, scroll restoration and unmount cleanup', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const ref = createRef<HTMLInputElement>();
    const original = document.documentElement.style.overflow;
    const { unmount } = render(
      <StrictMode>
        <Modal open title="Editar" onClose={vi.fn()} initialFocusRef={ref}>
          <input ref={ref} aria-label="Nome" />
        </Modal>
      </StrictMode>,
    );
    expect(ref.current).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe('hidden');
    unmount();
    expect(trigger).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe(original);
    trigger.remove();
  });
});
