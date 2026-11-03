import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Checkbox } from './Checkbox';
import { CheckboxVariants, PlayerSelection } from '../../../docs/examples/FormExamples';

const meta = {
  title: 'Componentes/Checkbox',
  component: Checkbox,
  args: { label: 'André', size: 'md', defaultChecked: false, onChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    showLabel: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = {
  name: 'Valores, tamanhos e disabled',
  render: () => <CheckboxVariants />,
};
export const Selection: Story = {
  name: 'Seleção parcial de jogadores',
  render: () => <PlayerSelection />,
};
export const WithoutLabel: Story = {
  name: 'Sem rótulo visual',
  args: { label: 'Selecionar André', showLabel: false, indeterminate: true },
};
export const LongLabel: Story = {
  name: 'Texto multilinha',
  args: {
    label:
      'Confirmar minha participação em todas as partidas do campeonato de vôlei de praia com minha equipe',
    defaultChecked: true,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '20rem' }}>
        <Story />
      </div>
    ),
  ],
};
