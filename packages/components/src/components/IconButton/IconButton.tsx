import { forwardRef, type ReactElement } from 'react';

import { ButtonBase, Spinner, type ButtonBaseProps } from '../Button/ButtonBase';
import styles from '../Button/Button.module.css';

export interface IconButtonProps extends Omit<
  ButtonBaseProps,
  'children' | 'aria-label' | 'aria-labelledby'
> {
  /** Ícone decorativo. Use um elemento que herde currentColor. */
  icon: ReactElement;
  /** Nome obrigatório da ação para tecnologias assistivas. */
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, loading = false, disabled = false, className, ...props },
  ref,
) {
  return (
    <ButtonBase
      {...props}
      ref={ref}
      className={[styles.iconOnly, className].filter(Boolean).join(' ')}
      aria-label={label}
      loading={loading}
      disabled={disabled}
    >
      <span aria-hidden="true" className={styles.icon}>
        {loading && !disabled ? <Spinner /> : icon}
      </span>
    </ButtonBase>
  );
});
