/**
 * Stylelint guards the token contract in CSS Modules:
 * - only `var(--ds-*)` color values (no hex/rgb/hsl)
 * - no `px` — use `var(--ds-space-*)`, `var(--ds-size-*)`, `var(--ds-stroke-*)`, etc.
 *
 * Exceptions are limited to the files that define raw values: the generated
 * tokens stylesheet and the two global resets.
 */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/storybook-static/**', '**/coverage/**'],
  rules: {
    'unit-disallowed-list': ['px'],
    'color-no-hex': true,
    'declaration-property-value-disallowed-list': {
      '/.*/': ['/var\\(--ds-palette-/'],
      '/^(color|background|background-color|border|border-color|outline|outline-color|fill|stroke)$/':
        ['/#/', '/rgb[a]?\\(/', '/hsl[a]?\\(/', '/var\\(--ds-palette-/'],
    },
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'property-no-unknown': [true, { ignoreProperties: ['composes'] }],
  },
  overrides: [
    {
      files: ['**/dist/css/tokens.css', '**/src/styles/reset.css', '**/src/styles/base.css'],
      rules: {
        'unit-disallowed-list': null,
        'color-no-hex': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
    {
      files: ['**/*.module.css'],
      rules: {
        // CSS Modules-only pseudo selectors.
        'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['local', 'global'] }],
      },
    },
  ],
};
