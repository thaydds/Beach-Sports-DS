import { forwardRef, useId, type ReactNode } from 'react';
import { Avatar, type AvatarProps } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { Card, type CardProps } from '../Card/Card';
import { IconButton, type IconButtonProps } from '../IconButton/IconButton';
import { Typography } from '../Typography/Typography';
import styles from './ScoreMatch.module.css';

export type ScoreMatchDensity = 'compact' | 'expanded';
export type ScoreMatchTeam = {
  name: string;
  score: string | number;
  /** Relação completa de jogadores; não é truncada em nenhuma densidade. */
  players: string;
  avatar?: Pick<AvatarProps, 'initials' | 'src' | 'content'>;
};
export type ScoreMatchProps = Omit<
  CardProps,
  'title' | 'description' | 'children' | 'footer' | 'action' | 'density' | 'surface'
> & {
  title: string;
  metadata: string;
  teamA: ScoreMatchTeam;
  teamB: ScoreMatchTeam;
  density?: ScoreMatchDensity;
  /** Informação de classificação fornecida pelo produto, nunca calculada pelo placar. */
  position?: string;
  description?: string;
  action?: Omit<IconButtonProps, 'icon' | 'size' | 'variant'>;
  /** Conteúdo adicional no rodapé; controles continuam independentes do painel. */
  children?: ReactNode;
} & ({ state?: 'live'; winnerLabel?: never } | { state: 'finished'; winnerLabel: string });

export const ScoreMatch = forwardRef<HTMLElement, ScoreMatchProps>(function ScoreMatch(
  {
    title,
    metadata,
    teamA,
    teamB,
    density = 'compact',
    state = 'live',
    winnerLabel,
    position,
    description = 'Placar provisório · resultado ainda não confirmado',
    action,
    children,
    as = 'article',
    titleAs = 'h2',
    className,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const finished = state === 'finished';
  return (
    <Card
      {...props}
      as={as}
      ref={ref}
      className={[styles.panel, className].filter(Boolean).join(' ')}
      density={density === 'expanded' ? 'comfortable' : 'compact'}
      data-score-match=""
      data-score-density={density}
      data-state={state}
      aria-label={label}
      aria-labelledby={labelledBy ?? (label ? undefined : titleId)}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.heading}>
            <Typography as={titleAs} variant="heading-m" id={titleId}>
              {title}
            </Typography>
            <Typography variant="text-s" tone="secondary">
              {metadata}
            </Typography>
            <Badge
              size="sm"
              tone={finished ? 'success' : 'info'}
              label={finished ? 'Finalizada' : 'Ao vivo'}
              icon={<span className={finished ? styles.finished : styles.live} />}
            />
            {position && <Typography variant="label-s">{position}</Typography>}
          </div>
          {action && (
            <IconButton
              {...action}
              size="sm"
              variant="ghost"
              icon={<span className={styles.more} />}
            />
          )}
        </div>
        <div className={styles.teams}>
          <Team team={teamA} density={density} />
          <Typography as="span" variant="label-m" tone="secondary" aria-hidden="true">
            ×
          </Typography>
          <Team team={teamB} density={density} />
        </div>
        {(finished || description || children != null) && (
          <div className={styles.footer}>
            {finished ? (
              <Badge
                size="md"
                tone="success"
                label={winnerLabel!}
                icon={<span className={styles.check} />}
              />
            ) : (
              description && (
                <Typography variant="text-s" tone="secondary">
                  {description}
                </Typography>
              )
            )}
            {children != null && <div className={styles.extra}>{children}</div>}
          </div>
        )}
      </div>
    </Card>
  );
});

function Team({ team, density }: { team: ScoreMatchTeam; density: ScoreMatchDensity }) {
  return (
    <div className={styles.team} data-slot="team">
      <Typography variant="label-m">{team.name}</Typography>
      <Typography variant={density === 'expanded' ? 'display-l' : 'display-m'} data-slot="score">
        {team.score}
      </Typography>
      {density === 'expanded' && team.avatar && <Avatar {...team.avatar} size="sm" decorative />}
      <Typography variant="text-s" tone="secondary" data-slot="players">
        {team.players}
      </Typography>
    </div>
  );
}
