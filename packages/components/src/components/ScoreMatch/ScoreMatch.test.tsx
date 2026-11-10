import { createRef } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { ScoreMatch } from './ScoreMatch';
import { Input } from '../Input/Input';
import { matchTeams, MatchInteraction } from '../../../docs/examples/CompetitionExamples';

const base = {
  title: 'Partida #014',
  metadata: '01/11/2026 · Quadra 1 · set único',
  ...matchTeams,
};
describe('ScoreMatch', () => {
  it('associates the passive panel with the heading and forwards the root ref', () => {
    const ref = createRef<HTMLElement>();
    render(<ScoreMatch {...base} ref={ref} titleAs="h3" id="match" />);
    const panel = screen.getByRole('article', { name: 'Partida #014' });
    expect(ref.current).toBe(panel);
    expect(panel).toHaveAttribute('id', 'match');
    expect(panel).toHaveAttribute('aria-labelledby', screen.getByRole('heading', { level: 3 }).id);
    expect(panel).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it.each(['compact', 'expanded'] as const)(
    'preserves every authoritative field in %s',
    (density) => {
      const { container } = render(<ScoreMatch {...base} density={density} />);
      for (const value of [
        base.metadata,
        base.teamA.name,
        base.teamB.name,
        base.teamA.score,
        base.teamB.score,
        base.teamA.players,
        base.teamB.players,
      ])
        expect(screen.getByText(value)).toBeInTheDocument();
      expect(container.querySelectorAll('[data-slot="team"]')).toHaveLength(2);
      expect(container.querySelectorAll('[data-avatar]')).toHaveLength(
        density === 'expanded' ? 2 : 0,
      );
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    },
  );
  it('does not infer a winner even when the displayed score looks final', () => {
    const { container } = render(<ScoreMatch {...base} />);
    expect(screen.getByText('Ao vivo').closest('[data-badge]')).toHaveAttribute(
      'data-tone',
      'info',
    );
    expect(screen.queryByText(/Vencedor/)).not.toBeInTheDocument();
    expect(container.querySelector('[aria-live]')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it('renders only the explicitly confirmed result, not a computed winner or classification', () => {
    render(
      <ScoreMatch
        {...base}
        state="finished"
        winnerLabel="Time B · Vencedor confirmado"
        position="3º · Time B"
      />,
    );
    expect(screen.getByText('Finalizada').closest('[data-badge]')).toHaveAttribute(
      'data-tone',
      'success',
    );
    expect(
      screen.getByText('Time B · Vencedor confirmado').closest('[data-badge]'),
    ).toHaveAttribute('data-size', 'md');
    expect(screen.getByText('3º · Time B')).toBeInTheDocument();
    expect(screen.queryByText(/Placar provisório/)).not.toBeInTheDocument();
  });
  it('keeps action and extra content independent and uses the real IconButton', () => {
    const action = vi.fn();
    const confirm = vi.fn();
    render(
      <ScoreMatch {...base} action={{ label: 'Mais ações da partida #014', onClick: action }}>
        <button onClick={confirm}>Confirmação externa</button>
      </ScoreMatch>,
    );
    const more = screen.getByRole('button', { name: 'Mais ações da partida #014' });
    expect(more).toHaveAttribute('data-size', 'sm');
    expect(more).toHaveAttribute('type', 'button');
    fireEvent.click(more);
    expect(action).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmação externa' }));
    expect(confirm).toHaveBeenCalledOnce();
  });
  it('preserves zero scores, custom metadata and omission of optional regions', () => {
    const { container } = render(
      <ScoreMatch
        {...base}
        teamA={{ name: 'Zero', score: 0, players: 'Um jogador' }}
        description=""
      />,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-badge]')).toHaveLength(1);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('updates the documented flow through consumer-controlled confirmation and status', () => {
    render(<MatchInteraction />);
    fireEvent.click(screen.getByRole('button', { name: 'Mais ações da partida #014' }));
    expect(screen.getByRole('status')).toHaveTextContent('Ações: 1.');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar resultado' }));
    expect(screen.getByText('Finalizada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar resultado' })).toBeDisabled();
    expect(within(screen.getByRole('article')).getByText('Time A · Vencedor')).toBeInTheDocument();
  });
  it('has accessible match composition', async () => {
    const { container } = render(
      <ScoreMatch {...base} state="finished" winnerLabel="Time A · Vencedor" />,
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
function typeContracts() {
  // @ts-expect-error Finished requires an authoritative result.
  const result = <ScoreMatch {...base} state="finished" />;
  // @ts-expect-error Live must not expose a winner.
  const live = <ScoreMatch {...base} state="live" winnerLabel="Time A" />;
  // @ts-expect-error Action needs its accessible name.
  const action = <ScoreMatch {...base} action={{ onClick: () => {} }} />;
  // @ts-expect-error The passive panel is not clickable.
  const click = <ScoreMatch {...base} onClick={() => {}} />;
  return [result, live, action, click];
}
void typeContracts;

describe('Score content slot', () => {
  it.each(['compact', 'expanded'] as const)(
    'preserves names, participants and native fields in %s; finish removes inputs',
    (density) => {
      const { rerender } = render(
        <ScoreMatch
          {...base}
          density={density}
          statusLabel="Em andamento"
          scoreContent={{
            A: <Input aria-label="Placar A" defaultValue="21" />,
            B: <Input aria-label="Placar B" defaultValue="18" />,
          }}
        />,
      );
      expect(screen.getByRole('textbox', { name: 'Placar A' })).toHaveValue('21');
      expect(screen.getByRole('textbox', { name: 'Placar B' })).toHaveValue('18');
      expect(screen.getByText(base.teamA.players)).toBeVisible();
      expect(screen.getByText(base.teamB.name)).toBeVisible();
      expect(screen.getByText('Em andamento')).toBeVisible();
      rerender(
        <ScoreMatch {...base} density={density} state="finished" winnerLabel="Time A · Vencedor" />,
      );
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText(String(base.teamA.score))).toBeVisible();
    },
  );
});
