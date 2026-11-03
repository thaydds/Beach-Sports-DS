import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScoreMatch } from './ScoreMatch';
import {
  CompetitionComposition,
  MatchInteraction,
  MatchVariants,
  matchTeams,
} from '../../../docs/examples/CompetitionExamples';

const meta = {
  title: 'Componentes/ScoreMatch',
  component: ScoreMatch,
  args: {
    title: 'Partida #014',
    metadata: '01/11/2026 · Quadra 1 · set único',
    ...matchTeams,
    density: 'compact',
  },
  render: ({ state, winnerLabel, ...args }) => (
    <ScoreMatch
      {...args}
      {...(state === 'finished'
        ? { state, winnerLabel: winnerLabel ?? 'Time A · Vencedor' }
        : { state: 'live' })}
    />
  ),
  argTypes: {
    density: { control: 'inline-radio', options: ['compact', 'expanded'] },
    state: { control: 'inline-radio', options: ['live', 'finished'] },
    action: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ScoreMatch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = { name: 'Densidades e estados', render: () => <MatchVariants /> };
export const Interaction: Story = {
  name: 'Confirmação e ação independente',
  render: () => <MatchInteraction />,
};
export const Composition: Story = {
  name: 'Partida e classificação',
  render: () => <CompetitionComposition />,
};
export const LongContent: Story = {
  name: 'Nomes e metadados longos',
  args: {
    title: 'Partida #014 · campeonato de vôlei de praia da comunidade',
    metadata:
      '01/11/2026 · Quadra de vôlei da praia · partida em set único com dados confirmados pela organização',
    ...matchTeams,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '20.5rem' }}>
        <Story />
      </div>
    ),
  ],
};
