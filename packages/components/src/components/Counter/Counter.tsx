import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from 'react';
import { Typography } from '../Typography/Typography';
import { IconButton } from '../IconButton/IconButton';
import styles from './Counter.module.css';
export type CounterDigits = 1 | 2 | 3;
export interface CounterProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'type'
  | 'role'
  | 'min'
  | 'max'
  | 'step'
  | 'size'
  | 'style'
  | 'children'
  | 'aria-label'
  | 'aria-valuemin'
  | 'aria-valuemax'
  | 'aria-valuenow'
  | 'aria-invalid'
> {
  label: string;
  value: number;
  digits?: CounterDigits;
  onChange: (value: number) => void;
  onValidityChange?: (valid: boolean) => void;
  validation?: 'none' | 'error';
}
/** One editable integer. Visual cells are decoration, never separate inputs. */
export const Counter = forwardRef<HTMLInputElement, CounterProps>(function Counter(
  {
    label,
    value,
    digits = 2,
    onChange,
    onValidityChange,
    validation = 'none',
    disabled = false,
    readOnly = false,
    className,
    onBlur,
    onFocus,
    onSelect,
    onKeyDown,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const maximum = 10 ** digits - 1;
  const id = useId();
  const [edit, setEdit] = useState<{ value: number; digits: number; text: string } | null>(null);
  const format = (number: number) => String(number).padStart(digits, '0');
  const text = edit?.value === value && edit.digits === digits ? edit.text : format(value);
  const propValid =
    [1, 2, 3].includes(digits) && Number.isInteger(value) && value >= 0 && value <= maximum;
  const valid = propValid && /^\d+$/.test(text) && Number(text) <= maximum;
  const invalid = !valid || validation === 'error';
  const validity = useRef(onValidityChange);
  validity.current = onValidityChange;
  useEffect(() => {
    validity.current?.(!invalid);
  }, [invalid]);
  function change(next: number) {
    if (disabled || readOnly) return;
    setEdit(null);
    onChange(next);
  }
  function step(direction: number) {
    if (!valid || disabled || readOnly) return;
    change(Math.min(maximum, Math.max(0, Number(text) + direction)));
  }
  return (
    <span
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-counter=""
      data-digits={digits}
      data-invalid={invalid}
      data-disabled={disabled}
    >
      <span className={styles.value} data-slot="counter-value">
        <span className={styles.cells} aria-hidden="true">
          {Array.from({ length: [1, 2, 3].includes(digits) ? digits : 1 }, (_, i) => (
            <span
              key={i}
              className={styles.cell}
              data-slot="counter-digit"
              data-active={
                focused &&
                (selection.start === selection.end
                  ? i ===
                    Math.min(
                      digits - 1,
                      Math.max(0, selection.end + Math.max(0, digits - text.length) - 1),
                    )
                  : i >= selection.start && i < selection.end)
              }
            >
              <Typography as="span" variant="heading-l" tone="inherit">
                {valid ? format(Number(text))[i] : ''}
              </Typography>
            </span>
          ))}
        </span>
        {!valid && (
          <Typography
            as="span"
            variant="heading-l"
            tone="inherit"
            className={styles.invalidValue}
            aria-hidden="true"
          >
            {text}
          </Typography>
        )}
        <input
          {...props}
          ref={ref}
          className={styles.input}
          data-unformatted={!valid || undefined}
          type="text"
          role="spinbutton"
          inputMode="numeric"
          autoComplete="off"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={maximum}
          aria-valuenow={Number.isFinite(value) ? value : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={
            [describedBy, invalid ? id : undefined].filter(Boolean).join(' ') || undefined
          }
          disabled={disabled}
          readOnly={readOnly}
          value={text}
          onChange={(event) => {
            if (disabled || readOnly) return;
            const raw = event.target.value;
            const ok = /^\d+$/.test(raw) && Number(raw) <= maximum;
            setEdit({ value: ok ? Number(raw) : value, digits, text: raw });
            if (ok) onChange(Number(raw));
          }}
          onFocus={(event) => {
            setFocused(true);
            event.currentTarget.select();
            onFocus?.(event);
          }}
          onSelect={(event) => {
            setSelection({
              start: event.currentTarget.selectionStart ?? 0,
              end: event.currentTarget.selectionEnd ?? 0,
            });
            onSelect?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            if (valid) setEdit(null);
            onBlur?.(event);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || disabled || readOnly) return;
            if (['ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) {
              event.preventDefault();
              if (event.key === 'Home') change(0);
              else step(event.key === 'ArrowUp' ? 1 : -1);
            }
          }}
        />
      </span>
      <span className={styles.actions}>
        <IconButton
          size="sm"
          variant="secondary"
          label={`Aumentar ${label}`}
          icon={<span aria-hidden="true">+</span>}
          disabled={disabled || readOnly || !valid || Number(text) >= maximum}
          onClick={() => step(1)}
        />
        <IconButton
          size="sm"
          variant="secondary"
          label={`Diminuir ${label}`}
          icon={<span aria-hidden="true">−</span>}
          disabled={disabled || readOnly || !valid || Number(text) <= 0}
          onClick={() => step(-1)}
        />
      </span>
      {invalid && (
        <span className={styles.sr} id={id}>
          Informe um número inteiro de 0 a {maximum}.
        </span>
      )}
    </span>
  );
});
