import { forwardRef, useEffect, useRef, type ComponentPropsWithoutRef } from 'react';

import { Typography } from '../Typography/Typography';
import styles from './Checkbox.module.css';

export type CheckboxSize = 'sm' | 'md';
export interface CheckboxProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
  | 'size'
  | 'style'
  | 'children'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-checked'
  | 'readOnly'
> {
  /** Também fornece o nome acessível quando showLabel é false. */
  label: string;
  size?: CheckboxSize;
  showLabel?: boolean;
  /** Estado parcial de um grupo; o consumidor sincroniza a seleção do grupo. */
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, size = 'md', showLabel = true, indeterminate = false, className, ...props },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  });
  return (
    <label
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-checkbox=""
      data-size={size}
      data-label={showLabel}
    >
      <input
        {...props}
        ref={(element) => {
          inputRef.current = element;
          if (typeof ref === 'function') ref(element);
          else if (ref) ref.current = element;
        }}
        className={styles.input}
        type="checkbox"
        aria-label={showLabel ? undefined : label}
      />
      <span className={styles.box} aria-hidden="true">
        <span className={styles.mark} />
      </span>
      {showLabel && (
        <Typography as="span" variant="label-m" tone="inherit" className={styles.label}>
          {label}
        </Typography>
      )}
    </label>
  );
});
