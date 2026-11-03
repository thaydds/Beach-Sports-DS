import { appendFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { GitHub, Manifest } from 'release-please';

import { parseTag, tagsFromReleases, validateCiRun } from './contracts.mjs';

// All writes happen only in the dedicated workflow, after a successful CI.
const dryRun = process.argv.includes('--dry-run');
if (!process.env.GITHUB_TOKEN || process.env.GITHUB_REPOSITORY !== 'thaydds/Beach-Sports-DS') {
  throw new Error('Run in the configured GitHub repository with GITHUB_TOKEN set');
}
if (!dryRun && (!process.env.CI || !process.env.GITHUB_OUTPUT)) {
  throw new Error('Mutation is restricted to the release workflow; use --dry-run locally');
}
const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

async function request(path, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub ${response.status} on ${path.split('?')[0]}`);
  return response.status === 204 ? undefined : response.json();
}

const main = await request('git/ref/heads/main');
const sha = main.object.sha;
if (event.workflow_run) {
  if (!validateCiRun(event.workflow_run, sha, `${owner}/${repo}`)) {
    console.warn('A newer main commit exists; its successful CI will start the next release run');
    process.exit(0);
  }
} else {
  if (process.env.GITHUB_REF !== 'refs/heads/main') throw new Error('Dispatch must target main');
  const runs = await request(
    `actions/workflows/ci.yml/runs?head_sha=${sha}&event=push&status=success&per_page=1`,
  );
  if (!runs.workflow_runs.some((run) => run.head_sha === sha && run.head_branch === 'main')) {
    throw new Error('Current main has no successful push CI');
  }
}

if (process.env.RETRY_TAG) {
  if (dryRun) throw new Error('Use normal preview without RETRY_TAG');
  const tag = process.env.RETRY_TAG;
  const parsed = parseTag(tag);
  const release = await request(`releases/tags/${encodeURIComponent(tag)}`);
  if (release.draft || release.tag_name !== tag)
    throw new Error('Expected an existing public release');
  execFileSync('git', ['merge-base', '--is-ancestor', `${tag}^{commit}`, sha]);
  await appendFile(process.env.GITHUB_OUTPUT, `${parsed.project}_tag=${tag}\n`);
  process.exit(0);
}

const github = await GitHub.create({ owner, repo, token: process.env.GITHUB_TOKEN });
const manifest = await Manifest.fromManifest(github, 'main');
if (dryRun) {
  const prs = await manifest.buildPullRequests();
  const releases = await manifest.buildReleases();
  console.warn(
    JSON.stringify(
      {
        pullRequests: prs.map((pr) => ({
          title: pr.title.toString(),
          files: pr.updates.map((update) => update.path),
        })),
        releases: releases.map((release) => release.tag.toString()),
      },
      null,
      2,
    ),
  );
} else {
  // retry_tag recovers a publication if tags were created before a later API failure.
  const tags = tagsFromReleases(await manifest.createReleases());
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `tokens_tag=${tags.tokens}\ncomponents_tag=${tags.components}\n`,
  );
  for (const pr of (await manifest.createPullRequests()).filter(Boolean)) {
    // Explicit workflow_dispatch works with GITHUB_TOKEN; a bot-authored PR's
    // automatic pull_request event may otherwise need workflow approval.
    await request('actions/workflows/ci.yml/dispatches', {
      method: 'POST',
      body: JSON.stringify({ ref: pr.headBranchName }),
    });
  }
}
