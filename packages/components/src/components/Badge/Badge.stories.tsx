import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { BadgeVariants, RosterComposition } from '../../../docs/examples/IdentityExamples';
const meta = {
  title: 'Componentes/Badge',
  component: Badge,
  args: { label: 'Finalizada', size: 'sm', tone: 'neutral' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    tone: { control: 'select', options: ['neutral', 'info', 'success', 'warning', 'danger'] },
    label: { control: 'text' },
    icon: { control: false },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = { name: 'Tons e tamanhos', render: () => <BadgeVariants /> };
export const LongLabel: Story = {
  name: 'Texto longo',
  args: { label: 'Aguardando a confirmação dos jogadores da próxima partida', tone: 'warning' },
};
export const Composition: Story = {
  name: 'Composição com Card',
  render: () => <RosterComposition />,
};
