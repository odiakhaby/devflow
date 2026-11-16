import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

/** Lit l'entrée JSON du hook sur stdin. Retourne {} si vide ou invalide. */
export function readInput() {
  try {
    const raw = readFileSync(0, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Bloque l'action : exit 2, le message sur stderr est renvoyé à Claude. */
export function block(message) {
  process.stderr.write(`[devflow] ${message}\n`);
  process.exit(2);
}

/** Lance git dans cwd. Retourne stdout (trim) ou null si la commande échoue. */
export function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout.trim() : null;
}

export function isGitRepo(cwd) {
  return git(['rev-parse', '--is-inside-work-tree'], cwd) === 'true';
}
