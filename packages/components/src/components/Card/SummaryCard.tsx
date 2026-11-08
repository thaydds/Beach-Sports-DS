import { forwardRef, useId, type HTMLAttributes } from 'react';
import { Typography } from '../Typography/Typography';
import styles from './SummaryCard.module.css';

type SummaryProps = Omit<
  HTMLAttributes<HTMLElement>,
  'title' | 'children' | 'style' | 'onClick' | 'tabIndex' | 'role'
> & {
  description: string;
  badge: string;
  selected?: boolean;
  disabled?: boolean;
  /** Presença do callback torna o card um botão de seleção controlada. */
  onSelectedChange?: (selected: boolean) => void;
};
export type PlayerCardProps = SummaryProps & { name: string; initials: string };
export type MatchCardProps = SummaryProps & { title: string };

type SummaryCardProps = SummaryProps & {
  variant: 'player' | 'match';
  title: string;
  initials?: string;
};

const SummaryCard = forwardRef<HTMLElement, SummaryCardProps>(function SummaryCard(
  {
    variant,
    title,
    initials,
    description,
    badge,
    selected = false,
    disabled = false,
    onSelectedChange,
    className,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();
  const interactive = !!onSelectedChange;
  const Element = interactive ? 'button' : 'article';
  return (
    <Element
      {...props}
      ref={(element) => {
        if (typeof ref === 'function') ref(element);
        else if (ref) ref.current = element;
      }}
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-summary-card={variant}
      data-selected={selected}
      data-disabled={disabled}
      aria-label={label}
      aria-labelledby={labelledBy ?? (label === undefined && !interactive ? titleId : undefined)}
      aria-describedby={
        [props['aria-describedby'], !interactive && descriptionId].filter(Boolean).join(' ') ||
        undefined
      }
      aria-disabled={disabled || undefined}
      {...(interactive
        ? {
            type: 'button' as const,
            disabled,
            'aria-pressed': selected,
            onClick: () => onSelectedChange?.(!selected),
          }
        : {})}
    >
      {variant === 'player' && (
        <span className={styles.avatar} data-slot="visual" aria-hidden="true">
          {initials}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.title} id={titleId} data-slot="title">
          {title}
        </span>
        <Typography as="span" variant="text-s" tone="muted" id={descriptionId}>
          {description}
        </Typography>
      </span>
      <span className={styles.badge} data-slot="badge">
        {badge}
      </span>
    </Element>
  );
});

/** Card/Type=Player do Figma; não altera o Avatar circular público. */
export const PlayerCard = forwardRef<HTMLElement, PlayerCardProps>(function PlayerCard(
  { name, ...props },
  ref,
) {
  return <SummaryCard {...props} ref={ref} title={name} variant="player" />;
});

/** Card/Type=Match do Figma; o placar detalhado continua sendo ScoreMatch. */
export const MatchCard = forwardRef<HTMLElement, MatchCardProps>(function MatchCard(props, ref) {
  return <SummaryCard {...props} ref={ref} variant="match" />;
});
