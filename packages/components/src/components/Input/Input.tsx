import { forwardRef, type ComponentPropsWithoutRef, type ReactElement } from 'react';

import { IconButton, type IconButtonProps } from '../IconButton/IconButton';
import styles from './Input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputValidation = 'none' | 'error';
export type InputTrailingAction = Pick<
  IconButtonProps,
  'icon' | 'label' | 'onClick' | 'disabled'
> & {
  /** Ações que alteram o valor são bloqueadas em readOnly. Padrão: true. */
  changesValue?: boolean;
};
export interface InputProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'size' | 'type' | 'style' | 'children' | 'aria-invalid'
> {
  size?: InputSize;
  type?: 'text' | 'search' | 'email' | 'password' | 'tel' | 'url' | 'number';
  validation?: InputValidation;
  /** Slot decorativo; sem slot, não há gap reservado. */
  leadingIcon?: ReactElement;
  trailingAction?: InputTrailingAction;
}

/** className pertence ao contêiner; ref e atributos nativos pertencem ao input. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    type = 'text',
    validation = 'none',
    leadingIcon,
    trailingAction,
    disabled = false,
    readOnly = false,
    className,
    ...props
  },
  ref,
) {
  return (
    <span
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-input=""
      data-size={size}
      data-validation={validation}
    >
      {leadingIcon && (
        <span className={styles.icon} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <input
        {...props}
        ref={ref}
        className={styles.control}
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={validation === 'error' || undefined}
      />
      {trailingAction && (
        <IconButton
          className={styles.action}
          variant="ghost"
          size="sm"
          icon={trailingAction.icon}
          label={trailingAction.label}
          onClick={trailingAction.onClick}
          disabled={
            disabled ||
            trailingAction.disabled ||
            (readOnly && trailingAction.changesValue !== false)
          }
        />
      )}
    </span>
  );
});
