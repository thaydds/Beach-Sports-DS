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

export { Avatar, type AvatarProps, type AvatarSize } from './components/Avatar/Avatar';
export { Badge, type BadgeProps, type BadgeTone } from './components/Badge/Badge';
export { Chip, type ChipProps } from './components/Chip/Chip';

export {
  Input,
  type InputProps,
  type InputSize,
  type InputValidation,
  type InputTrailingAction,
} from './components/Input/Input';
export { FormField, type FormFieldProps } from './components/FormField/FormField';
export { Checkbox, type CheckboxProps, type CheckboxSize } from './components/Checkbox/Checkbox';
