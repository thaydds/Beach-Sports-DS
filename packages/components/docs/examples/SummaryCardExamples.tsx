import { useState } from 'react';
import { PlayerCard, MatchCard, Typography } from '../../src/index';
import styles from './CardExamples.module.css';

export function SummaryCardVariants() {
  return (
    <div className={styles.stack}>
      {(['default', 'selected', 'disabled'] as const).map((state) => (
        <div className={styles.stack} key={state}>
          <PlayerCard
            name="Lana Souza"
            initials="LS"
            description="Nível 12 · 87% de vitórias"
            badge="V 12"
            selected={state === 'selected'}
            disabled={state === 'disabled'}
            onSelectedChange={() => {}}
          />
          <MatchCard
            title="Time A vs Time B"
            description="Hoje · 18:30 · Areia 2"
            badge="Agendada"
            selected={state === 'selected'}
            disabled={state === 'disabled'}
            onSelectedChange={() => {}}
          />
        </div>
      ))}
    </div>
  );
}

export function SummaryCardInteraction() {
  const [selected, setSelected] = useState(false);
  return (
    <div className={styles.stack}>
      <PlayerCard
        name="Lana Souza"
        initials="LS"
        description="Nível 12 · 87% de vitórias"
        badge="V 12"
        selected={selected}
        onSelectedChange={setSelected}
      />
      <Typography role="status">
        {selected ? 'Jogadora selecionada.' : 'Selecione a jogadora.'}
      </Typography>
    </div>
  );
}

export function SummaryCardLongContent() {
  return (
    <div className={styles.stack}>
      <PlayerCard
        name="Uma jogadora com um nome muito longo e identificadorsemqualquerespacoparavalidarquebradelinha"
        initials="LS"
        description="Informações da jogadora que precisam continuar legíveis em telas pequenas e com texto ampliado."
        badge="Vitórias acumuladas"
        onSelectedChange={() => {}}
      />
      <MatchCard
        title="Uma partida com os nomes completos das duas equipes da comunidade"
        description="Data, horário e localização da próxima partida."
        badge="Aguardando confirmação"
      />
    </div>
  );
}
