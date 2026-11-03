import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './Button';
import {
  FormExample,
  IconsExample,
  LongLabelExample,
  StatesExample,
  VariantsExample,
} from '../../../docs/examples/ButtonExamples';

const meta = {
  title: 'Componentes/Button',
  component: Button,
  args: {
    children: 'Inscrever-se',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    iconPosition: { control: 'inline-radio', options: ['left', 'right'] },
    icon: { control: false },
    children: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Ações com texto, com ou sem ícone. Quatro variantes, três tamanhos e estados nativos de interação.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    args.onClick?.mockClear();
    await userEvent.click(within(canvasElement).getByRole('button'));
    if (args.disabled || args.loading) await expect(args.onClick).not.toHaveBeenCalled();
    else await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const Variants: Story = { name: 'Variantes e tamanhos', render: () => <VariantsExample /> };
export const Icons: Story = {
  name: 'Ícone à esquerda ou à direita',
  render: (args) => <IconsExample loading={args.loading} />,
};
export const States: Story = { name: 'Disabled e loading', render: () => <StatesExample /> };
export const LongLabel: Story = { name: 'Texto longo', render: () => <LongLabelExample /> };
export const Form: Story = {
  name: 'Formulário e foco',
  render: () => <FormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Salvar time' });
    save.focus();
    await userEvent.keyboard('{Enter}');
    await expect(save).toHaveAttribute('aria-busy', 'true');
    await expect(save).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('status')).toHaveTextContent('1 envio(s).');
    await userEvent.click(canvas.getByRole('button', { name: 'Concluir operação' }));
    await expect(save).not.toHaveAttribute('aria-busy');
  },
};
