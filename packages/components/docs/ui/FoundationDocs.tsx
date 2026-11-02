import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';

import {
  catalog,
  familyTokens,
  palette,
  semanticColors,
  spaces,
  styleLabel,
  tokenValue,
  trackingInEm,
  typeStyles,
  type Theme,
} from './catalog';
import { Markdown } from '@storybook/addon-docs/blocks';
import { GLOBALS_UPDATED, UPDATE_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';

import styles from './FoundationDocs.module.css';
import './docs.css';

const links = {
  overview: `${import.meta.env.BASE_URL}?path=/docs/comece-aqui-visão-geral--docs`,
  guide: `${import.meta.env.BASE_URL}?path=/docs/comece-aqui-como-usar--docs`,
  colors: `${import.meta.env.BASE_URL}?path=/docs/fundamentos-cores--docs`,
  typography: `${import.meta.env.BASE_URL}?path=/docs/fundamentos-tipografia--docs`,
  geometry: `${import.meta.env.BASE_URL}?path=/docs/fundamentos-espaço-e-geometria--docs`,
  reference: `${import.meta.env.BASE_URL}?path=/docs/referência-contrato-dos-tokens--docs`,
};

function initialTheme(): Theme {
  try {
    return localStorage.getItem('beachsports-docs-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function ThemeSwitch({ theme, onChange }: { theme: Theme; onChange: (theme: Theme) => void }) {
  return (
    <div className={styles.themeSwitch} role="group" aria-label="Tema da documentação">
      {(['light', 'dark'] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => onChange(option)}
        >
          <span aria-hidden="true">{option === 'light' ? '☀' : '◐'}</span>
          {option === 'light' ? 'Light' : 'Dark'}
        </button>
      ))}
    </div>
  );
}

function DocShell({
  section,
  children,
}: {
  section: string;
  children: (theme: Theme) => ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  useEffect(() => {
    const channel = addons.getChannel();
    const syncTheme = ({ globals }: { globals: { theme?: string } }) => {
      setTheme(globals.theme === 'dark' ? 'dark' : 'light');
    };
    channel.on(GLOBALS_UPDATED, syncTheme);
    return () => {
      channel.off(GLOBALS_UPDATED, syncTheme);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('beachsports-docs-theme', theme);
    } catch {
      // Theme switching still works when storage is unavailable.
    }
  }, [theme]);

  return (
    <main className={styles.shell} data-theme={theme}>
      <header className={styles.topbar}>
        <a className={styles.wordmark} href={links.overview} target="_top">
          <span className={styles.brandMark} aria-hidden="true">
            b.
          </span>
          <span>
            BEACH SPORTS <span className={styles.wordmarkSuffix}>/ DS</span>
          </span>
        </a>
        <ThemeSwitch
          theme={theme}
          onChange={(next) => {
            setTheme(next);
            try {
              localStorage.setItem('beachsports-docs-theme', next);
            } catch {
              /* Optional storage. */
            }
            addons.getChannel().emit(UPDATE_GLOBALS, { globals: { theme: next } });
          }}
        />
      </header>
      <div className={styles.breadcrumb}>
        DESIGN SYSTEM <span aria-hidden="true">/</span> {section}
      </div>
      {children(theme)}
      <footer className={styles.footer}>
        <span>Beach Sports DS · v0.1.0</span>
        <span>Projetado para o jogo. Construído para todos.</span>
      </footer>
    </main>
  );
}

function Intro({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.intro}>
      <span className={styles.eyebrow}>{number} / FUNDAMENTOS</span>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}

function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.sectionHeading}>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

function CopyToken({ name }: { name: string }) {
  const [message, setMessage] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(`var(${name})`);
      setMessage('Copiado');
    } catch {
      setMessage('Selecione o nome para copiar');
    }
  }
  return (
    <div className={styles.tokenName}>
      <code>{name}</code>
      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        aria-label={`Copiar ${name}`}
        title={`Copiar var(${name})`}
      >
        ⧉
      </button>
      <span className={styles.copyStatus} role="status">
        {message}
      </span>
    </div>
  );
}

export function Overview() {
  return (
    <DocShell section="COMECE AQUI">
      {() => (
        <>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.heroBadge}>BEACH SPORTS DESIGN SYSTEM</span>
              <h1>
                Uma linguagem.
                <br />
                Muitas partidas.
              </h1>
              <p>
                Da primeira inscrição ao ponto decisivo. Os fundamentos visuais que conectam toda a
                experiência Beach Sports.
              </p>
              <a href={links.colors} target="_top" className={styles.heroLink}>
                Explore os fundamentos <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className={styles.court} aria-hidden="true">
              <div className={styles.courtLine} />
              <div className={styles.ball} />
              <span className={styles.courtCaption}>CONSISTÊNCIA EM CADA PONTO.</span>
            </div>
          </section>
          <div className={styles.stats}>
            <div>
              <strong>{semanticColors.length}</strong>
              <span>papéis de cor</span>
            </div>
            <div>
              <strong>{typeStyles.length}</strong>
              <span>estilos tipográficos</span>
            </div>
            <div>
              <strong>{spaces.length}</strong>
              <span>espaçamentos</span>
            </div>
            <div>
              <strong>02</strong>
              <span>temas, uma linguagem</span>
            </div>
          </div>
          <section>
            <SectionHeading title="Conheça o que dá forma ao produto.">
              Explore cada fundamento em uso. Veja, compare e leve o token certo para o código.
            </SectionHeading>
            <div className={styles.navigationGrid}>
              <a href={links.colors} target="_top" className={styles.navigationCard}>
                <div className={styles.colorArtwork} aria-hidden="true">
                  {['action-default', 'accent-default', 'link-default', 'status-success'].map(
                    (role) => (
                      <span key={role} style={{ background: `var(--ds-color-${role})` }} />
                    ),
                  )}
                </div>
                <span className={styles.eyebrow}>01 / COR</span>
                <h3>
                  Cor com propósito <span aria-hidden="true">↗</span>
                </h3>
                <p>Palette, papéis semânticos e a mesma intenção nos dois temas.</p>
              </a>
              <a href={links.typography} target="_top" className={styles.navigationCard}>
                <div className={styles.typeArtwork} aria-hidden="true">
                  <span>Aa</span>
                  <span>
                    Inter
                    <br />
                    400 / 600 / 700
                  </span>
                </div>
                <span className={styles.eyebrow}>02 / TIPOGRAFIA</span>
                <h3>
                  Ritmo para a leitura <span aria-hidden="true">↗</span>
                </h3>
                <p>Do placar ao texto de apoio. Uma família, doze estilos.</p>
              </a>
              <a href={links.geometry} target="_top" className={styles.navigationCard}>
                <div className={styles.geometryArtwork} aria-hidden="true">
                  {['8', '16', '24', '32'].map((space) => (
                    <span key={space} style={{ width: `var(--ds-space-${space})` }} />
                  ))}
                </div>
                <span className={styles.eyebrow}>03 / GEOMETRIA</span>
                <h3>
                  Espaço para jogar <span aria-hidden="true">↗</span>
                </h3>
                <p>Espaço, raio, dimensão e alvos de toque em escala real.</p>
              </a>
            </div>
          </section>
          <section className={styles.principles}>
            <span className={styles.eyebrow}>DO DESIGN AO CÓDIGO</span>
            <h2>
              Uma decisão visual.
              <br />
              Um nome compartilhado.
            </h2>
            <p>
              O componente usa o papel da cor, não o seu valor. Ao mudar o tema, a intenção continua
              a mesma.
            </p>
            <pre tabIndex={0} role="region" aria-label="Exemplo de uso dos tokens no CSS">
              <code>
                {
                  '.action {\n  background: var(--ds-color-action-default);\n  color: var(--ds-color-action-fg);\n}'
                }
              </code>
            </pre>
            <a href={links.guide} target="_top" className={styles.textLink}>
              Aprender a usar no código <span aria-hidden="true">↗</span>
            </a>
            <br />
            <a href={links.reference} target="_top" className={styles.textLink}>
              Consultar o contrato técnico <span aria-hidden="true">↗</span>
            </a>
          </section>
        </>
      )}
    </DocShell>
  );
}

const groupLabels: Record<string, string> = {
  bg: 'Superfícies',
  border: 'Bordas',
  text: 'Texto',
  action: 'Ações',
  accent: 'Destaques',
  link: 'Links',
  focus: 'Foco',
  status: 'Status',
};

export function Colors() {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const filtered = semanticColors.filter(({ name, value }) =>
    `${name} ${value} ${tokenValue(name, 'dark')}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  const groups = [
    ...new Set(semanticColors.map(({ name }) => name.slice('--ds-color-'.length).split('-')[0])),
  ];
  const paletteGroups = [
    ...new Set(palette.map(({ name }) => name.slice('--ds-palette-'.length).split('-')[0])),
  ];
  return (
    <DocShell section="CORES">
      {() => (
        <>
          <Intro number="01" title="Cor com propósito.">
            Uma cor não é só um valor. É ação, informação, superfície e identidade. Compare os 34
            papéis em Light e Dark.
          </Intro>
          <div className={styles.callout}>
            <strong>Mesmo papel. Outra cor.</strong>
            <span>
              A ação é azul no Light e amarela no Dark. No código, o nome continua{' '}
              <code>--ds-color-action-default</code>.
            </span>
          </div>
          <div className={styles.exampleGrid}>
            {(['light', 'dark'] as const).map((theme) => (
              <div
                key={theme}
                className={styles.themeExample}
                data-theme={theme}
                style={
                  Object.fromEntries(
                    semanticColors.map(({ name }) => [name, tokenValue(name, theme)]),
                  ) as CSSProperties
                }
              >
                <span className={styles.eyebrow}>
                  {theme === 'light' ? 'LIGHT / CLAREZA' : 'DARK / ENERGIA'}
                </span>
                <strong>O próximo jogo começa aqui.</strong>
                <p>Uma superfície, uma ação e uma hierarquia de texto.</p>
                <span className={styles.actionExample}>
                  Inscreva sua dupla <span aria-hidden="true">↗</span>
                </span>
              </div>
            ))}
          </div>
          <div className={styles.searchbar}>
            <div>
              <label htmlFor={inputId}>Encontre uma cor</label>
              <input
                id={inputId}
                type="search"
                placeholder="Busque por nome ou valor…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <span role="status">
              {filtered.length} de {semanticColors.length} papéis
            </span>
          </div>
          {filtered.length === 0 && (
            <p className={styles.emptyState}>
              Nenhuma cor encontrada. Tente “action”, “surface” ou um valor hexadecimal.
            </p>
          )}
          {groups.map((group) => {
            const entries = filtered.filter(({ name }) => name.startsWith(`--ds-color-${group}-`));
            if (!entries.length || !group) return null;
            return (
              <section key={group} className={styles.catalogSection}>
                <SectionHeading title={groupLabels[group] ?? group} />
                <div className={styles.swatchGrid}>
                  {entries.map(({ name }) => (
                    <article key={name} className={styles.swatchCard}>
                      <h3>{name.slice('--ds-color-'.length).replaceAll('-', ' / ')}</h3>
                      <div className={styles.swatchPair}>
                        {(['light', 'dark'] as const).map((theme) => (
                          <div key={theme}>
                            <div
                              className={styles.swatch}
                              style={{ backgroundColor: tokenValue(name, theme) }}
                              role="img"
                              aria-label={`${name}, ${theme}: ${tokenValue(name, theme)}`}
                            />
                            <div className={styles.swatchValue}>
                              <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
                              <code>{tokenValue(name, theme)}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                      <CopyToken name={name} />
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
          <section className={styles.catalogSection}>
            <SectionHeading title="A palette por trás dos papéis.">
              Os {palette.length} primitivos são a matéria-prima. Em componentes de produto, use os
              papéis semânticos acima.
            </SectionHeading>
            <details className={styles.paletteDetails}>
              <summary>
                Explorar a palette completa <span>{palette.length} cores</span>
              </summary>
              {paletteGroups.map((group) => (
                <div key={group} className={styles.paletteFamily}>
                  <h3>{group}</h3>
                  <div className={styles.paletteGrid}>
                    {palette
                      .filter(({ name }) => name.startsWith(`--ds-palette-${group}-`))
                      .map(({ name, value }) => (
                        <div key={name} className={styles.paletteChip}>
                          <div
                            style={{ backgroundColor: String(value) }}
                            role="img"
                            aria-label={`${name}: ${value}`}
                          />
                          <strong>{name.split('-').at(-1)}</strong>
                          <code>{value}</code>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </details>
          </section>
        </>
      )}
    </DocShell>
  );
}

export function Typography() {
  const [sample, setSample] = useState('O próximo ponto é nosso.');
  const sampleId = useId();
  return (
    <DocShell section="TIPOGRAFIA">
      {() => (
        <>
          <Intro number="02" title="Ritmo para a leitura.">
            Inter em doze estilos. Hierarquia para encontrar o que importa, clareza para seguir o
            jogo.
          </Intro>
          <div className={styles.typeHero}>
            <span aria-hidden="true">Aa</span>
            <div>
              <span className={styles.eyebrow}>UMA FAMÍLIA / MUITAS VOZES</span>
              <h2>Inter</h2>
              <p>Regular 400 · Semi Bold 600 · Bold 700</p>
              <p>
                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn
                <br />
                0123456789 · Á É Í Ó Ú Ã Õ Ç
              </p>
            </div>
          </div>
          <div className={styles.searchbar}>
            <div>
              <label htmlFor={sampleId}>Experimente seu próprio texto</label>
              <input
                id={sampleId}
                maxLength={180}
                value={sample}
                onChange={(event) => setSample(event.target.value)}
                placeholder="Digite uma frase para comparar os estilos"
              />
            </div>
          </div>
          <section className={styles.typeList} aria-label="Estilos tipográficos">
            {typeStyles.map((style) => {
              const prefix = `--ds-type-${style}`;
              const typography: CSSProperties = {
                fontFamily: `var(${prefix}-font-family), sans-serif`,
                fontWeight: Number(tokenValue(`${prefix}-font-weight`)),
                fontSize: `var(${prefix}-font-size)`,
                lineHeight: `var(${prefix}-line-height)`,
                letterSpacing: trackingInEm(style),
              };
              return (
                <article key={style} className={styles.typeRow}>
                  <div className={styles.typeMeta}>
                    <h2>{styleLabel(style)}</h2>
                    <span>
                      {tokenValue(`${prefix}-font-size`)} / {tokenValue(`${prefix}-line-height`)} ·{' '}
                      {tokenValue(`${prefix}-font-weight`)}
                    </span>
                    <code>tracking {tokenValue(`${prefix}-letter-spacing-percent`)}</code>
                  </div>
                  <div className={styles.typeSpecimen}>
                    <p style={typography}>{sample || 'O próximo ponto é nosso.'}</p>
                    <CopyToken name={`${prefix}-font-size`} />
                  </div>
                </article>
              );
            })}
          </section>
          <div className={styles.callout}>
            <strong>Tamanho visual não define semântica.</strong>
            <span>
              Escolha h1, h2, p ou label pela função do conteúdo. O estilo tipográfico vem depois.
            </span>
          </div>
        </>
      )}
    </DocShell>
  );
}

export function Geometry() {
  return (
    <DocShell section="ESPAÇO E GEOMETRIA">
      {() => (
        <>
          <Intro number="03" title="Espaço para jogar.">
            Ritmo entre elementos, forma das superfícies e conforto em cada toque. Explore as
            medidas reais do sistema.
          </Intro>
          <section className={styles.catalogSection}>
            <SectionHeading title="Uma escala que respira.">
              Os {spaces.length} espaçamentos em tamanho real. Os valores de 18 e 22 são ajustes
              ópticos intencionais.
            </SectionHeading>
            <div className={styles.spaceList}>
              {spaces.map(({ name, value }) => (
                <div key={name} className={styles.spaceRow}>
                  <code>{name}</code>
                  <span>{value}</span>
                  <div className={styles.spaceTrack}>
                    <div style={{ width: `var(${name})` }} />
                    <span aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className={styles.catalogSection}>
            <SectionHeading title="Cada forma tem uma função.">
              Do canto de um checkbox à silhueta de um botão. Os raios abaixo usam os valores reais
              dos tokens.
            </SectionHeading>
            <div className={styles.radiusGrid}>
              {familyTokens('radius').map(({ name, value }) => (
                <article key={name} className={styles.radiusCard}>
                  <div className={styles.radiusShape} style={{ borderRadius: `var(${name})` }} />
                  <h3>{name.replace('--ds-', '').replaceAll('-', ' / ')}</h3>
                  <code>{value}</code>
                </article>
              ))}
            </div>
          </section>
          <section className={styles.catalogSection}>
            <SectionHeading title="Dimensões em escala real.">
              Referências de tamanho para ícones, controles, avatares e linhas.
            </SectionHeading>
            <div className={styles.sizeGrid}>
              {familyTokens('size').map(({ name, value }) => (
                <article key={name} className={styles.sizeCard}>
                  <div className={styles.sizeStage}>
                    <div style={{ width: `var(${name})`, height: `var(${name})` }} />
                  </div>
                  <code>{name}</code>
                  <span>{value}</span>
                </article>
              ))}
            </div>
          </section>
          <section className={styles.catalogSection}>
            <SectionHeading title="Traços que definem a interface." />
            <div className={styles.strokeGrid}>
              {familyTokens('stroke').map(({ name, value }) => (
                <article key={name} className={styles.strokeCard}>
                  <div style={{ borderTopWidth: `var(${name})` }} />
                  <CopyToken name={name} />
                  <span>{value}</span>
                </article>
              ))}
            </div>
          </section>
          <section className={styles.catalogSection}>
            <SectionHeading title="Conforto para tocar. Clareza para navegar.">
              Alvos de toque e foco são parte da geometria, não um acabamento.
            </SectionHeading>
            <div className={styles.exampleGrid}>
              {familyTokens('target').map(({ name, value }) => (
                <article key={name} className={styles.targetCard}>
                  <div
                    className={styles.targetShape}
                    style={{ width: `var(${name})`, height: `var(${name})` }}
                    aria-hidden="true"
                  >
                    +
                  </div>
                  <h3>{name.endsWith('min') ? 'Alvo mínimo' : 'Alvo confortável'}</h3>
                  <p>
                    {value} × {value}
                  </p>
                  <CopyToken name={name} />
                </article>
              ))}
            </div>
            <div className={styles.focusCard}>
              <div>
                <h3>Foco que não passa despercebido.</h3>
                <p>Use Tab para chegar ao exemplo e ver o anel de foco real.</p>
                {familyTokens('focus').map(({ name, value }) => (
                  <p key={name}>
                    <code>{name}</code> · {value}
                  </p>
                ))}
              </div>
              <button type="button" className={styles.focusExample}>
                Experimente o foco
              </button>
            </div>
          </section>
          <p className={styles.sourceNote}>
            Esta página demonstra{' '}
            {
              catalog.filter(({ name }) =>
                /^--ds-(space|size|radius|stroke|target|focus)-/.test(name),
              ).length
            }{' '}
            tokens de fundação, lidos dos artefatos gerados pelo Style Dictionary.
          </p>
        </>
      )}
    </DocShell>
  );
}

export function TechnicalReference({
  markdown,
  section = 'REFERÊNCIA TÉCNICA',
}: {
  markdown: string;
  section?: string;
}) {
  return (
    <DocShell section={section}>
      {() => (
        <div className={styles.reference}>
          <Markdown
            options={{
              overrides: {
                pre: { props: { tabIndex: 0, 'aria-label': 'Trecho de código' } },
                table: { props: { tabIndex: 0 } },
              },
            }}
          >
            {markdown}
          </Markdown>
        </div>
      )}
    </DocShell>
  );
}
