#!/usr/bin/env node
// Copie les fichiers de templates/project dans un projet, sans jamais écraser un fichier existant.
// Usage : node scaffold.mjs <dossier-cible> [--dry-run] [--set KEY=VALUE ...]
// Les occurrences de {{KEY}} dans les fichiers copiés sont remplacées par VALUE.
// Affiche un rapport JSON : { created: [...], skipped: [...] }.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const templateRoot = resolve(here, '..', 'templates', 'project');

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--') && !a.includes('='));
if (!target) {
  console.error('Usage : node scaffold.mjs <dossier-cible> [--dry-run] [--set KEY=VALUE ...]');
  process.exit(1);
}
const dryRun = args.includes('--dry-run');
const vars = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--set' && args[i + 1]) {
    const [k, ...rest] = args[i + 1].split('=');
    vars[k] = rest.join('=');
    i++;
  }
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const report = { target: resolve(target), dryRun, created: [], skipped: [] };
for (const src of walk(templateRoot)) {
  const rel = relative(templateRoot, src);
  const dest = join(resolve(target), rel);
  if (existsSync(dest)) {
    report.skipped.push(rel);
    continue;
  }
  report.created.push(rel);
  if (dryRun) continue;
  let content = readFileSync(src, 'utf8');
  for (const [k, v] of Object.entries(vars)) content = content.split(`{{${k}}}`).join(v);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, content);
}

console.log(JSON.stringify(report, null, 2));
