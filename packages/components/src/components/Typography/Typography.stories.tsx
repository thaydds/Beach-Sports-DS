import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography, type TypographyVariant } from './Typography';

const variants: TypographyVariant[] = [
  'display-l',
  'display-m',
  'heading-l',
  'heading-m',
  'text-l',
  'text-m',
  'text-s',
  'label-m',
  'label-s',
];
const meta = {
  title: 'Componentes/Typography',
  component: Typography,
  args: { children: 'Seu texto aqui', variant: 'text-m', tone: 'primary' },
  argTypes: {
    variant: { control: 'select', options: variants },
    tone: { control: 'select', options: ['primary', 'secondary', 'muted', 'inherit'] },
    as: { control: 'select', options: ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label'] },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Typography>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Scale: Story = {
  name: 'Nove estilos',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-24)' }}>
      {variants.map((variant) => (
        <Typography key={variant} variant={variant}>
          {variant} · Seu texto aqui
        </Typography>
      ))}
    </div>
  ),
};
export const Hierarchy: Story = {
  name: 'Hierarquia e cores',
  render: () => (
    <article style={{ display: 'grid', gap: 'var(--ds-space-16)' }}>
      <Typography variant="label-s" tone="secondary">
        BEACH SPORTS
      </Typography>
      <Typography as="h1" variant="display-l">
        A próxima partida começa aqui
      </Typography>
      <Typography variant="text-l">Reúna seu time e aproveite o jogo.</Typography>
      <Typography as="h2" variant="heading-l">
        Jogadores confirmados
      </Typography>
      <Typography tone="secondary">Confira os participantes antes de montar os times.</Typography>
      <Typography variant="text-s" tone="muted">
        Atualizado hoje
      </Typography>
    </article>
  ),
};
export const LongContent: Story = {
  name: 'Texto longo e refluxo',
  args: {
    variant: 'heading-l',
    children:
      'Jogadores confirmados para a próxima partida de vôlei de praia: organize as equipes e confira todas as informações antes de começar. identificadorsemqualquerespacoparaverificarquebradelinhasegura',
  },
};
export const FormLabel: Story = {
  name: 'Semântica de formulário',
  render: () => (
    <div>
      <Typography as="label" variant="label-m" htmlFor="player-name">
        Nome do jogador
      </Typography>
      <input id="player-name" />
    </div>
  ),
};
