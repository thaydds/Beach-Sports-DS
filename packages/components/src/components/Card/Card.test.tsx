import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Card } from './Card';
import { Button } from '../Button/Button';

describe('Card', () => {
  it.each(['outlined', 'raised'] as const)(
    'supports both densities of %s without interactive root semantics',
    (surface) => {
      const { rerender, container } = render(
        <Card surface={surface} title="Time">
          Conteúdo
        </Card>,
      );
      const card = container.firstElementChild;
      expect(card).toHaveAttribute('data-density', 'compact');
      expect(card).toHaveAttribute('data-surface', surface);
      expect(card).not.toHaveAttribute('tabindex');
      expect(card).not.toHaveAttribute('role', 'button');
      expect(screen.getByRole('heading', { name: 'Time' })).toHaveAttribute(
        'data-variant',
        'heading-m',
      );
      rerender(
        <Card surface={surface} density="comfortable" title="Time">
          Conteúdo
        </Card>,
      );
      expect(screen.getByRole('heading')).toHaveAttribute('data-variant', 'heading-l');
    },
  );
  it('omits empty slots, including header, with no retained spacers', () => {
    const { container, rerender } = render(
      <Card
        title="Time"
        description="Descrição"
        action={<button>Ação</button>}
        footer={<Button>Salvar</Button>}
      >
        Corpo
      </Card>,
    );
    expect(container.querySelectorAll('[data-slot]')).toHaveLength(4);
    rerender(<Card>{0}</Card>);
    expect(container.querySelectorAll('[data-slot]')).toHaveLength(1);
    expect(container.querySelector('[data-slot="body"]')).toHaveTextContent('0');
    rerender(<Card />);
    expect(container.querySelector('[data-slot]')).toBeNull();
  });
  it('associates the title with semantic containers and forwards native attributes and ref', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Card as="section" title="Próxima partida" titleAs="h3" ref={ref} id="match">
        Corpo
      </Card>,
    );
    const section = screen.getByRole('region', { name: 'Próxima partida' });
    expect(ref.current).toBe(section);
    expect(section).toHaveAttribute('id', 'match');
    expect(section).toHaveAttribute(
      'aria-labelledby',
      screen.getByRole('heading', { level: 3 }).id,
    );
  });
  it('respects explicit accessible names and uses unique title ids', () => {
    const { container } = render(
      <>
        <Card as="section" title="Time" aria-label="Meu time" />
        <Card as="section" title="Time" />
      </>,
    );
    expect(screen.getByRole('region', { name: 'Meu time' })).not.toHaveAttribute('aria-labelledby');
    const ids = [...container.querySelectorAll('h2')].map((e) => e.id);
    expect(new Set(ids).size).toBe(2);
  });
  it('keeps the action independent from the replaceable body and footer', () => {
    const action = vi.fn();
    const save = vi.fn();
    render(
      <Card
        title="Time"
        action={<Button onClick={action}>Mais ações</Button>}
        footer={<Button onClick={save}>Confirmar</Button>}
      >
        Corpo livre
      </Card>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mais ações' }));
    expect(action).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(save).toHaveBeenCalledOnce();
  });
  it('has accessible composed content', async () => {
    const { container } = render(
      <main>
        <h1>Partidas</h1>
        <Card
          as="article"
          title="Meu time"
          description="3 jogadores"
          footer={<Button>Confirmar</Button>}
        >
          André, Iolanda e Gustavo
        </Card>
      </main>,
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
