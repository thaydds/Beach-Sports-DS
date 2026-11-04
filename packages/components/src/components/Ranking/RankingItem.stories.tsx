import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ranking } from './Ranking';
import { RankingItem } from './RankingItem';
import { RankingRowVariants } from '../../../docs/examples/CompetitionExamples';

const meta = {
  title: 'Componentes/RankingItem',
  component: RankingItem,
  args: { position: '1', playerName: 'André', points: '120', avatar: { initials: 'AN' } },
  render: (args) => (
    <Ranking title="RankingItem em uma tabela">
      <RankingItem {...args} />
    </Ranking>
  ),
  argTypes: {
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    emphasis: { control: 'inline-radio', options: ['default', 'highlighted'] },
    currentPlayer: { control: 'text' },
  },
} satisfies Meta<typeof RankingItem>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = {
  name: 'Densidade e destaque',
  render: () => <RankingRowVariants />,
};
