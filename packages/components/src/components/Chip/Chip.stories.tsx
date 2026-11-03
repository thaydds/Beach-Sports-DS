import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { Chip } from './Chip';
import {
  ChipVariants,
  ChipInteraction,
  ExampleGlyph,
  RosterComposition,
} from '../../../docs/examples/IdentityExamples';
const meta = {
  title: 'Componentes/Chip',
  component: Chip,
  args: {
    label: 'André',
    size: 'md',
    selected: false,
    disabled: false,
    onSelectedChange: fn(),
    icon: <ExampleGlyph name="chip-user-md" />,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    icon: { control: false },
    onRemove: { control: false },
  },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = { name: 'Tamanhos e estados', render: () => <ChipVariants /> };
export const Interaction: Story = {
  name: 'Selecionar e remover',
  render: () => <ChipInteraction />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'André' }));
    await expect(canvas.getByRole('button', { name: 'André' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};
export const LongLabel: Story = {
  name: 'Nome completo e quebra',
  args: {
    label: 'André Nunes de Albuquerque participante da próxima partida de vôlei',
    onRemove: fn(),
  },
};
export const Composition: Story = {
  name: 'Composição com Card',
  render: () => <RosterComposition />,
};
