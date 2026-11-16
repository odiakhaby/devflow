#!/usr/bin/env node
// Crée ou met à jour les labels devflow sur le dépôt GitHub courant (via gh CLI).
// Usage : node setup-github.mjs [--repo owner/name]
// Idempotent : `gh label create --force` met à jour un label existant.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const labels = JSON.parse(readFileSync(resolve(here, '..', 'templates', 'github-labels.json'), 'utf8'));

const repoIdx = process.argv.indexOf('--repo');
const repoArgs = repoIdx > -1 ? ['--repo', process.argv[repoIdx + 1]] : [];

const auth = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
if (auth.status !== 0) {
  console.error('gh CLI non authentifié : lance `gh auth login` puis réessaie.');
  process.exit(1);
}

let failed = 0;
for (const l of labels) {
  const r = spawnSync(
    'gh',
    ['label', 'create', l.name, '--color', l.color, '--description', l.description, '--force', ...repoArgs],
    { encoding: 'utf8' },
  );
  if (r.status === 0) console.log(`✔ ${l.name}`);
  else {
    failed++;
    console.error(`✘ ${l.name} : ${(r.stderr || r.stdout).trim()}`);
  }
}
process.exit(failed ? 1 : 0);
