import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import styles from './Loading.module.css';

export type LoadingSize = 'sm' | 'md' | 'lg';
export interface LoadingProps extends Omit<
  ComponentPropsWithoutRef<'span'>,
  'children' | 'style' | 'role' | 'aria-label' | 'aria-labelledby'
> {
  size?: LoadingSize;
  /** Nome apenas acessível; nunca renderiza texto visual. */
  label?: string;
}

export const Loading = forwardRef<HTMLSpanElement, LoadingProps>(function Loading(
  { size = 'sm', label = 'Carregando', className, ...props },
  ref,
) {
  const dimension = { sm: 16, md: 24, lg: 32 }[size];
  return (
    <span
      {...props}
      ref={ref}
      role="status"
      aria-label={label}
      className={[styles.loading, className].filter(Boolean).join(' ')}
      data-size={size}
    >
      <svg viewBox={`0 0 ${dimension} ${dimension}`} aria-hidden="true" focusable="false">
        <circle cx={dimension / 2} cy={dimension / 2} r={(dimension - 2) / 2} pathLength="100" />
      </svg>
    </span>
  );
});
