import { forwardRef, type HTMLAttributes, type ReactElement } from 'react';
import { Typography } from '../Typography/Typography';
import styles from './Chip.module.css';
export interface ChipProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'style' | 'onClick' | 'onChange' | 'tabIndex'
> {
  label: string;
  size?: 'sm' | 'md';
  selected?: boolean;
  disabled?: boolean;
  icon?: ReactElement;
  /** Exibe o check nativo quando selecionado, sem ícone no estado Default. */
  showSelectionIndicator?: boolean;
  onSelectedChange: (selected: boolean) => void;
  onRemove?: () => void;
  removeLabel?: string;
}
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  {
    label,
    size = 'sm',
    selected = false,
    disabled = false,
    icon,
    showSelectionIndicator = false,
    onSelectedChange,
    onRemove,
    removeLabel = `Remover ${label}`,
    className,
    ...props
  },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      className={[styles.chip, className].filter(Boolean).join(' ')}
      data-chip=""
      data-size={size}
      data-selected={selected}
      data-disabled={disabled}
    >
      <button
        className={styles.select}
        type="button"
        disabled={disabled}
        aria-pressed={selected}
        onClick={() => onSelectedChange(!selected)}
      >
        {(icon || (selected && showSelectionIndicator)) && (
          <span className={styles.icon} aria-hidden="true">
            {selected ? <span className={styles.check} /> : icon}
          </span>
        )}
        <Typography as="span" tone="inherit" variant={size === 'sm' ? 'label-s' : 'label-m'}>
          {label}
        </Typography>
      </button>
      {onRemove && (
        <button
          className={styles.remove}
          type="button"
          disabled={disabled}
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <span className={styles.cross} aria-hidden="true" />
        </button>
      )}
    </span>
  );
});
