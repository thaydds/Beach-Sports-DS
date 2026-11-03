import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { needsPublication, parseTag, validatePackedManifest } from './contracts.mjs';

const tag = process.env.RELEASE_TAG;
const { project, version, path, name } = parseTag(tag);
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const tagged = execFileSync('git', ['rev-parse', `${tag}^{commit}`], { encoding: 'utf8' }).trim();
if (head !== tagged) throw new Error('Checkout does not match the approved tag');
const source = JSON.parse(await readFile(`${path}/package.json`, 'utf8'));
if (source.name !== name || source.version !== version)
  throw new Error('Source package disagrees with tag');

// A successful publish is immutable. Retries skip that exact version, while
// registry/network/authentication errors are never treated as "not published".
const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`);
const published = response.status === 200 ? await response.json() : undefined;
if (!needsPublication(response.status, published, { name, version })) {
  console.warn(`${name}@${version} is already published; skipping`);
} else {
  execFileSync(
    'pnpm',
    ['exec', 'nx', 'run-many', '-t', 'build', 'typecheck', 'test', '--projects', project],
    { stdio: 'inherit' },
  );
  const directory = await mkdtemp(join(tmpdir(), 'beachsports-release-'));
  try {
    // pnpm converts explicit workspace ranges into npm-compatible ranges.
    execFileSync('pnpm', ['--filter', name, 'pack', '--pack-destination', directory], {
      stdio: 'inherit',
    });
    const archives = (await readdir(directory)).filter((file) => file.endsWith('.tgz'));
    if (archives.length !== 1) throw new Error('Expected exactly one package archive');
    const archive = join(directory, archives[0]);
    const packed = JSON.parse(
      execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }),
    );
    validatePackedManifest(packed, tag);
    if (project === 'components') {
      // Do not publish components whose required tokens range is unavailable.
      execFileSync(
        'npm',
        [
          'view',
          `@beachsports/tokens@${packed.dependencies['@beachsports/tokens']}`,
          'version',
          '--json',
        ],
        { stdio: 'inherit' },
      );
    }
    if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL || !process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
      throw new Error('Publishing requires the GitHub Actions OIDC identity');
    }
    execFileSync('npm', ['publish', archive, '--access', 'public', '--provenance'], {
      stdio: 'inherit',
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
