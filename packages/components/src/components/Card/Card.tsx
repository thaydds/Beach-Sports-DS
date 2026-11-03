import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { Typography } from '../Typography/Typography';
import styles from './Card.module.css';

export type CardSurface = 'outlined' | 'raised';
export type CardDensity = 'compact' | 'comfortable';
export interface CardProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title' | 'style' | 'onClick' | 'tabIndex'
> {
  as?: 'div' | 'article' | 'section';
  surface?: CardSurface;
  density?: CardDensity;
  title?: ReactNode;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  description?: ReactNode;
  /** Controle acessível, normalmente IconButton SM Ghost. O consumidor controla o menu. */
  action?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

function present(value: ReactNode): boolean {
  return value !== undefined && value !== null && value !== false && value !== true && value !== '';
}

/** Contêiner passivo; ações e foco pertencem aos controles internos. */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    as: Element = 'div',
    surface = 'outlined',
    density = 'compact',
    title,
    titleAs = 'h2',
    description,
    action,
    children,
    footer,
    className,
    'aria-labelledby': labelledBy,
    'aria-label': label,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const hasTitle = present(title);
  const hasHeading = hasTitle || present(description);
  return (
    <Element
      {...props}
      ref={(element) => {
        if (typeof ref === 'function') ref(element);
        else if (ref) ref.current = element;
      }}
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-surface={surface}
      data-density={density}
      aria-label={label}
      aria-labelledby={labelledBy ?? (label === undefined && hasTitle ? titleId : undefined)}
    >
      {(hasHeading || present(action)) && (
        <div className={styles.header} data-slot="header">
          {hasHeading && (
            <div className={styles.heading}>
              {hasTitle && (
                <Typography
                  as={titleAs}
                  id={titleId}
                  variant={density === 'compact' ? 'heading-m' : 'heading-l'}
                >
                  {title}
                </Typography>
              )}
              {present(description) && <Typography tone="secondary">{description}</Typography>}
            </div>
          )}
          {present(action) && (
            <div className={styles.action} data-slot="action">
              {action}
            </div>
          )}
        </div>
      )}
      {present(children) && (
        <div className={styles.body} data-slot="body">
          {children}
        </div>
      )}
      {present(footer) && (
        <div className={styles.footer} data-slot="footer">
          {footer}
        </div>
      )}
    </Element>
  );
});
