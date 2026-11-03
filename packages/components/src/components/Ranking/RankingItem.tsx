import { forwardRef, useContext, type ComponentPropsWithoutRef } from 'react';
import { Avatar, type AvatarProps } from '../Avatar/Avatar';
import { Typography } from '../Typography/Typography';
import { RankingDensityContext, RankingLabelsContext, type RankingDensity } from './RankingContext';
import styles from './Ranking.module.css';

export type RankingEmphasis = 'default' | 'highlighted';
export interface RankingItemProps extends Omit<
  ComponentPropsWithoutRef<'tr'>,
  'children' | 'style' | 'onClick' | 'tabIndex' | 'aria-selected'
> {
  'aria-selected'?: never;
  position: string | number;
  playerName: string;
  points: string | number;
  density?: RankingDensity;
  emphasis?: RankingEmphasis;
  secondaryInfo?: string;
  /** Marcador textual independente do destaque visual; omitir recolhe o espaço. */
  currentPlayer?: string;
  avatar?: Pick<AvatarProps, 'initials' | 'src' | 'content'>;
}
/** Linha passiva de tabela. Use dentro de Ranking ou de um tbody com cabeçalhos. */
export const RankingItem = forwardRef<HTMLTableRowElement, RankingItemProps>(function RankingItem(
  {
    position,
    playerName,
    points,
    density,
    emphasis = 'default',
    secondaryInfo,
    currentPlayer,
    avatar,
    className,
    ...props
  },
  ref,
) {
  const inheritedDensity = useContext(RankingDensityContext);
  const labels = useContext(RankingLabelsContext);
  const actualDensity = density ?? inheritedDensity;
  return (
    <tr
      {...props}
      role="row"
      ref={ref}
      className={[styles.item, className].filter(Boolean).join(' ')}
      data-ranking-item=""
      data-density={actualDensity}
      data-emphasis={emphasis}
    >
      <td className={styles.position} role="cell">
        <Typography variant="label-m">{position}</Typography>
      </td>
      <th scope="row" role="rowheader" className={styles.player}>
        <div className={styles.identity}>
          {avatar && (
            <span className={styles.avatar}>
              <Avatar {...avatar} size={actualDensity === 'compact' ? 'sm' : 'md'} decorative />
            </span>
          )}
          <div className={styles.details}>
            <Typography variant="label-m">{playerName}</Typography>
            {currentPlayer && (
              <Typography variant="label-s" tone="inherit" className={styles.current}>
                {currentPlayer}
              </Typography>
            )}
            {secondaryInfo && (
              <Typography variant="text-s" tone="secondary">
                {secondaryInfo}
              </Typography>
            )}
          </div>
        </div>
      </th>
      <td className={styles.points} role="cell">
        <Typography
          as="span"
          variant="label-s"
          tone="secondary"
          className={styles.mobileLabel}
          aria-hidden="true"
        >
          {labels.points}
        </Typography>
        <Typography variant="label-m">{points}</Typography>
      </td>
    </tr>
  );
});
