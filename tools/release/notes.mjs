import { execFileSync } from 'node:child_process';
import { registerChangelogNotes } from 'release-please';
import { DefaultChangelogNotes } from 'release-please/build/src/changelog-notes/default.js';
import { format, resolveConfig } from 'prettier';

/** Use git topology: a squash/rebase commit must never be mistaken for a merge. */
export function mergeCommitShas() {
  return new Set(
    execFileSync('git', ['rev-list', '--min-parents=2', 'HEAD'], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    })
      .trim()
      .split('\n')
      .filter(Boolean),
  );
}

function entryIdentity(commit) {
  return JSON.stringify([
    commit.pullRequest?.number,
    commit.pullRequest?.baseBranchName,
    commit.type,
    commit.scope,
    commit.bareMessage,
    commit.breaking,
    commit.notes,
    commit.references,
  ]);
}

export function releaseNoteEntries(commits, merges) {
  const originals = new Set(
    commits.filter((commit) => commit.pullRequest && !merges.has(commit.sha)).map(entryIdentity),
  );
  return commits.filter(
    (commit) =>
      !(
        merges.has(commit.sha) &&
        commit.pullRequest?.mergeCommitOid === commit.sha &&
        originals.has(entryIdentity(commit))
      ),
  );
}

export class ReleaseNotes extends DefaultChangelogNotes {
  constructor(options, merges) {
    super(options);
    this.merges = merges;
  }

  async buildNotes(commits, options) {
    // Only the rendered notes are filtered. Version calculation receives every
    // commit, including breaking changes and release metadata.
    const notes = await super.buildNotes(releaseNoteEntries(commits, this.merges), options);
    const formatting = await resolveConfig('release-please-config.json');
    return (await format(notes, { ...formatting, parser: 'markdown' })).trim();
  }
}

export function registerReleaseNotes(merges) {
  registerChangelogNotes('default', (options) => new ReleaseNotes(options, merges));
}
