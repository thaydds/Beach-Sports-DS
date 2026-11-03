import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';
import {
  AvatarVariants,
  AvatarPeople,
  RosterComposition,
} from '../../../docs/examples/IdentityExamples';
const meta = {
  title: 'Componentes/Avatar',
  component: Avatar,
  args: { name: 'André Nunes', initials: 'AN', size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    content: { control: 'inline-radio', options: ['initials', 'fallback'] },
    initials: { control: 'text' },
    name: { control: 'text' },
    decorative: { control: 'boolean' },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = { name: 'Tamanhos e fallback', render: () => <AvatarVariants /> };
export const People: Story = { name: 'Identidade sem repetição', render: () => <AvatarPeople /> };
export const ImageFailure: Story = {
  name: 'Imagem indisponível',
  args: { src: '/avatar-unavailable.png' },
};
export const Composition: Story = {
  name: 'Composição com Card',
  render: () => <RosterComposition />,
};
