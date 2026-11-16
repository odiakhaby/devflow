#!/usr/bin/env node
// SessionStart : donne à Claude le contexte devflow utile (branche, issue liée, conventions).
// Ne sort rien si le dépôt n'est pas initialisé avec devflow.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { git, isGitRepo, readInput } from './lib.mjs';

const input = readInput();
const cwd = input.cwd || process.cwd();
if (!isGitRepo(cwd)) process.exit(0);
const root = git(['rev-parse', '--show-toplevel'], cwd) || cwd;

const claudeMd = join(root, 'CLAUDE.md');
const initialised =
  existsSync(join(root, 'docs', 'specs')) ||
  (existsSync(claudeMd) && /devflow/i.test(readFileSync(claudeMd, 'utf8')));
if (!initialised) process.exit(0);

const lines = ['Ce dépôt suit le workflow devflow.'];
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
if (pluginRoot) lines.push(`Conventions devflow : ${join(pluginRoot, 'reference', 'conventions.md')}.`);

const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], root);
if (branch) {
  lines.push(`Branche courante : ${branch}.`);
  const m = branch.match(/^[a-z]+\/(\d+)-/);
  if (m) lines.push(`Cette branche correspond à l'issue GitHub #${m[1]}.`);
  if (branch === 'main' || branch === 'master') {
    lines.push('La branche courante est la branche principale ; dans ce dépôt, les changements passent par une branche dédiée et une PR.');
  }
}
lines.push(
  process.env.DEVFLOW_STOP_GATE === '0'
    ? 'Le quality gate du hook Stop est désactivé (DEVFLOW_STOP_GATE=0).'
    : 'Un hook Stop lance la vérification du projet quand du code a changé.',
);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: lines.join('\n') },
  }),
);
