import assert from 'node:assert/strict';
import test from 'node:test';
import { parseConventionalCommits } from 'release-please/build/src/commit.js';

import { releaseNoteEntries } from './notes.mjs';

const mergeSha = 'a'.repeat(40);
const originalSha = 'b'.repeat(40);
const merges = new Set([mergeSha]);
const silent = { info() {}, debug() {}, warn() {}, error() {}, trace() {} };
const pullRequest = { number: 1, baseBranchName: 'main', mergeCommitOid: mergeSha, body: '' };
const feature = 'feat(components): add Button and IconButton';
const original = (message = feature, pr = pullRequest) => ({
  sha: originalSha,
  message,
  pullRequest: pr,
});
const merge = (message = feature) => ({
  sha: mergeSha,
  message: `Merge pull request #1 from org/feature\n\n${message}`,
  pullRequest,
});
const parsed = (commits) => parseConventionalCommits(commits, silent);

test('a merge and its identical original produce one entry linked to the original', () => {
  const entries = releaseNoteEntries(parsed([merge(), original()]), merges);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].sha, originalSha);
});

test('unique merge notes and breaking metadata are preserved', () => {
  const commits = parsed([merge(`${feature}\n\nBREAKING CHANGE: removed the old API`), original()]);
  const entries = releaseNoteEntries(commits, merges);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].breaking, true);
  assert.match(entries[0].notes[0].text, /removed the old API/);
});

test('merge-only, squash, rebase and direct entries are not discarded', () => {
  for (const commits of [[merge()], [original()], [{ sha: originalSha, message: feature }]]) {
    const entries = parsed(commits);
    assert.deepEqual(releaseNoteEntries(entries, merges), entries);
  }
  const rebased = parsed([original(), { ...original(), sha: mergeSha }]);
  assert.equal(releaseNoteEntries(rebased, new Set()).length, 2);
});

test('identical subjects from different PRs remain separate', () => {
  const entries = parsed([merge(), original(feature, { ...pullRequest, number: 2 })]);
  assert.equal(releaseNoteEntries(entries, merges).length, 2);
});

test('different original commits within one PR remain separate', () => {
  const entries = parsed([merge(), original(), { ...original(), sha: 'c'.repeat(40) }]);
  const filtered = releaseNoteEntries(entries, merges);
  assert.equal(filtered.length, 2);
  assert.ok(filtered.every((entry) => entry.sha !== mergeSha));
});

test('missing PR metadata cannot cause entries to be removed', () => {
  const entries = parsed([merge(), { sha: originalSha, message: feature }]);
  assert.equal(releaseNoteEntries(entries, merges).length, 2);
});
