import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it.each(['sm', 'md', 'lg'] as const)('names the %s avatar by full name, not initials', (size) => {
    render(<Avatar size={size} initials="AN" name="André Nunes" />);
    expect(screen.getByRole('img', { name: 'André Nunes' })).toHaveAttribute('data-size', size);
    expect(screen.getByText('AN')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('hides redundant avatars beside an authoritative name', () => {
    const { container } = render(<Avatar initials="AN" decorative />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
  it('falls back after failed images and attempts a replacement source', () => {
    const { container, rerender } = render(<Avatar name="André" initials="AN" src="/first.png" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('AN')).toBeVisible();
    rerender(<Avatar name="André" initials="AN" src="/second.png" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/second.png');
  });
  it('uses a generic fallback for absent or overly long initials', () => {
    const { container, rerender } = render(<Avatar name="Participante" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    rerender(<Avatar name="Participante" initials="ANDRE" />);
    expect(screen.queryByText('ANDRE')).not.toBeInTheDocument();
  });
  it('supports two graphemes and native ref without inventing initials from names', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar name="Álvaro" initials={'A\u0301N'} ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('img'));
    expect(screen.getByText('A\u0301N')).toBeInTheDocument();
  });
});

function typeContracts() {
  // @ts-expect-error An informative avatar requires the full accessible name.
  const unnamed = <Avatar initials="AN" />;
  // @ts-expect-error A passive Avatar is not a button.
  const clickable = <Avatar name="André" onClick={() => {}} />;
  return [unnamed, clickable];
}
void typeContracts;
