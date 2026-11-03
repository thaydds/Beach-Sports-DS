import { useEffect, useRef, useState } from 'react';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  FormField,
  Input,
  Typography,
} from '../../src/index';
import styles from './FormExamples.module.css';

export function InputGlyph({ action = false }: { action?: boolean }) {
  return <span className={action ? styles.ellipsis : styles.user} />;
}

export function InputSizes() {
  return (
    <div className={styles.stack}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <FormField
          key={size}
          label={`Nome do jogador · ${size}`}
          size={size}
          defaultValue="André"
          leadingIcon={<InputGlyph />}
          trailingAction={{
            icon: <InputGlyph action />,
            label: `Opções ${size}`,
            changesValue: false,
          }}
        />
      ))}
    </div>
  );
}

export function InputStates() {
  return (
    <div className={styles.stack}>
      <Input aria-label="Vazio" placeholder="Nome do jogador" />
      <Input aria-label="Preenchido" defaultValue="André" leadingIcon={<InputGlyph />} />
      <Input aria-label="Desabilitado" defaultValue="André" disabled leadingIcon={<InputGlyph />} />
      <Input aria-label="Somente leitura" defaultValue="André" readOnly />
      <Input aria-label="Inválido" defaultValue="André" validation="error" />
      <Input
        aria-label="Inválido somente leitura"
        defaultValue="André"
        readOnly
        validation="error"
      />
      <Input aria-label="Inválido desabilitado" defaultValue="André" disabled validation="error" />
    </div>
  );
}

export function ClearInput() {
  const [value, setValue] = useState('André');
  return (
    <div className={styles.stack}>
      <FormField
        label="Nome do jogador"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        leadingIcon={<InputGlyph />}
        trailingAction={{
          icon: <InputGlyph action />,
          label: 'Limpar nome',
          onClick: () => setValue(''),
        }}
      />
      <Typography variant="text-s" role="status">
        {value ? `Nome: ${value}` : 'Nome limpo'}
      </Typography>
    </div>
  );
}

export function FieldStates() {
  return (
    <div className={styles.stack}>
      <Typography variant="text-s">Campos com * são obrigatórios.</Typography>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <FormField
          key={size}
          size={size}
          label={`Nome · ${size}`}
          placeholder="Nome do jogador"
          helper="Use o nome pelo qual o jogador é conhecido."
          required
          leadingIcon={<InputGlyph />}
        />
      ))}
      <FormField
        label="Nome indisponível"
        defaultValue="André"
        helper="Ajuda que será substituída"
        validation="error"
        errorMessage="Erro: este nome já está cadastrado."
        required
        leadingIcon={<InputGlyph />}
      />
      <FormField
        label="Nome em leitura"
        readOnly
        defaultValue="André"
        helper="Leitura e cópia disponíveis."
      />
      <FormField
        label="Nome desabilitado"
        disabled
        defaultValue="André"
        helper="O rótulo e a ajuda continuam legíveis."
      />
      <FormField
        label="Erro em leitura"
        readOnly
        defaultValue="André"
        validation="error"
        errorMessage="Revise os dados na origem."
      />
      <FormField
        label="Erro desabilitado"
        disabled
        defaultValue="André"
        validation="error"
        errorMessage="Este cadastro está indisponível."
      />
    </div>
  );
}

export function LongField() {
  return (
    <div className={styles.narrow}>
      <FormField
        required
        label="Nome completo do jogador responsável pela equipe do campeonato de vôlei de praia"
        defaultValue="André Nunes de Albuquerque e todos os participantes convidados para a próxima partida"
        validation="error"
        errorMessage="Erro: informe um nome diferente para identificar este jogador na lista de participantes do campeonato."
        leadingIcon={<InputGlyph />}
        trailingAction={{
          icon: <InputGlyph action />,
          label: 'Mais informações',
          changesValue: false,
        }}
      />
    </div>
  );
}

export function CheckboxVariants() {
  return (
    <div className={styles.stack}>
      {(['sm', 'md'] as const).flatMap((size) =>
        [false, true].flatMap((disabled) =>
          ['unchecked', 'checked', 'mixed'].map((value) => (
            <Checkbox
              key={`${size}-${disabled}-${value}`}
              size={size}
              disabled={disabled}
              defaultChecked={value === 'checked'}
              indeterminate={value === 'mixed'}
              label={`${size} · ${value}${disabled ? ' · desabilitado' : ''}`}
            />
          )),
        ),
      )}
    </div>
  );
}

export function PlayerSelection() {
  const [selected, setSelected] = useState(['André', 'Iolanda']);
  const players = ['André', 'Iolanda', 'Gustavo'];
  return (
    <fieldset className={styles.group}>
      <legend>
        <Typography as="span" variant="heading-m">
          Jogadores convocados
        </Typography>
      </legend>
      <Checkbox
        label="Selecionar todos"
        checked={selected.length === players.length}
        indeterminate={selected.length > 0 && selected.length < players.length}
        onChange={(e) => setSelected(e.target.checked ? players : [])}
      />
      {players.map((name) => (
        <Checkbox
          key={name}
          label={name}
          name="players"
          value={name}
          checked={selected.includes(name)}
          onChange={(e) =>
            setSelected(
              e.target.checked ? [...selected, name] : selected.filter((player) => player !== name),
            )
          }
        />
      ))}
      <Typography variant="text-s" role="status">
        {selected.length} jogadores selecionados
      </Typography>
    </fieldset>
  );
}

export function RegistrationCard() {
  const [name, setName] = useState('');
  const [registered, setRegistered] = useState('');
  const [error, setError] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (error) nameRef.current?.focus();
  }, [error]);
  return (
    <Card
      as="section"
      title="Adicionar jogador"
      description="Cadastre os dados para a próxima partida."
    >
      <form
        className={styles.stack}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) {
            setError(true);
            return;
          }
          setError(false);
          setRegistered(name.trim());
        }}
      >
        <Typography variant="text-s">Campos com * são obrigatórios.</Typography>
        <FormField
          label="Nome do jogador"
          ref={nameRef}
          name="player"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          helper="Use o nome pelo qual o jogador é conhecido."
          leadingIcon={<InputGlyph />}
          {...(error
            ? { validation: 'error' as const, errorMessage: 'Erro: informe o nome do jogador.' }
            : { validation: 'none' as const })}
        />
        <FormField label="Apelido" name="nickname" placeholder="Como prefere ser chamado?" />
        <Checkbox label="Confirmar presença na próxima partida" name="confirmed" defaultChecked />
        <Button type="submit">Adicionar jogador</Button>
        <Typography role="status" variant="text-s">
          {registered ? `${registered} adicionado.` : 'Preencha o cadastro.'}
        </Typography>
        {registered && (
          <div className={styles.person}>
            <Avatar decorative initials={registered.slice(0, 2)} />
            <Typography>{registered}</Typography>
            <Badge label="Confirmado" tone="success" />
          </div>
        )}
      </form>
    </Card>
  );
}
