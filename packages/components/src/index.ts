/**
 * Beach Sports DS — component library entry point.
 *
 * Components land one folder at a time under `src/<Component>/`, each with the
 * same five files: `<Component>.tsx`, `<Component>.module.css`,
 * `<Component>.test.tsx`, `<Component>.stories.tsx` and `index.ts`.
 */
export { Button, type ButtonProps } from './components/Button/Button';
export { IconButton, type IconButtonProps } from './components/IconButton/IconButton';
export type { ButtonVariant, ButtonSize } from './components/Button/ButtonBase';

export {
  Typography,
  type TypographyProps,
  type TypographyVariant,
  type TypographyTone,
  type TypographyElement,
} from './components/Typography/Typography';

export { Card, type CardProps, type CardSurface, type CardDensity } from './components/Card/Card';
