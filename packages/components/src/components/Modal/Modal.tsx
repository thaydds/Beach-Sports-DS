import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';

import { Typography } from '../Typography/Typography';
import styles from './Modal.module.css';

const scrollLocks = new WeakMap<Document, { count: number; previous: string }>();

function lockScroll(doc: Document) {
  const state = scrollLocks.get(doc) ?? { count: 0, previous: doc.documentElement.style.overflow };
  state.count += 1;
  scrollLocks.set(doc, state);
  doc.documentElement.style.overflow = 'hidden';
  return () => {
    state.count -= 1;
    if (state.count === 0) {
      doc.documentElement.style.overflow = state.previous;
      scrollLocks.delete(doc);
    }
  };
}

export type ModalCloseReason = 'escape' | 'backdrop' | 'native';
type ModalName =
  | { title: Exclude<ReactNode, boolean | null | undefined>; label?: never }
  | { title?: never; /** Obrigatório quando não há título visual. */ label: string };
export type ModalProps = ModalName & {
  open: boolean;
  onClose: (reason: ModalCloseReason) => void;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** Impede dispensa e interação sem desmontar os dados do formulário. */
  busy?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
};

/** Dialog nativo: top layer e fundo inerte; Tab é contido explicitamente. */
export function Modal({
  open,
  onClose,
  title,
  label,
  description,
  children,
  actions,
  busy = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  initialFocusRef,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const pointerOutside = useRef(false);
  const latest = useRef({ open, busy, onClose });
  const titleId = useId();
  const descriptionId = useId();
  // Event listeners consult committed props without reopening an active dialog.
  useEffect(() => {
    latest.current = { open, busy, onClose };
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    const unlock = lockScroll(dialog.ownerDocument);
    const target = initialFocusRef?.current;
    if (target && dialog.contains(target)) target.focus();
    else (headingRef.current ?? dialog).focus();
    return () => {
      dialog.close();
      unlock();
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open, initialFocusRef]);

  useEffect(() => {
    if (open && busy) dialogRef.current?.focus();
  }, [open, busy]);

  function outside(x: number, y: number) {
    const rect = dialogRef.current!.getBoundingClientRect();
    return x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
  }

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-modal="true"
      aria-labelledby={title != null ? titleId : undefined}
      aria-label={title == null ? label : undefined}
      aria-describedby={description != null ? descriptionId : undefined}
      aria-busy={busy || undefined}
      className={[styles.modal, className].filter(Boolean).join(' ')}
      onKeyDown={(event) => {
        if (
          event.key !== 'Tab' ||
          (event.target as HTMLElement).closest('dialog') !== event.currentTarget
        )
          return;
        const dialog = event.currentTarget;
        const controls = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'a[href], area[href], button, input, select, textarea, summary, iframe, [contenteditable="true"], [tabindex]',
          ),
        )
          .filter(
            (node) =>
              node.tabIndex >= 0 &&
              !node.matches(':disabled') &&
              getComputedStyle(node).visibility === 'visible' &&
              !node.closest('[inert]') &&
              node.getClientRects().length > 0,
          )
          .sort(
            (a, b) =>
              (a.tabIndex > 0 ? a.tabIndex : Infinity) - (b.tabIndex > 0 ? b.tabIndex : Infinity),
          );
        const first = controls[0];
        const last = controls.at(-1);
        if (!first) {
          event.preventDefault();
          dialog.focus();
        } else if (
          event.shiftKey &&
          (!controls.includes(document.activeElement as HTMLElement) ||
            document.activeElement === first)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy && closeOnEscape) onClose('escape');
      }}
      onClose={() => {
        // Ignore close() events from controlled cleanup / StrictMode.
        if (!dialogRef.current?.open && latest.current.open) {
          if (latest.current.busy) dialogRef.current?.showModal();
          else latest.current.onClose('native');
        }
      }}
      onPointerDown={(event) => {
        pointerOutside.current =
          event.target === event.currentTarget && outside(event.clientX, event.clientY);
      }}
      onClick={(event) => {
        if (
          pointerOutside.current &&
          event.target === event.currentTarget &&
          outside(event.clientX, event.clientY) &&
          !busy &&
          closeOnBackdrop
        )
          onClose('backdrop');
        pointerOutside.current = false;
      }}
      onClickCapture={(event) => {
        if (busy && event.target !== event.currentTarget) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onSubmitCapture={(event) => {
        if (busy) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      {title != null && (
        <Typography ref={headingRef} as="h2" variant="heading-m" id={titleId} tabIndex={-1}>
          {title}
        </Typography>
      )}
      {description != null && (
        <Typography variant="text-m" tone="secondary" id={descriptionId}>
          {description}
        </Typography>
      )}
      {children != null && (
        <div
          className={styles.content}
          ref={(node) => {
            node?.toggleAttribute('inert', busy);
          }}
        >
          {children}
        </div>
      )}
      {actions != null && (
        <div
          className={styles.actions}
          ref={(node) => {
            node?.toggleAttribute('inert', busy);
          }}
        >
          {actions}
        </div>
      )}
    </dialog>
  );
}
