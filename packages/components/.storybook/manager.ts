import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Beach Sports DS',
    brandUrl: 'https://thaydds.github.io/Beach-Sports-DS/',
    brandTarget: '_self',
  }),
});
