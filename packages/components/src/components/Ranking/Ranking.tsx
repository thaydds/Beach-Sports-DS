import { forwardRef, useId, type ReactNode } from 'react';
import { Card, type CardProps } from '../Card/Card';
import { Typography } from '../Typography/Typography';
import { RankingDensityContext, RankingLabelsContext, type RankingDensity } from './RankingContext';
import styles from './Ranking.module.css';

export type RankingProps = Omit<
  CardProps,
  'title' | 'description' | 'children' | 'footer' | 'action' | 'surface' | 'density'
> & {
  title: string;
  description?: string;
  density?: RankingDensity;
  /** Slot variável de RankingItem; ordem, posições e pontuações pertencem ao produto. */
  children: ReactNode;
  columnLabels?: { position: string; player: string; points: string };
};
export const Ranking = forwardRef<HTMLElement, RankingProps>(function Ranking(
  {
    title,
    description,
    density = 'compact',
    children,
    columnLabels = { position: 'Posição', player: 'Jogador', points: 'Pontos' },
    as = 'section',
    titleAs = 'h2',
    className,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    ...props
  },
  ref,
) {
  const titleId = useId();
  return (
    <Card
      {...props}
      as={as}
      ref={ref}
      density={density}
      className={[styles.panel, className].filter(Boolean).join(' ')}
      data-ranking=""
      aria-label={label}
      aria-labelledby={labelledBy ?? (label ? undefined : titleId)}
    >
      <div className={styles.region}>
        <RankingDensityContext.Provider value={density}>
          <RankingLabelsContext.Provider value={columnLabels}>
            <table className={styles.table}>
              <caption className={styles.caption}>
                <Typography as={titleAs} variant="heading-l" id={titleId}>
                  {title}
                </Typography>
                {description && <Typography tone="secondary">{description}</Typography>}
              </caption>
              <colgroup>
                <col className={styles.edgeColumn} />
                <col />
                <col className={styles.edgeColumn} />
              </colgroup>
              <thead role="rowgroup">
                <tr role="row">
                  <th scope="col" className={styles.positionHeader}>
                    <Typography as="span" variant="label-s" tone="secondary">
                      {columnLabels.position}
                    </Typography>
                  </th>
                  <th scope="col" className={styles.playerHeader}>
                    <Typography as="span" variant="label-s" tone="secondary">
                      {columnLabels.player}
                    </Typography>
                  </th>
                  <th scope="col" className={styles.pointsHeader}>
                    <Typography as="span" variant="label-s" tone="secondary">
                      {columnLabels.points}
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup">{children}</tbody>
            </table>
          </RankingLabelsContext.Provider>
        </RankingDensityContext.Provider>
      </div>
    </Card>
  );
});
