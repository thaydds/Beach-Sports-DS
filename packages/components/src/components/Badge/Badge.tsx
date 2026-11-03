import { forwardRef, type HTMLAttributes, type ReactElement } from 'react';
import { Typography } from '../Typography/Typography';
import styles from './Badge.module.css';
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export interface BadgeProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'style' | 'onClick' | 'tabIndex'
> {
  label: string;
  size?: 'sm' | 'md';
  tone?: BadgeTone;
  icon?: ReactElement;
}
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { label, size = 'sm', tone = 'neutral', icon, className, ...props },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      className={[styles.badge, className].filter(Boolean).join(' ')}
      data-size={size}
      data-tone={tone}
      data-badge=""
    >
      {icon && (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      )}
      <Typography as="span" variant={size === 'sm' ? 'label-s' : 'label-m'} tone="inherit">
        {label}
      </Typography>
    </span>
  );
});
