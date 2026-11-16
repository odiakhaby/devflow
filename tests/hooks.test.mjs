// Tests des hooks devflow : node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const scripts = resolve(import.meta.dirname, '..', 'plugins', 'devflow', 'hooks', 'scripts');

function run(script, input, env = {}) {
  const r = spawnSync('node', [join(scripts, script)], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function sh(cwd, ...cmd) {
  const r = spawnSync(cmd[0], cmd.slice(1), { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${cmd.join(' ')}: ${r.stderr}`);
  return r.stdout;
}

function repo(branch = 'main') {
  const dir = mkdtempSync(join(tmpdir(), 'devflow-test-'));
  sh(dir, 'git', 'init', '-q', '-b', branch);
  sh(dir, 'git', 'config', 'user.email', 't@t.t');
  sh(dir, 'git', 'config', 'user.name', 't');
  writeFileSync(join(dir, 'README.md'), 'x');
  sh(dir, 'git', 'add', '.');
  sh(dir, 'git', 'commit', '-qm', 'init');
  return dir;
}

const bash = (command, cwd) => run('guard-bash.mjs', { tool_name: 'Bash', tool_input: { command }, cwd });

test('guard-bash bloque le merge et l\'approbation de PR', () => {
  assert.equal(bash('gh pr merge 12 --squash').code, 2);
  assert.equal(bash('gh pr review 12 --approve').code, 2);
  assert.equal(bash('gh api -X PUT repos/o/r/pulls/12/merge').code, 2);
  assert.equal(bash('gh pr edit 12 --add-label arch-approved').code, 2);
  assert.equal(bash('gh pr review 12 --comment -b "ok"').code, 0);
  assert.equal(bash('gh pr view 12 --json labels | grep arch-approved').code, 0);
});

test('guard-bash bloque push sur main, force push et --no-verify', () => {
  const dir = repo('main');
  assert.equal(bash('git push origin main', dir).code, 2);
  assert.equal(bash('git push origin HEAD:main', dir).code, 2);
  assert.equal(bash('git push', dir).code, 2, 'push sans refspec depuis main');
  assert.equal(bash('git push -u origin feat/1-x --force', dir).code, 2);
  assert.equal(bash('git push -f origin feat/1-x', dir).code, 2);
  assert.equal(bash('git commit -m "x" --no-verify', dir).code, 2);
  assert.equal(bash('git push --force-with-lease origin feat/1-x', dir).code, 0);
  assert.equal(bash('git push -u origin feat/1-x', dir).code, 0);
});

test('guard-bash autorise git push sans refspec depuis une branche de feature', () => {
  const dir = repo('main');
  sh(dir, 'git', 'switch', '-qc', 'feat/42-login');
  assert.equal(bash('npm test && git push', dir).code, 0);
});

test('guard-bash bloque les commandes Prisma destructrices', () => {
  assert.equal(bash('pnpm exec prisma migrate reset --force').code, 2);
  assert.equal(bash('npx prisma db push --accept-data-loss').code, 2);
  assert.equal(bash('pnpm exec prisma migrate dev --name add_user').code, 0);
});

const file = (tool_name, file_path, cwd) => run('guard-files.mjs', { tool_name, tool_input: { file_path }, cwd });

test('guard-files bloque .env mais pas .env.example', () => {
  assert.equal(file('Read', '/p/.env').code, 2);
  assert.equal(file('Read', '/p/apps/web/.env.local').code, 2);
  assert.equal(file('Edit', '/p/.env.production').code, 2);
  assert.equal(file('Read', '/p/.env.example').code, 0);
  assert.equal(file('Write', '/p/src/env.ts').code, 0);
});

test('guard-files bloque la modification d\'une migration versionnée seulement', () => {
  const dir = repo('main');
  const mig = join(dir, 'prisma', 'migrations', '20260101_init');
  mkdirSync(mig, { recursive: true });
  writeFileSync(join(mig, 'migration.sql'), 'CREATE TABLE a();');
  sh(dir, 'git', 'add', '.');
  sh(dir, 'git', 'commit', '-qm', 'mig');
  assert.equal(file('Edit', join(mig, 'migration.sql'), dir).code, 2);
  assert.equal(file('Read', join(mig, 'migration.sql'), dir).code, 0);
  assert.equal(file('Write', join(dir, 'prisma', 'migrations', '20260202_new', 'migration.sql'), dir).code, 0);
});

test('quality-gate : rien à faire sans changement de code', () => {
  const dir = repo('main');
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: { check: 'exit 1' } }));
  sh(dir, 'git', 'add', '.');
  sh(dir, 'git', 'commit', '-qm', 'pkg');
  assert.equal(run('quality-gate.mjs', { cwd: dir, session_id: 's1' }).code, 0);
});

test('quality-gate : bloque quand check échoue, puis rend la main après 3 tentatives', () => {
  const dir = repo('main');
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: { check: 'node -e "process.exit(1)"' } }));
  sh(dir, 'git', 'add', '.');
  sh(dir, 'git', 'commit', '-qm', 'pkg');
  writeFileSync(join(dir, 'a.ts'), 'export const a = 1');
  const input = { cwd: dir, session_id: `s-${Date.now()}` };
  for (let i = 1; i <= 3; i++) {
    const r = run('quality-gate.mjs', input);
    assert.equal(r.code, 2, `tentative ${i}`);
    assert.match(r.stderr, new RegExp(`tentative ${i}/3`));
  }
  const last = run('quality-gate.mjs', input);
  assert.equal(last.code, 0);
  assert.match(last.stdout, /systemMessage/);
});

test('quality-gate : passe, puis ne relance pas sur le même état', () => {
  const dir = repo('main');
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: { 'check:fast': 'node -e "require(\'fs\').appendFileSync(\'runs.log\', \'x\')"' } }));
  sh(dir, 'git', 'add', '.');
  sh(dir, 'git', 'commit', '-qm', 'pkg');
  writeFileSync(join(dir, '.gitignore'), 'runs.log\n');
  writeFileSync(join(dir, 'b.ts'), 'export const b = 1');
  const input = { cwd: dir, session_id: 's-pass' };
  assert.equal(run('quality-gate.mjs', input).code, 0);
  assert.equal(run('quality-gate.mjs', input).code, 0);
  const runs = spawnSync('cat', ['runs.log'], { cwd: dir, encoding: 'utf8' }).stdout;
  assert.equal(runs, 'x', 'check:fast lancé une seule fois');
});

test('quality-gate : désactivable avec DEVFLOW_STOP_GATE=0', () => {
  const dir = repo('main');
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: { check: 'node -e "process.exit(1)"' } }));
  writeFileSync(join(dir, 'c.ts'), 'x');
  assert.equal(run('quality-gate.mjs', { cwd: dir }, { DEVFLOW_STOP_GATE: '0' }).code, 0);
});

test('session-context : silencieux hors projet devflow, contexte sinon', () => {
  const dir = repo('main');
  assert.equal(run('session-context.mjs', { cwd: dir }).stdout, '');
  mkdirSync(join(dir, 'docs', 'specs'), { recursive: true });
  sh(dir, 'git', 'switch', '-qc', 'feat/42-login');
  const out = JSON.parse(run('session-context.mjs', { cwd: dir }).stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(out.hookSpecificOutput.additionalContext, /issue GitHub #42/);
});
