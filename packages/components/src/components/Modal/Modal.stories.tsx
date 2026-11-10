import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { FormField } from '../FormField/FormField';
import { Loading } from '../Loading/Loading';
import { Typography } from '../Typography/Typography';
import { Modal } from './Modal';
import { fn } from 'storybook/test';

const meta = {
  title: 'Componentes/Modal',
  component: Modal,
  args: {
    open: true,
    onClose: fn(),
    title: 'Salvar partida?',
    description: 'Os times e o resultado ficarão disponíveis em todos os dispositivos.',
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composição genérica com Content (children) e Actions. Busy protege a operação; Error é conteúdo da aplicação, sem acoplar a uma API. Abertura controlada e foco nativo.',
      },
    },
  },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

function Example({
  mode = 'default',
  ...props
}: {
  title?: Exclude<React.ReactNode, boolean | null | undefined>;
  description?: React.ReactNode;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
  mode?: 'default' | 'saving' | 'error' | 'long';
}) {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(mode === 'saving');
  const [error, setError] = useState(mode === 'error');
  const [name, setName] = useState('Partida de terça');
  const [attempts, setAttempts] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  // No network request: these are controlled examples of an asynchronous operation.
  const save = () => {
    if (busy || timer.current) return;
    setBusy(true);
    setError(false);
    setAttempts((n) => n + 1);
    timer.current = setTimeout(() => {
      setBusy(false);
      setError(true);
      timer.current = null;
    }, 800);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <Typography>Envios: {attempts}</Typography>
      <Modal
        {...props}
        open={open}
        busy={busy}
        title={props.title ?? 'Salvar partida?'}
        label={undefined}
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button loading={busy} onClick={save}>
              {error ? 'Tentar novamente' : 'Salvar partida'}
            </Button>
          </>
        }
      >
        {busy ? <Loading size="md" label="Salvando partida" /> : null}
        <FormField
          label="Nome da partida"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {error && (
          <Typography role="alert" variant="text-s">
            Não foi possível salvar. Seus dados foram mantidos.
          </Typography>
        )}
        {mode === 'long' &&
          Array.from({ length: 30 }, (_, i) => (
            <Typography key={i}>Participante {i + 1}: informações preservadas.</Typography>
          ))}
      </Modal>
    </>
  );
}
export const Playground: Story = { render: (args) => <Example {...args} /> };
export const Saving: Story = { render: (args) => <Example {...args} mode="saving" /> };
export const Error: Story = { render: (args) => <Example {...args} mode="error" /> };
export const LongContent: Story = { render: (args) => <Example {...args} mode="long" /> };
export const Dark: Story = { ...Playground, globals: { theme: 'dark' } };
export const WithoutTitle: Story = {
  render: function WithoutTitleExample() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        <Modal
          open={open}
          label="Detalhes da partida"
          onClose={() => setOpen(false)}
          actions={<Button onClick={() => setOpen(false)}>Fechar</Button>}
        >
          <Typography>Conteúdo configurável, sem título ou descrição visuais.</Typography>
        </Modal>
      </>
    );
  },
};
