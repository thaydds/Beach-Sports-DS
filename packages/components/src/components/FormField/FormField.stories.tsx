import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FormField } from './FormField';
import { FieldStates, LongField, RegistrationCard } from '../../../docs/examples/FormExamples';

const meta = {
  title: 'Componentes/FormField',
  component: FormField,
  render: ({ validation, errorMessage, ...args }) => (
    <FormField
      {...args}
      {...(validation === 'error'
        ? { validation, errorMessage: errorMessage ?? 'Erro: este nome já está cadastrado.' }
        : { validation: 'none' })}
    />
  ),
  args: {
    label: 'Nome do jogador',
    helper: 'Use o nome pelo qual o jogador é conhecido.',
    placeholder: 'Nome do jogador',
    onChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    validation: { control: 'inline-radio', options: ['none', 'error'] },
    leadingIcon: { control: false },
    trailingAction: { control: false },
  },
} satisfies Meta<typeof FormField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const States: Story = {
  name: 'Tamanhos, mensagens e estados',
  render: () => <FieldStates />,
};
export const LongContent: Story = { name: 'Rótulo e mensagem longos', render: () => <LongField /> };
export const Composition: Story = { name: 'Cadastro com Card', render: () => <RegistrationCard /> };
