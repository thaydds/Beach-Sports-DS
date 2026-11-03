import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconButton } from './IconButton';
import { ExampleIcon, StatesExample, VariantsExample } from '../../../docs/examples/ButtonExamples';

const meta = {
  title: 'Componentes/IconButton',
  component: IconButton,
  args: {
    icon: <ExampleIcon />,
    label: 'Continuar',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Ações compactas com ícone e nome acessível obrigatório. O alvo é de 44, 48 ou 56 px.',
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    args.onClick?.mockClear();
    const button = within(canvasElement).getByRole('button', { name: 'Continuar' });
    button.focus();
    await userEvent.keyboard(' ');
    if (args.disabled || args.loading) await expect(args.onClick).not.toHaveBeenCalled();
    else await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const Variants: Story = {
  name: 'Variantes e tamanhos',
  render: () => <VariantsExample iconOnly />,
};
export const States: Story = {
  name: 'Disabled e loading',
  render: () => <StatesExample iconOnly />,
};
