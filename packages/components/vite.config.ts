import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Vite library mode: ESM + CJS. Type declarations are emitted separately by
 * `tsc -p tsconfig.lib.json --emitDeclarationOnly` (see project.json).
 */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', /^react\//],
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
});
