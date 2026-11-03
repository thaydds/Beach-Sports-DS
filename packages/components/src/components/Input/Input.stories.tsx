import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Input } from './Input';
import { ClearInput, InputSizes, InputStates } from '../../../docs/examples/FormExamples';

const meta = {
  title: 'Componentes/Input',
  component: Input,
  args: {
    'aria-label': 'Nome do jogador',
    placeholder: 'Nome do jogador',
    size: 'md',
    onChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    validation: { control: 'inline-radio', options: ['none', 'error'] },
    leadingIcon: { control: false },
    trailingAction: { control: false },
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Sizes: Story = { name: 'Tamanhos e slots', render: () => <InputSizes /> };
export const States: Story = { name: 'Estados e validação', render: () => <InputStates /> };
export const Interaction: Story = { name: 'Edição e ação final', render: () => <ClearInput /> };
