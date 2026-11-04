import { createRef } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import { Ranking } from './Ranking';
import { RankingItem } from './RankingItem';
import { RankingCollection, RankingExample } from '../../../docs/examples/CompetitionExamples';

describe('Ranking', () => {
  it('uses native caption, column and row headers instead of unrelated text columns', () => {
    render(
      <Ranking title="Ranking da comunidade" description="Pontos acumulados">
        <RankingItem position="2" playerName="André" points="120" />
      </Ranking>,
    );
    const table = screen.getByRole('table', { name: /Ranking da comunidade/ });
    expect(table.querySelector('caption')).toHaveTextContent('Pontos acumulados');
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((e) => e.textContent),
    ).toEqual(['Posição', 'Jogador', 'Pontos']);
    expect(screen.getByRole('rowheader', { name: 'André' })).toHaveAttribute('scope', 'row');
    expect(screen.getByRole('region', { name: 'Ranking da comunidade' })).toHaveAttribute(
      'aria-labelledby',
      screen.getByRole('heading').id,
    );
  });
  it('preserves supplied order, repeated positions, zero values and independent players', () => {
    const { container } = render(
      <Ranking title="Empate">
        <RankingItem position="2" playerName="Iolanda" points="110" />
        <RankingItem position="2" playerName="André" points="110" />
        <RankingItem position="9" playerName="Gustavo" points={0} />
      </Ranking>,
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(
      [...rows].map((row) =>
        [...row.querySelectorAll('td > p, th p')].map((p) => p.textContent).join(''),
      ),
    ).toEqual(['2Iolanda110', '2André110', '9Gustavo0']);
  });
  it('propagates density through the variable slot and allows an explicit row density', () => {
    const { container, rerender } = render(
      <Ranking title="Ranking" density="comfortable">
        <RankingItem position="1" playerName="André" points="120" avatar={{ initials: 'AN' }} />
        <RankingItem position="2" playerName="Iolanda" points="110" density="compact" />
      </Ranking>,
    );
    expect(container.querySelector('[data-avatar]')).toHaveAttribute('data-size', 'md');
    expect(container.querySelectorAll('[data-ranking-item]')[1]).toHaveAttribute(
      'data-density',
      'compact',
    );
    rerender(
      <Ranking title="Ranking" density="compact">
        <RankingItem position="1" playerName="André" points="120" avatar={{ initials: 'AN' }} />
      </Ranking>,
    );
    expect(container.querySelector('[data-avatar]')).toHaveAttribute('data-size', 'sm');
  });
  it('keeps visual emphasis and current-player text independent without selection semantics', () => {
    render(
      <Ranking title="Ranking">
        <RankingItem position="1" playerName="André" points="120" currentPlayer="Você" />
        <RankingItem position="2" playerName="Iolanda" points="110" emphasis="highlighted" />
      </Ranking>,
    );
    expect(screen.getByRole('rowheader', { name: 'André Você' }).closest('tr')).toHaveAttribute(
      'data-emphasis',
      'default',
    );
    const highlighted = screen.getByRole('rowheader', { name: 'Iolanda' }).closest('tr');
    expect(highlighted).toHaveAttribute('data-emphasis', 'highlighted');
    expect(highlighted).not.toHaveAttribute('aria-selected');
    expect(highlighted).not.toHaveAttribute('tabindex');
    expect(screen.getAllByText('Você')).toHaveLength(1);
  });
  it('omits optional identity and secondary rows without replacing the player name', () => {
    const { container } = render(
      <Ranking title="Ranking">
        <RankingItem position="1" playerName="André" points="120" />
      </Ranking>,
    );
    expect(screen.getByRole('rowheader')).toHaveTextContent(/^André$/);
    expect(container.querySelector('[data-avatar]')).not.toBeInTheDocument();
    expect(screen.queryByText('Você')).not.toBeInTheDocument();
  });
  it('forwards panel and native table-row refs, attributes and editable column labels', () => {
    const panel = createRef<HTMLElement>();
    const row = createRef<HTMLTableRowElement>();
    render(
      <Ranking
        title="Classificação"
        ref={panel}
        columnLabels={{ position: 'Colocação', player: 'Participante', points: 'Pontuação' }}
      >
        <RankingItem ref={row} id="andre" position="1" playerName="André" points="120" />
      </Ranking>,
    );
    expect(panel.current).toBe(screen.getByRole('region'));
    expect(row.current).toHaveAttribute('id', 'andre');
    expect(row.current?.tagName).toBe('TR');
    expect(screen.getByRole('columnheader', { name: 'Pontuação' })).toBeInTheDocument();
  });
  it('supports zero and variable counts without manufacturing rows', () => {
    const { container, unmount } = render(<Ranking title="Sem classificação">{[]}</Ranking>);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(0);
    unmount();
    render(<RankingCollection />);
    expect(screen.getAllByRole('rowheader')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar 5 jogadores' }));
    expect(screen.getAllByRole('rowheader')).toHaveLength(5);
    expect(screen.getByRole('status')).toHaveTextContent('5 jogadores');
  });
  it('reuses public Avatar and Typography with accessible highlighted content', async () => {
    const { container } = render(<RankingExample density="comfortable" />);
    expect(container.querySelectorAll('[data-avatar]')).toHaveLength(5);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('[data-variant="heading-l"]')).toBeInTheDocument();
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
function typeContracts() {
  // @ts-expect-error Position belongs to supplied domain data.
  const position = <RankingItem playerName="André" points="120" />;
  // @ts-expect-error Informational emphasis is not interactive selection.
  const selected = <RankingItem position="1" playerName="André" points="120" aria-selected />;
  // @ts-expect-error Rows are passive, not clickable containers.
  const click = <RankingItem position="1" playerName="André" points="120" onClick={() => {}} />;
  return [position, selected, click];
}
void typeContracts;
