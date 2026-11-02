import type { AxeMatchers } from 'vitest-axe/matchers';

// vitest-axe 0.1.0 does not augment Vitest's `expect` types itself
// (`vitest-axe/extend-expect` only re-exports an empty module), so the matcher
// surface is declared here.
declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
