import { readFile, writeFile } from 'node:fs/promises';

const source = new URL('../docs/tokens.md', import.meta.url);
const output = new URL('../packages/components/docs/Tokens.mdx', import.meta.url);
const markdown = await readFile(source, 'utf8');
await writeFile(
  output,
  `import { Meta, Unstyled } from '@storybook/addon-docs/blocks';
import { TechnicalReference } from './ui/FoundationDocs';

<Meta title="Referência/Contrato dos tokens" />

{/* Generated from docs/tokens.md. Do not edit. */}
<Unstyled>
  <TechnicalReference markdown={${JSON.stringify(markdown)}} />
</Unstyled>
`,
);
