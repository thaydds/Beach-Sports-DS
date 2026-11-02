import { tokens } from '@beachsports/tokens';

import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Beach Sports DS',
    brandUrl: './?path=/docs/comece-aqui-visão-geral--docs',
    colorPrimary: tokens['--ds-color-action-default'],
    colorSecondary: tokens['--ds-color-action-default'],
    appBg: tokens['--ds-color-bg-base'],
    appContentBg: tokens['--ds-color-bg-base'],
    textColor: tokens['--ds-color-text-primary'],
    fontBase: 'Inter, system-ui, sans-serif',
    brandTarget: '_self',
  }),
});
