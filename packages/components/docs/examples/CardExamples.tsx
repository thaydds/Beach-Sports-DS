import { useState } from 'react';
import { Card, type CardProps } from '../../src/components/Card/Card';
import { Typography } from '../../src/components/Typography/Typography';
import { Button } from '../../src/components/Button/Button';
import { IconButton } from '../../src/components/IconButton/IconButton';
import styles from './CardExamples.module.css';

export function PlayersExample() {
  return (
    <>
      <ul className={styles.players} aria-label="Jogadores confirmados">
        {[
          ['AN', 'André'],
          ['IO', 'Iolanda'],
          ['GU', 'Gustavo'],
        ].map(([initials, name]) => (
          <li key={initials} className={styles.avatar} aria-label={name}>
            {initials}
          </li>
        ))}
      </ul>
      <Typography variant="text-s" tone="secondary">
        André, Iolanda e Gustavo · 3 confirmados
      </Typography>
    </>
  );
}
export function CardAction({ onClick }: { onClick?: () => void }) {
  return (
    <IconButton
      size="sm"
      variant="ghost"
      label="Mais ações dos jogadores confirmados"
      icon={<span className={styles.ellipsis} />}
      onClick={onClick}
    />
  );
}
export function CardSample(props: CardProps) {
  return (
    <Card
      title="Jogadores confirmados"
      description="Organize os participantes antes de montar os times."
      action={<CardAction />}
      footer={
        <>
          <Button size="sm">Confirmar</Button>
          <Button size="sm" variant="ghost">
            Cancelar
          </Button>
        </>
      }
      {...props}
    >
      <PlayersExample />
    </Card>
  );
}
export function CardVariants() {
  return (
    <div className={styles.grid}>
      {(['outlined', 'raised'] as const).flatMap((surface) =>
        (['compact', 'comfortable'] as const).map((density) => (
          <div key={surface + density}>
            <Typography variant="label-s">
              {surface} · {density}
            </Typography>
            <CardSample surface={surface} density={density} />
          </div>
        )),
      )}
    </div>
  );
}
export function CardOptionalRegions() {
  return (
    <div className={styles.stack}>
      <Card title="Somente título">Conteúdo do consumidor.</Card>
      <Card footer={<Button size="sm">Continuar</Button>}>Sem cabeçalho.</Card>
      <Card title="Sem descrição ou ação" />
      <Card>Somente conteúdo.</Card>
    </div>
  );
}
export function CardInteraction() {
  const [confirmed, setConfirmed] = useState(false);
  const [actions, setActions] = useState(0);
  return (
    <div className={styles.stack}>
      <Card
        as="article"
        title="Jogadores confirmados"
        description="Confira os nomes antes de confirmar."
        action={<CardAction onClick={() => setActions((value) => value + 1)} />}
        footer={
          <>
            <Button size="sm" onClick={() => setConfirmed(true)} disabled={confirmed}>
              Confirmar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmed(false)}>
              Cancelar
            </Button>
          </>
        }
      >
        <PlayersExample />
      </Card>
      <Typography role="status">
        {confirmed ? 'Jogadores confirmados.' : 'Aguardando confirmação.'} Ações: {actions}.
      </Typography>
    </div>
  );
}
