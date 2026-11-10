import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loading } from './Loading';

const meta = {
  title: 'Componentes/Loading',
  component: Loading,
  args: { size: 'sm', label: 'Carregando jogadores' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Spinner sem texto visual. Nome acessível configurável. Marque aria-busy na região atualizada; use Button loading para ações.',
      },
    },
  },
} satisfies Meta<typeof Loading>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-space-16)', alignItems: 'center' }}>
      <Loading size="sm" />
      <Loading size="md" />
      <Loading size="lg" />
    </div>
  ),
};
export const Dark: Story = { ...Sizes, globals: { theme: 'dark' } };
