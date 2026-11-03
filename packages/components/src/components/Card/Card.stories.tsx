import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Card } from './Card';
import {
  CardAction,
  CardInteraction,
  CardOptionalRegions,
  CardSample,
  CardVariants,
  PlayersExample,
} from '../../../docs/examples/CardExamples';
import { Button } from '../Button/Button';
const meta = {
  title: 'Componentes/Card',
  component: Card,
  args: {
    title: 'Jogadores confirmados',
    description: 'Organize os participantes antes de montar os times.',
    surface: 'outlined',
    density: 'compact',
    children: <PlayersExample />,
    action: <CardAction />,
    footer: (
      <>
        <Button size="sm">Confirmar</Button>
        <Button size="sm" variant="ghost">
          Cancelar
        </Button>
      </>
    ),
  },
  argTypes: {
    surface: { control: 'inline-radio', options: ['outlined', 'raised'] },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    children: { control: false },
    action: { control: false },
    footer: { control: false },
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = { name: 'Superfícies e densidades', render: () => <CardVariants /> };
export const OptionalRegions: Story = {
  name: 'Regiões opcionais',
  render: () => <CardOptionalRegions />,
};
export const LongContent: Story = {
  name: 'Texto longo e rodapé responsivo',
  render: () => (
    <CardSample
      title="Jogadores confirmados para a próxima partida de vôlei de praia"
      description="Confira os nomes antes de confirmar. O texto ocupa mais linhas e cresce sem sobrepor a ação do cabeçalho. identificadorsemqualquerespacoparavalidarquebradelinha"
      footer={
        <>
          <Button size="sm">Confirmar todos os jogadores da próxima partida</Button>
          <Button size="sm" variant="ghost">
            Cancelar edição
          </Button>
        </>
      }
    />
  ),
};
export const Interaction: Story = {
  name: 'Ações independentes e teclado',
  render: () => <CardInteraction />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Confirmar' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Jogadores confirmados.');
    await userEvent.click(canvas.getByRole('button', { name: 'Cancelar' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Aguardando confirmação.');
  },
};
