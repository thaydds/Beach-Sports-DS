import { useState } from 'react';

import { Button, IconButton, FormField } from '../../src';
import styles from './ButtonExamples.module.css';

export const variants = ['primary', 'secondary', 'ghost', 'destructive'] as const;
export const sizes = ['sm', 'md', 'lg'] as const;

/** Exact Figma export, used as a mask so the decorative glyph inherits currentColor. */
export function ExampleIcon() {
  return <span className={styles.arrow} />;
}

export function VariantsExample({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <div className={styles.stack}>
      {variants.map((variant) => (
        <section key={variant} aria-label={variant}>
          <h3 className={styles.heading}>{variant}</h3>
          <div className={styles.row}>
            {sizes.map((size) =>
              iconOnly ? (
                <IconButton
                  key={size}
                  variant={variant}
                  size={size}
                  icon={<ExampleIcon />}
                  label={`Continuar ${variant} ${size}`}
                />
              ) : (
                <Button key={size} variant={variant} size={size}>
                  Inscrever-se
                </Button>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export function IconsExample({ loading = false }: { loading?: boolean }) {
  return (
    <div className={styles.stack}>
      {variants.map((variant) => (
        <section key={variant} aria-label={variant}>
          <h3 className={styles.heading}>{variant}</h3>
          <div className={styles.row}>
            <Button variant={variant} icon={<ExampleIcon />} loading={loading}>
              Continuar
            </Button>
            <Button variant={variant} icon={<ExampleIcon />} iconPosition="right" loading={loading}>
              Continuar
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}

export function StatesExample({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <div className={styles.stack}>
      {variants.map((variant) => (
        <section key={variant} aria-label={variant}>
          <h3 className={styles.heading}>{variant}</h3>
          <div className={styles.row}>
            {iconOnly ? (
              <>
                <IconButton variant={variant} icon={<ExampleIcon />} label="Continuar" />
                <IconButton
                  variant={variant}
                  icon={<ExampleIcon />}
                  label="Indisponível"
                  disabled
                />
                <IconButton
                  variant={variant}
                  icon={<ExampleIcon />}
                  label="Continuar"
                  loading
                  loadingLabel="Avançando"
                />
              </>
            ) : (
              <>
                <Button variant={variant}>Salvar</Button>
                <Button variant={variant} disabled>
                  Indisponível
                </Button>
                <Button variant={variant} loading>
                  Salvar
                </Button>
                <Button variant={variant} icon={<ExampleIcon />} loading loadingLabel="Salvando">
                  Salvar
                </Button>
                <Button
                  variant={variant}
                  icon={<ExampleIcon />}
                  iconPosition="right"
                  loading
                  loadingLabel="Salvando"
                >
                  Salvar
                </Button>
              </>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export function FormExample() {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState(0);
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmissions((value) => value + 1);
        setLoading(true);
      }}
    >
      <FormField label="Nome do time" id="team-name" name="team" defaultValue="Time da praia" />
      <div className={styles.row}>
        <Button type="submit" loading={loading} loadingLabel="Salvando time">
          Salvar time
        </Button>
        <Button variant="secondary" disabled={!loading} onClick={() => setLoading(false)}>
          Concluir operação
        </Button>
      </div>
      <p role="status">
        {submissions} envio(s). {loading ? 'Operação em andamento.' : 'Pronto para salvar.'}
      </p>
    </form>
  );
}

export function LongLabelExample() {
  return (
    <div className={styles.narrow}>
      <Button icon={<ExampleIcon />} iconPosition="right">
        Confirmar minha inscrição no campeonato de vôlei de praia
      </Button>
    </div>
  );
}
