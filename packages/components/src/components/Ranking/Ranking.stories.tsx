import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ranking } from './Ranking';
import { RankingItem } from './RankingItem';
import {
  CompetitionComposition,
  LongRanking,
  RankingCollection,
  RankingOptionalRegions,
  RankingVariants,
  rankingPlayers,
} from '../../../docs/examples/CompetitionExamples';

const meta = {
  title: 'Componentes/Ranking',
  component: Ranking,
  args: {
    title: 'Ranking de jogadores',
    description: 'Classificação da comunidade · pontos acumulados',
    density: 'compact',
    children: rankingPlayers.map(({ id, initials, ...player }) => (
      <RankingItem
        key={id}
        {...player}
        avatar={{ initials }}
        currentPlayer={id === 'iolanda' ? 'Você' : undefined}
        emphasis={id === 'iolanda' ? 'highlighted' : 'default'}
      />
    )),
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    children: { control: false },
    columnLabels: { control: 'object' },
  },
} satisfies Meta<typeof Ranking>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Densities: Story = { name: 'Duas densidades', render: () => <RankingVariants /> };
export const OptionalRegions: Story = {
  name: 'Regiões opcionais e empate',
  render: () => <RankingOptionalRegions />,
};
export const LongContent: Story = { name: 'Texto longo e refluxo', render: () => <LongRanking /> };
export const Collection: Story = {
  name: 'Quantidade variável de jogadores',
  render: () => <RankingCollection />,
};
export const Composition: Story = {
  name: 'Classificação e partida',
  render: () => <CompetitionComposition />,
};
