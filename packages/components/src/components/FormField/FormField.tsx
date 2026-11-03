import { forwardRef, useId } from 'react';

import { Input, type InputProps } from '../Input/Input';
import { Typography } from '../Typography/Typography';
import styles from './FormField.module.css';

export type FormFieldProps = Omit<InputProps, 'validation' | 'aria-label' | 'aria-labelledby'> & {
  label: string;
  helper?: string;
} & ({ validation?: 'none'; errorMessage?: never } | { validation: 'error'; errorMessage: string });

/** O Input real recebe ref, id, required e as relações acessíveis. */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  {
    label,
    helper,
    validation = 'none',
    errorMessage,
    id,
    required = false,
    className,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const message = validation === 'error' ? errorMessage : helper;
  const messageId = message ? `${controlId}-message` : undefined;
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')} data-form-field="">
      <Typography as="label" variant="label-m" htmlFor={controlId} className={styles.label}>
        <span>{label}</span>
        {required && (
          <span aria-hidden="true" className={styles.required}>
            *
          </span>
        )}
      </Typography>
      <Input
        {...props}
        ref={ref}
        id={controlId}
        required={required}
        validation={validation}
        aria-describedby={[describedBy, messageId].filter(Boolean).join(' ') || undefined}
      />
      {message && (
        <div id={messageId} className={styles.message}>
          {validation === 'error' && <span aria-hidden="true" className={styles.errorIcon} />}
          <Typography variant="text-s" tone="secondary">
            {message}
          </Typography>
        </div>
      )}
    </div>
  );
});
