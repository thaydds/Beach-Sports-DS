import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonBaseProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'style' | 'aria-busy' | 'aria-disabled'
> {
  /** Hierarquia visual da ação. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Bloqueia a ativação e preserva o foco durante uma operação. */
  loading?: boolean;
  /** Mensagem acessível durante a operação; não substitui o texto visual. */
  loadingLabel?: string;
}

/** Shared native behavior; deliberately absent from the public entry. */
export const ButtonBase = forwardRef<HTMLButtonElement, ButtonBaseProps>(function ButtonBase(
  {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    loadingLabel,
    type = 'button',
    className,
    onClick,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...props
  },
  ref,
) {
  const busy = loading && !disabled;
  const busyName = busy && loadingLabel ? loadingLabel : undefined;

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={[styles.button, className].filter(Boolean).join(' ')}
      data-style={variant}
      data-size={size}
      data-state={disabled ? 'disabled' : busy ? 'loading' : 'default'}
      disabled={disabled}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      aria-label={busyName ?? ariaLabel}
      aria-labelledby={busyName ? undefined : ariaLabelledBy}
      onClick={(event) => {
        // Also cancels keyboard and implicit form submission's synthetic click.
        if (loading || disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
});

export function Spinner() {
  return <span aria-hidden="true" className={styles.spinner} />;
}
