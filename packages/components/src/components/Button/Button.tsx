import { forwardRef, useId, type ReactElement, type ReactNode } from 'react';

import { ButtonBase, Spinner, type ButtonBaseProps } from './ButtonBase';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonBaseProps {
  /** Texto visível da ação. Não inclua controles interativos. */
  children: ReactNode;
  /** Elemento decorativo; tamanho e cor são controlados pelo botão. */
  icon?: ReactElement;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    loadingLabel,
    ...props
  },
  ref,
) {
  const busy = loading && !disabled;
  const labelId = useId();
  const busyId = useId();
  const busyName = busy && loadingLabel;
  const iconSlot = icon ? (
    <span aria-hidden="true" className={styles.icon}>
      {busy ? <Spinner /> : icon}
    </span>
  ) : null;

  return (
    <ButtonBase
      {...props}
      ref={ref}
      loading={loading}
      disabled={disabled}
      aria-labelledby={busyName ? `${labelId} ${busyId}` : props['aria-labelledby']}
    >
      {iconPosition === 'left' && iconSlot}
      <span id={labelId} className={styles.label} data-hidden={busy && !icon ? 'true' : undefined}>
        {children}
      </span>
      {iconPosition === 'right' && iconSlot}
      {busyName && (
        <span id={busyId} className={styles.srOnly}>
          {loadingLabel}
        </span>
      )}
      {busy && !icon && (
        <span aria-hidden="true" className={styles.centeredSpinner}>
          <Spinner />
        </span>
      )}
    </ButtonBase>
  );
});
