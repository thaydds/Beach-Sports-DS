import { useRef, useState } from 'react';
import { Avatar, Badge, Chip, Card, Button, Typography, type BadgeTone } from '../../src/index';
import styles from './IdentityExamples.module.css';
export function ExampleGlyph({ name }: { name: string }) {
  return <span className={styles.glyph} data-glyph={name} />;
}
export function AvatarVariants() {
  return (
    <div className={styles.row}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div className={styles.row} key={size}>
          <Avatar name="André Nunes" initials="AN" size={size} />
          <Avatar name="Participante sem foto" content="fallback" size={size} />
        </div>
      ))}
    </div>
  );
}
export function AvatarPeople() {
  return (
    <div className={styles.stack}>
      {[
        ['AN', 'André Nunes'],
        ['IO', 'Iolanda Oliveira'],
        ['GU', 'Gustavo Souza'],
      ].map(([initials, name]) => (
        <div className={styles.person} key={name}>
          <Avatar size="md" initials={initials} decorative />
          <Typography>{name}</Typography>
        </div>
      ))}
    </div>
  );
}
const tones: BadgeTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];
const labels = ['Finalizada', 'Ao vivo', 'Vencedor', 'Aguardando', 'Cancelada'];
export function BadgeVariants() {
  return (
    <div className={styles.stack}>
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className={styles.row}>
          {tones.map((tone, i) => (
            <Badge
              key={tone}
              tone={tone}
              size={size}
              label={labels[i]!}
              icon={<ExampleGlyph name={`badge-${tone}-${size}`} />}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
export function ChipVariants() {
  return (
    <div className={styles.stack}>
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className={styles.row}>
          {['default', 'selected', 'disabled'].map((state) => (
            <Chip
              key={state}
              label="André"
              size={size}
              selected={state === 'selected'}
              disabled={state === 'disabled'}
              icon={<ExampleGlyph name={`chip-user-${size}`} />}
              onSelectedChange={() => {}}
              onRemove={() => {}}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
export function ChipInteraction() {
  const [selected, setSelected] = useState(false),
    [visible, setVisible] = useState(true);
  const restore = useRef<HTMLButtonElement>(null);
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        {visible && (
          <Chip
            label="André"
            size="md"
            selected={selected}
            icon={<ExampleGlyph name="chip-user-md" />}
            onSelectedChange={setSelected}
            onRemove={() => {
              setVisible(false);
              restore.current?.focus();
            }}
          />
        )}
        <Button
          ref={restore}
          variant="ghost"
          onClick={() => {
            setVisible(true);
            setSelected(false);
          }}
        >
          Restaurar
        </Button>
      </div>
      <Typography role="status">
        {visible ? (selected ? 'André selecionado.' : 'André não selecionado.') : 'André removido.'}
      </Typography>
    </div>
  );
}
export function RosterComposition() {
  const [selected, setSelected] = useState(false);
  return (
    <Card
      title="Participantes da próxima partida"
      description="Selecione quem vai jogar."
      footer={<Button size="sm">Confirmar equipe</Button>}
    >
      <div className={styles.person}>
        <Avatar size="md" initials="AN" decorative />
        <Typography>André Nunes</Typography>
        <Badge tone="success" label="Confirmado" />
      </div>
      <div className={styles.row}>
        <Chip label="André" selected={selected} onSelectedChange={setSelected} />
        <Badge tone="info" label="Inscrições abertas" />
      </div>
    </Card>
  );
}
