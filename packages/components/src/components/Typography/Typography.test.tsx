import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { Input } from '../Input/Input';
import { Typography, type TypographyVariant } from './Typography';

const variants: TypographyVariant[] = [
  'display-l',
  'display-m',
  'heading-l',
  'heading-m',
  'text-l',
  'text-m',
  'text-s',
  'label-m',
  'label-s',
];

describe('Typography', () => {
  it('defaults to paragraph semantics independently of visual hierarchy', () => {
    render(<Typography variant="display-l">Abertura</Typography>);
    expect(screen.getByText('Abertura').tagName).toBe('P');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it.each(variants)('renders %s without adding a wrapper or mutating content', (variant) => {
    const { container } = render(
      <Typography variant={variant}>
        Uma linha
        <br />
        Outra linha
      </Typography>,
    );
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toHaveAttribute('data-variant', variant);
    expect(container.querySelector('br')).toBeInTheDocument();
  });

  it('supports heading levels, native attributes, ARIA and forwarded refs', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Typography
        as="h3"
        variant="heading-l"
        tone="secondary"
        id="team"
        ref={ref}
        aria-describedby="help"
        className="consumer"
      >
        Meu time
      </Typography>,
    );
    const heading = screen.getByRole('heading', { name: 'Meu time', level: 3 });
    expect(ref.current).toBe(heading);
    expect(heading).toHaveAttribute('id', 'team');
    expect(heading).toHaveAttribute('aria-describedby', 'help');
    expect(heading).toHaveClass('consumer');
    expect(heading).toHaveAttribute('data-tone', 'secondary');
  });

  it('associates labels with fields and does not make visual labels into form labels', () => {
    render(
      <>
        <Typography as="label" variant="label-m" htmlFor="name">
          Nome
        </Typography>
        <Input id="name" />
        <Typography variant="label-s">Categoria</Typography>
      </>,
    );
    expect(screen.getByLabelText('Nome')).toHaveAttribute('id', 'name');
    expect(screen.getByLabelText('Nome').closest('[data-input]')).toBeInTheDocument();
    expect(screen.getByText('Categoria').tagName).toBe('P');
  });

  it('keeps inline content inline and preserves native ARIA roles', () => {
    render(
      <Typography as="span" role="status" tone="inherit">
        Inscrição confirmada
      </Typography>,
    );
    expect(screen.getByRole('status').tagName).toBe('SPAN');
    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'inherit');
  });

  it('has accessible heading and form composition', async () => {
    const { container } = render(
      <main>
        <Typography as="h1" variant="display-m">
          Inscrição
        </Typography>
        <Typography as="label" variant="label-m" htmlFor="email">
          E-mail
        </Typography>
        <Input id="email" type="email" />
      </main>,
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});

// Compile-time consumer contract; deliberately never executed.
function typeContracts() {
  // @ts-expect-error No undocumented combination.
  const invalidVariant = <Typography variant="display-s">Texto</Typography>;
  // @ts-expect-error htmlFor belongs to an explicit label.
  const invalidLabel = <Typography htmlFor="name">Nome</Typography>;
  // @ts-expect-error Visual customization must use the token contract.
  const invalidStyle = <Typography style={{ fontSize: 99 }}>Texto</Typography>;
  return [invalidVariant, invalidLabel, invalidStyle];
}
void typeContracts;
