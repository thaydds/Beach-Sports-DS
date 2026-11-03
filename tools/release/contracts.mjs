export const packages = {
  tokens: { path: 'packages/tokens', name: '@beachsports/tokens' },
  components: { path: 'packages/components', name: '@beachsports/components' },
};

export function validateCiRun(run, mainSha, repository) {
  if (
    run.event !== 'push' ||
    run.head_branch !== 'main' ||
    run.conclusion !== 'success' ||
    run.head_repository?.full_name !== repository
  ) {
    throw new Error('Only successful push CI from this repository main can release');
  }
  return run.head_sha === mainSha;
}

export function needsPublication(status, published, expected) {
  if (status === 404) return true;
  if (status !== 200) throw new Error(`npm registry returned ${status}`);
  if (published?.name !== expected.name || published?.version !== expected.version) {
    throw new Error('Unexpected registry response');
  }
  return false;
}

export function parseTag(tag) {
  const match = /^(tokens|components)@(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(tag);
  if (!match) throw new Error('Expected a stable package tag: tokens@x.y.z or components@x.y.z');
  const project = match[1];
  return { project, version: tag.slice(project.length + 1), ...packages[project] };
}

export function tagsFromReleases(releases) {
  const tags = { tokens: '', components: '' };
  for (const release of releases.filter(Boolean)) {
    const parsed = parseTag(release.tagName);
    if (release.path !== parsed.path || release.version !== parsed.version) {
      throw new Error('Release path, version and tag disagree');
    }
    if (tags[parsed.project]) throw new Error('Multiple releases for the same package');
    tags[parsed.project] = release.tagName;
  }
  return tags;
}

export function validatePackedManifest(manifest, tag) {
  const expected = parseTag(tag);
  if (manifest.name !== expected.name || manifest.version !== expected.version) {
    throw new Error('Packed package does not match the approved release tag');
  }
  if (manifest.private || manifest.publishConfig?.access !== 'public') {
    throw new Error('Expected the configured public package');
  }
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    if (
      Object.values(manifest[field] ?? {}).some((value) => /^(workspace:|file:|link:)/.test(value))
    ) {
      throw new Error('Packed manifest still contains local dependency protocols');
    }
  }
  if (expected.project === 'components' && !manifest.dependencies?.[packages.tokens.name]) {
    throw new Error('Packed components must declare their tokens dependency');
  }
  return expected;
}
