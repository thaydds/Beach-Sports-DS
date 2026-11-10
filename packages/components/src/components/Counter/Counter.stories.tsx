import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Counter, type CounterProps } from './Counter';
import { ScoreMatch } from '../ScoreMatch/ScoreMatch';
function Controlled(args: CounterProps) {
  const [value, setValue] = useState(args.value);
  return (
    <Counter
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange(next);
      }}
    />
  );
}
const meta = {
  title: 'Componentes/Counter',
  component: Counter,
  args: { label: 'Placar Time A', digits: 2, value: 9, onChange: fn() },
  render: (args) => <Controlled {...args} />,
  argTypes: {
    digits: { control: 'inline-radio', options: [1, 2, 3] },
    validation: { control: 'inline-radio', options: ['none', 'error'] },
  },
} satisfies Meta<typeof Counter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const OneDigit: Story = { args: { digits: 1, value: 1 } };
export const ThreeDigits: Story = { args: { digits: 3, value: 21 } };
export const Minimum: Story = { args: { value: 0 } };
export const Maximum: Story = { args: { value: 99 } };
export const Disabled: Story = { args: { disabled: true, value: 21 } };
export const Error: Story = { args: { validation: 'error', value: 21 } };
export const Dark: Story = { globals: { theme: 'dark' } };
function Match() {
  const [a, setA] = useState(21),
    [b, setB] = useState(18);
  return (
    <ScoreMatch
      title="Partida #015"
      metadata="Dados de exemplo"
      statusLabel="Em andamento"
      scoreLayout="rows"
      description="Placar de acompanhamento"
      teamA={{ name: 'Time A', score: a, players: 'André, Andressa, Arrana, Erick e Gustavo' }}
      teamB={{ name: 'Time B', score: b, players: 'Iolanda, Lana, LL, Richard e Thay' }}
      scoreContent={{
        A: <Counter label="Placar Time A" value={a} onChange={setA} />,
        B: <Counter label="Placar Time B" value={b} onChange={setB} />,
      }}
    />
  );
}
export const InMatch: Story = { render: () => <Match /> };
