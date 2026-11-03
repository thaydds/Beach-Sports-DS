import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Manifest, setLogger } from 'release-please';
import { parseConventionalCommits } from 'release-please/build/src/commit.js';
import { Version } from 'release-please/build/src/version.js';
import { TagName } from 'release-please/build/src/util/tag-name.js';
import { buildStrategy } from 'release-please/build/src/factory.js';
import { parse } from 'yaml';
import { PullRequestBody } from 'release-please/build/src/util/pull-request-body.js';
import { check, getFileInfo, resolveConfig } from 'prettier';

import { registerReleaseNotes } from './notes.mjs';

import {
  needsPublication,
  parseTag,
  tagsFromReleases,
  validateCiRun,
  validatePackedManifest,
} from './contracts.mjs';

const config = JSON.parse(readFileSync('release-please-config.json', 'utf8'));
const silent = { info() {}, debug() {}, warn() {}, error() {}, trace() {} };
setLogger(silent);
const mergeSha = 'a'.repeat(40);
registerReleaseNotes(new Set([mergeSha]));
const commit = (message, files) => ({ sha: '1234567890abcdef', message, files });
// These cases model the first release. A release PR's own version manifest
// must not become the baseline of the GitHub fixture running inside that PR.
const fixtureContent = (path) =>
  path === '.release-please-manifest.json' ? '{}\n' : readFileSync(path, 'utf8');
const github = (commits = []) => ({
  repository: { owner: 'thaydds', repo: 'Beach-Sports-DS', defaultBranch: 'main' },
  async getFileJson(path) {
    return JSON.parse(fixtureContent(path));
  },
  async getFileContentsOnBranch(path) {
    const parsedContent = fixtureContent(path);
    return { parsedContent, content: Buffer.from(parsedContent).toString('base64'), sha: 'file' };
  },
  async *releaseIterator() {},
  async *tagIterator() {},
  async *pullRequestIterator() {},
  async *mergeCommitIterator() {
    yield* commits;
    yield { sha: config['bootstrap-sha'], message: 'chore: baseline', files: [] };
  },
});

test('release requires successful main CI from this repo; superseded runs are ignored', () => {
  const repository = 'thaydds/Beach-Sports-DS';
  const run = {
    event: 'push',
    head_branch: 'main',
    conclusion: 'success',
    head_sha: 'current',
    head_repository: { full_name: repository },
  };
  assert.equal(validateCiRun(run, 'current', repository), true);
  assert.equal(validateCiRun(run, 'newer', repository), false);
  for (const invalid of [
    { event: 'pull_request' },
    { conclusion: 'failure' },
    { head_branch: 'feature' },
    { head_repository: { full_name: 'fork/repo' } },
  ]) {
    assert.throws(() => validateCiRun({ ...run, ...invalid }, 'current', repository));
  }
});

test('publish retry skips existing exact versions, but fails on auth/network/server errors', () => {
  const expected = { name: '@beachsports/tokens', version: '0.1.0' };
  assert.equal(needsPublication(200, expected, expected), false);
  assert.equal(needsPublication(404, undefined, expected), true);
  for (const status of [401, 403, 429, 500, 503])
    assert.throws(() => needsPublication(status, undefined, expected));
  assert.throws(() => needsPublication(200, { ...expected, version: '0.2.0' }, expected));
});

async function candidates(commits) {
  const manifest = await Manifest.fromManifest(github(commits), 'main');
  return manifest.buildPullRequests();
}

test('initial tokens feature proposes only tokens 0.1.0 and its changelog', async () => {
  const prs = await candidates([
    commit('feat(tokens): expose foundation', ['packages/tokens/src/foundations.tokens.json']),
  ]);
  assert.equal(prs.length, 1);
  assert.equal(prs[0].version.toString(), '0.1.0');
  assert.ok(prs[0].updates.some((update) => update.path === 'packages/tokens/CHANGELOG.md'));
  assert.ok(!prs[0].updates.some((update) => update.path.startsWith('packages/components/')));
});

test('component feature proposes only components, preserving tokens manifest', async () => {
  const prs = await candidates([
    commit('feat(components): add Button', ['packages/components/src/Button/Button.tsx']),
  ]);
  assert.equal(prs.length, 1);
  assert.ok(prs[0].updates.some((update) => update.path === 'packages/components/package.json'));
  assert.ok(!prs[0].updates.some((update) => update.path.startsWith('packages/tokens/')));
});

test('release PR and changelog share concise notes without the repeated merge entry', async () => {
  const files = ['packages/components/src/components/Button/Button.tsx'];
  const pullRequest = { number: 1, baseBranchName: 'main', mergeCommitOid: mergeSha, body: '' };
  const commits = [
    {
      ...commit(
        'Merge pull request #1 from org/feature\n\nfeat(components): add Button and IconButton',
        files,
      ),
      sha: mergeSha,
      pullRequest,
    },
    { ...commit('feat(components): add Button and IconButton', files), pullRequest },
  ];
  const [pr] = await candidates(commits);
  const [withoutMerge] = await candidates([commits[1]]);
  assert.equal(pr.version.toString(), withoutMerge.version.toString());
  const body = pr.body.toString();
  assert.match(body, /^# Release de @beachsports\/components/);
  assert.match(body, /### Novidades/);
  assert.match(body, /Ao fazer merge desta PR/);
  assert.doesNotMatch(body, /beep|boop|I have created a release/);
  assert.equal(body.match(/add Button and IconButton/g)?.length, 1);
  assert.ok(body.includes(`/commit/${commits[1].sha}`));
  assert.ok(!body.includes(`/commit/${mergeSha}`));
  const changelog = pr.updates
    .find((entry) => entry.path === 'packages/components/CHANGELOG.md')
    .updater.updateContent('');
  assert.equal(changelog.match(/add Button and IconButton/g)?.length, 1);
  const formatting = { ...(await resolveConfig('release-please-config.json')), parser: 'markdown' };
  assert.equal(
    await check(changelog, formatting),
    true,
    'Generated changelog must pass the CI formatter',
  );
  const previous = '# Changelog\n\n## 0.0.1\n\n### Correções\n\n- Ajuste anterior.\n';
  assert.equal(
    await check(
      pr.updates
        .find((entry) => entry.path === 'packages/components/CHANGELOG.md')
        .updater.updateContent(previous),
      formatting,
    ),
    true,
  );
  const parsedBody = PullRequestBody.parse(body, silent);
  assert.equal(parsedBody.releaseData.length, 1);
  assert.equal(parsedBody.releaseData[0].version.toString(), '0.1.0');
  assert.match(parsedBody.releaseData[0].notes, /add Button and IconButton/);
});

test('both package headers identify the release without creating a dependent release', async () => {
  const [pr] = await candidates([
    commit('feat(tokens): add foundation', ['packages/tokens/src/foundations.tokens.json']),
  ]);
  assert.match(pr.body.toString(), /^# Release de @beachsports\/tokens/);
  assert.equal(pr.version.toString(), '0.1.0');
});

test('the generated version manifest keeps Release Please formatting and valid version data', async () => {
  const [pr] = await candidates([
    commit('feat(components): add Button', [
      'packages/components/src/components/Button/Button.tsx',
    ]),
  ]);
  const path = '.release-please-manifest.json';
  const update = pr.updates.find((entry) => entry.path === path);
  const manifest = JSON.parse(update.updater.updateContent('{}'));
  assert.deepEqual(manifest, { 'packages/components': '0.1.0' });
  assert.equal((await getFileInfo(path, { ignorePath: '.prettierignore' })).ignored, true);
});

test('a commit touching both packages produces separate reviewable PRs', async () => {
  const prs = await candidates([
    commit('feat: add control and tokens', [
      'packages/tokens/src/foundations.tokens.json',
      'packages/components/src/Button/Button.tsx',
    ]),
  ]);
  assert.equal(prs.length, 2);
});

test('docs-only changes never create package releases, even with a feat prefix', async () => {
  for (const file of [
    'docs/consumption.md',
    'packages/components/docs/Welcome.mdx',
    'packages/components/.storybook/preview.tsx',
    'packages/components/e2e/docs.spec.ts',
  ]) {
    assert.deepEqual(await candidates([commit('feat: improve docs', [file])]), [], file);
  }
});

test('chore and docs commits in product paths do not create releases', async () => {
  for (const prefix of ['chore', 'docs']) {
    assert.deepEqual(
      await candidates([
        commit(`${prefix}(tokens): clarify source`, [
          'packages/tokens/src/foundations.tokens.json',
        ]),
      ]),
      [],
    );
  }
});

test('code mixed with docs is still released for the affected package', async () => {
  const prs = await candidates([
    commit('fix(components): repair focus', [
      'packages/components/docs/Welcome.mdx',
      'packages/components/src/Button/Button.tsx',
    ]),
  ]);
  assert.equal(prs.length, 1);
});

for (const [current, message, expected] of [
  ['0.1.0', 'fix: repair alias', '0.1.1'],
  ['0.1.0', 'feat: new role', '0.2.0'],
  ['0.1.0', 'feat!: rename role', '0.2.0'],
  ['1.2.3', 'fix: repair alias', '1.2.4'],
  ['1.2.3', 'feat: new role', '1.3.0'],
  ['1.2.3', 'feat!: rename role', '2.0.0'],
  ['1.2.3', 'fix: revise contract\n\nBREAKING CHANGE: removed old role', '2.0.0'],
]) {
  test(`${message.split('\n')[0]}: ${current} → ${expected}`, async () => {
    const strategy = await buildStrategy({
      github: github(),
      targetBranch: 'main',
      path: 'packages/tokens',
      releaseType: 'node',
      component: 'tokens',
      includeComponentInTag: true,
      includeVInTag: false,
      tagSeparator: '@',
      bumpMinorPreMajor: config['bump-minor-pre-major'],
      bumpPatchForMinorPreMajor: config['bump-patch-for-minor-pre-major'],
      logger: silent,
    });
    const previous = {
      tag: new TagName(Version.parse(current), 'tokens', '@', false),
      sha: 'base',
      notes: '',
    };
    const pr = await strategy.buildReleasePullRequest(
      parseConventionalCommits(
        [commit(message, ['packages/tokens/src/palette.tokens.json'])],
        silent,
      ),
      previous,
    );
    assert.equal(pr.version.toString(), expected);
    const update = pr.updates.find((entry) => entry.path === 'packages/tokens/package.json');
    const updated = JSON.parse(
      update.updater.updateContent(readFileSync('packages/tokens/package.json', 'utf8')),
    );
    assert.equal(updated.version, expected);
  });
}

test('publication selection accepts only the actual release path and version', () => {
  assert.deepEqual(
    tagsFromReleases([
      undefined,
      { path: 'packages/tokens', version: '0.1.0', tagName: 'tokens@0.1.0' },
    ]),
    { tokens: 'tokens@0.1.0', components: '' },
  );
  assert.throws(() =>
    tagsFromReleases([{ path: 'packages/components', version: '0.1.0', tagName: 'tokens@0.1.0' }]),
  );
  for (const tag of [
    'v0.1.0',
    'tokens@latest',
    'tokens@0.1.0-beta.1',
    'other@0.1.0',
    'tokens@0.1.0\nmain',
  ]) {
    assert.throws(() => parseTag(tag));
  }
});

// Exercise both historical and candidate versions: the release PR changes the
// source version before this suite runs, while workspace ranges stay unchanged.
const componentsSource = JSON.parse(readFileSync('packages/components/package.json', 'utf8'));
for (const version of new Set([componentsSource.version, '0.1.0', '0.2.0', '1.4.2'])) {
  test(`archive check validates version ${version} and rejects local dependencies`, () => {
    const manifest = structuredClone(componentsSource);
    manifest.version = version;
    const tag = `components@${version}`;
    // Match the reason so an earlier version mismatch cannot hide this guard.
    assert.throws(() => validatePackedManifest(manifest, tag), /local dependency protocols/);
    manifest.dependencies['@beachsports/tokens'] = '^0.1.0';
    assert.equal(validatePackedManifest(manifest, tag).project, 'components');
    assert.throws(
      () => validatePackedManifest(manifest, `tokens@${version}`),
      /approved release tag/,
    );
    const [major, minor, patch] = version.split('.').map(Number);
    assert.throws(
      () => validatePackedManifest(manifest, `components@${major}.${minor}.${patch + 1}`),
      /approved release tag/,
    );
  });
}

test('workflow uses successful CI, OIDC, scoped tag checkouts and ordered publishing', () => {
  const workflow = parse(readFileSync('.github/workflows/release.yml', 'utf8'));
  assert.deepEqual(workflow.on.workflow_run.workflows, ['CI']);
  assert.equal(workflow.jobs.prepare.permissions['id-token'], undefined);
  for (const project of ['tokens', 'components']) {
    const job = workflow.jobs[`publish-${project}`];
    assert.equal(job.permissions['id-token'], 'write');
    assert.equal(job.permissions.contents, 'read');
    assert.equal(job.environment, 'npm');
    assert.ok(job.steps[0].with.ref.includes(`${project}_tag`));
    assert.equal(job.steps.at(-1).run, 'node tools/release/publish.mjs');
  }
  assert.ok(workflow.jobs['publish-components'].needs.includes('publish-tokens'));
  assert.ok(!('plugins' in config), 'No plugin should silently version dependents');
});
