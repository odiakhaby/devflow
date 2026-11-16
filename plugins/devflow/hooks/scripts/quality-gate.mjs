#!/usr/bin/env node
// Stop : avant que Claude rende la main, lance la vérification du projet si du code a changé
// depuis la dernière vérification réussie. Exit 2 = Claude reprend la main pour corriger.
//
// Script lancé : `check:fast`, sinon `check`, sinon `typecheck` puis `lint` (ceux qui existent).
// Désactivation : variable d'environnement DEVFLOW_STOP_GATE=0.
// Après MAX_ATTEMPTS échecs consécutifs dans la même session, le gate laisse finir le tour
// et prévient l'humain, pour éviter de s'acharner sur un échec préexistant.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { git, isGitRepo, readInput } from './lib.mjs';

const MAX_ATTEMPTS = Number(process.env.DEVFLOW_STOP_GATE_MAX_ATTEMPTS || 3);
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte|prisma|sql|json|css)$/i;
const IGNORED = /(^|\/)(node_modules|dist|build|\.next|coverage|\.turbo|\.expo)\//;

if (process.env.DEVFLOW_STOP_GATE === '0') process.exit(0);

const input = readInput();
const cwd = input.cwd || process.cwd();
if (!isGitRepo(cwd)) process.exit(0);

const root = git(['rev-parse', '--show-toplevel'], cwd) || cwd;
const pkgPath = join(root, 'package.json');
if (!existsSync(pkgPath)) process.exit(0);

// 1. Y a-t-il des changements de code non commités ?
const status = git(['status', '--porcelain=v1', '-uall'], root) ?? '';
const changed = status
  .split('\n')
  .filter(Boolean)
  .map((l) => l.slice(3).split(' -> ').pop())
  .filter((p) => CODE_EXT.test(p) && !IGNORED.test(p) && !/lock\.(json|yaml)$/.test(p));
if (changed.length === 0) process.exit(0);

// 2. Empreinte de l'état courant ; inutile de relancer si cet état a déjà passé.
const head = git(['rev-parse', 'HEAD'], root) ?? 'no-head';
const diff = git(['diff', 'HEAD'], root) ?? git(['diff'], root) ?? '';
const untracked = (git(['ls-files', '--others', '--exclude-standard'], root) ?? '')
  .split('\n')
  .filter(Boolean)
  .map((f) => {
    try {
      const s = statSync(join(root, f));
      return `${f}:${s.size}:${s.mtimeMs}`;
    } catch {
      return f;
    }
  })
  .join('\n');
const fingerprint = createHash('sha1').update(`${head}\n${diff}\n${untracked}`).digest('hex');

const stateFile = join(tmpdir(), `devflow-gate-${createHash('sha1').update(root).digest('hex').slice(0, 12)}.json`);
let state = {};
try {
  state = JSON.parse(readFileSync(stateFile, 'utf8'));
} catch {}
const save = () => {
  try {
    writeFileSync(stateFile, JSON.stringify(state));
  } catch {}
};
if (state.passed === fingerprint) process.exit(0);

// 3. Choisir le script et le gestionnaire de paquets.
let scripts = {};
try {
  scripts = JSON.parse(readFileSync(pkgPath, 'utf8')).scripts ?? {};
} catch {}
const toRun = scripts['check:fast'] ? ['check:fast'] : scripts.check ? ['check'] : ['typecheck', 'lint'].filter((s) => scripts[s]);
if (toRun.length === 0) process.exit(0);

const pm = existsSync(join(root, 'pnpm-lock.yaml'))
  ? 'pnpm'
  : existsSync(join(root, 'yarn.lock'))
    ? 'yarn'
    : existsSync(join(root, 'bun.lock')) || existsSync(join(root, 'bun.lockb'))
      ? 'bun'
      : 'npm';

// 4. Lancer.
let output = '';
let ok = true;
for (const script of toRun) {
  const r = spawnSync(pm, ['run', script], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: 540_000,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, CI: process.env.CI ?? '1', FORCE_COLOR: '0' },
  });
  output += `$ ${pm} run ${script}\n${r.stdout ?? ''}${r.stderr ?? ''}\n`;
  if (r.status !== 0) {
    ok = false;
    if (r.error) output += `\n(${r.error.message})\n`;
    break;
  }
}

if (ok) {
  state = { passed: fingerprint, failures: 0, session: input.session_id };
  save();
  process.exit(0);
}

const failures = state.session === input.session_id ? (state.failures ?? 0) + 1 : 1;
state = { ...state, failures, session: input.session_id };

if (failures > MAX_ATTEMPTS) {
  state.failures = 0;
  save();
  process.stdout.write(
    JSON.stringify({
      systemMessage: `devflow : « ${pm} run ${toRun.join(' && ')} » échoue encore après ${MAX_ATTEMPTS} tentatives. Je rends la main : regarde si l'échec est préexistant ou hors périmètre.`,
    }),
  );
  process.exit(0);
}

save();
const tail = output.trim().split('\n').slice(-80).join('\n');
process.stderr.write(
  `[devflow] La vérification « ${pm} run ${toRun.join(' && ')} » échoue (tentative ${failures}/${MAX_ATTEMPTS}). ` +
    `Corrige avant de terminer. Si l'échec est préexistant et hors du périmètre de la tâche, dis-le explicitement au lieu d'élargir le périmètre.\n\n${tail}\n`,
);
process.exit(2);
