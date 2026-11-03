import { createElement, forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

import styles from './Typography.module.css';

export type TypographyVariant =
  | 'display-l'
  | 'display-m'
  | 'heading-l'
  | 'heading-m'
  | 'text-l'
  | 'text-m'
  | 'text-s'
  | 'label-m'
  | 'label-s';
export type TypographyTone = 'primary' | 'secondary' | 'muted' | 'inherit';
export type TypographyElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';

type OwnProps = {
  /** Aparência: somente as nove combinações documentadas no Figma. */
  variant?: TypographyVariant;
  tone?: TypographyTone;
  children: ReactNode;
};

/** Atributos nativos acompanham a tag: htmlFor exige as="label". */
export type TypographyProps = {
  [Tag in TypographyElement]: OwnProps &
    (Tag extends 'p' ? { as?: Tag } : { as: Tag }) &
    Omit<ComponentPropsWithoutRef<Tag>, keyof OwnProps | 'as' | 'style' | 'color'>;
}[TypographyElement];

export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
  { as = 'p', variant = 'text-m', tone = 'primary', children, className, ...props },
  ref,
) {
  return createElement(
    as,
    {
      ...props,
      ref,
      className: [styles.typography, styles[variant], className].filter(Boolean).join(' '),
      'data-variant': variant,
      'data-tone': tone,
    },
    children,
  );
});
