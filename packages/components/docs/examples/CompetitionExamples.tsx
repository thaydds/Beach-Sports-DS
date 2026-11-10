import { useState } from 'react';
import {
  Button,
  Card,
  Ranking,
  RankingItem,
  ScoreMatch,
  Typography,
  type RankingDensity,
  type ScoreMatchProps,
} from '../../src/index';
import styles from './CompetitionExamples.module.css';

/** Dados de exemplo fornecidos pelos masters do Figma; sem cálculo de resultados. */
export const matchTeams = {
  teamA: {
    name: 'Time A',
    score: '25',
    players: 'André, Andressa, Arrana, Erick, Gustavo e Iolanda',
    avatar: { initials: 'AN' },
  },
  teamB: {
    name: 'Time B',
    score: '21',
    players: 'Lana, LL, Richard, Sabrina, Thay e Tigrinho',
    avatar: { initials: 'LA' },
  },
};
export function MatchExample(props: Partial<ScoreMatchProps>) {
  // Partial is only for the fixture wrapper. Final production props preserve the state contract.
  const { state = 'live', winnerLabel, density, scoreContent, ...rest } = props;
  return (
    <ScoreMatch
      title="Partida #014"
      metadata="01/11/2026 · Quadra 1 · set único"
      {...matchTeams}
      density={density}
      {...rest}
      {...(state === 'finished'
        ? { state, winnerLabel: winnerLabel ?? 'Time A · Vencedor' }
        : { state, scoreContent })}
    />
  );
}
export function MatchVariants() {
  return (
    <div className={styles.grid}>
      {(['compact', 'expanded'] as const).flatMap((density) =>
        (['live', 'finished'] as const).map((state) => (
          <MatchExample
            key={density + state}
            density={density}
            state={state}
            teamA={{ ...matchTeams.teamA, score: state === 'live' ? '18' : '25' }}
            teamB={{ ...matchTeams.teamB, score: state === 'live' ? '16' : '21' }}
            action={{ label: 'Mais ações da partida #014' }}
          >
            <Typography variant="text-s" tone="secondary">
              {state === 'live'
                ? 'A confirmação do resultado define o encerramento.'
                : 'Resultado confirmado pela organização.'}
            </Typography>
          </MatchExample>
        )),
      )}
    </div>
  );
}
export function MatchInteraction() {
  const [confirmed, setConfirmed] = useState(false);
  const [actions, setActions] = useState(0);
  return (
    <div className={styles.stack}>
      <MatchExample
        density="expanded"
        state={confirmed ? 'finished' : 'live'}
        action={{
          label: 'Mais ações da partida #014',
          onClick: () => setActions((value) => value + 1),
        }}
      >
        <Button size="sm" onClick={() => setConfirmed(true)} disabled={confirmed}>
          Confirmar resultado
        </Button>
      </MatchExample>
      <Typography role="status" variant="text-s">
        {confirmed
          ? 'Resultado confirmado: Time A, 25; Time B, 21. Vencedor: Time A.'
          : 'Resultado ainda não confirmado.'}{' '}
        Ações: {actions}.
      </Typography>
    </div>
  );
}
export const rankingPlayers = [
  { id: 'andre', position: '1', playerName: 'André', points: '120', initials: 'AN' },
  { id: 'iolanda', position: '2', playerName: 'Iolanda', points: '110', initials: 'IO' },
  { id: 'gustavo', position: '3', playerName: 'Gustavo', points: '98', initials: 'GU' },
  { id: 'lana', position: '4', playerName: 'Lana', points: '86', initials: 'LA' },
  { id: 'sabrina', position: '5', playerName: 'Sabrina', points: '80', initials: 'SA' },
];
export function RankingExample({
  density = 'compact',
  avatars = true,
  title = 'Ranking de jogadores',
}: {
  density?: RankingDensity;
  avatars?: boolean;
  title?: string;
}) {
  return (
    <Ranking
      title={title}
      description="Classificação da comunidade · pontos acumulados"
      density={density}
    >
      {rankingPlayers.map(({ id, initials, ...player }) => (
        <RankingItem
          key={id}
          {...player}
          avatar={avatars ? { initials } : undefined}
          emphasis={id === 'iolanda' ? 'highlighted' : 'default'}
          currentPlayer={id === 'iolanda' ? 'Você' : undefined}
          secondaryInfo={density === 'comfortable' ? 'Participante da comunidade' : undefined}
        />
      ))}
    </Ranking>
  );
}
export function RankingVariants() {
  return (
    <div className={styles.grid}>
      <RankingExample title="Ranking compacto" />
      <RankingExample title="Ranking confortável" density="comfortable" />
    </div>
  );
}
export function RankingRowVariants() {
  return (
    <div className={styles.stack}>
      {(['compact', 'comfortable'] as const).map((density) => (
        <Ranking key={density} title={`RankingItem · ${density}`} density={density}>
          <RankingItem position="1" playerName="André" points="120" avatar={{ initials: 'AN' }} />
          <RankingItem
            position="2"
            playerName="Iolanda"
            points="110"
            avatar={{ initials: 'IO' }}
            emphasis="highlighted"
            currentPlayer="Você"
          />
        </Ranking>
      ))}
    </div>
  );
}
export function RankingOptionalRegions() {
  return (
    <Ranking title="Identidade e destaque independentes">
      <RankingItem position="1" playerName="André" points="120" />
      <RankingItem position="2" playerName="Iolanda" points="110" currentPlayer="Você" />
      <RankingItem position="2" playerName="Gustavo" points="110" emphasis="highlighted" />
      <RankingItem position="4" playerName="Lana" points="86" secondaryInfo="Informação de apoio" />
    </Ranking>
  );
}
export function LongRanking() {
  return (
    <div className={styles.narrow}>
      <Ranking
        title="Classificação dos participantes da comunidade de vôlei de praia"
        description="Dados de exemplo: posições e pontos fornecidos pelo produto."
      >
        <RankingItem
          position="1"
          playerName="André Nunes de Albuquerque"
          points="120"
          avatar={{ initials: 'AN' }}
        />
        <RankingItem
          position="2"
          playerName="Iolanda Ferreira da Costa"
          points="110"
          emphasis="highlighted"
          currentPlayer="Você"
          secondaryInfo="Participante da comunidade de vôlei de praia"
          avatar={{ initials: 'IO' }}
        />
        <RankingItem position="2" playerName="Gustavo dos Santos" points="110" />
      </Ranking>
    </div>
  );
}
export function RankingCollection() {
  const [extra, setExtra] = useState(false);
  return (
    <div className={styles.stack}>
      <Button variant="secondary" onClick={() => setExtra((value) => !value)}>
        {extra ? 'Mostrar 3 jogadores' : 'Mostrar 5 jogadores'}
      </Button>
      <Ranking title="Ranking de jogadores" description="Quantidade variável; ordem preservada.">
        {rankingPlayers.slice(0, extra ? 5 : 3).map(({ id, initials, ...player }) => (
          <RankingItem key={id} {...player} avatar={{ initials }} />
        ))}
      </Ranking>
      <Typography role="status" variant="text-s">
        {extra ? 5 : 3} jogadores na classificação.
      </Typography>
    </div>
  );
}
export function CompetitionComposition() {
  return (
    <div className={styles.grid}>
      <MatchExample
        state="finished"
        density="expanded"
        position="1º · Time A"
        action={{ label: 'Mais ações da partida #014' }}
      >
        <Typography variant="text-s" tone="secondary">
          Resultado confirmado pela organização.
        </Typography>
      </MatchExample>
      <RankingExample />
    </div>
  );
}
export function CardCompetition() {
  return (
    <Card
      title="Resultados da rodada"
      description="Placar da partida e classificação individual são dados diferentes."
    >
      <CompetitionComposition />
    </Card>
  );
}
