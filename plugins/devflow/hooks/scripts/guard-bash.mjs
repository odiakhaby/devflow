#!/usr/bin/env node
// PreToolUse(Bash) : règles sans exception de devflow.
// - le merge et l'approbation de PR sont réservés à l'humain ;
// - le label arch-approved est réservé à l'humain ;
// - pas de push sur main/master, pas de force push (sauf --force-with-lease hors main) ;
// - pas de --no-verify ;
// - pas de commandes Prisma destructrices.
import { block, git, readInput } from './lib.mjs';

const input = readInput();
const command = String(input?.tool_input?.command ?? '');
const cwd = input.cwd || process.cwd();
if (!command.trim()) process.exit(0);

const PROTECTED = new Set(['main', 'master']);

const rules = [
  [/\bgh\s+pr\s+merge\b/, "Le merge des PR est réservé à l'humain. Laisse la PR ouverte et indique qu'elle est prête à relire."],
  [/\bgh\s+pr\s+review\b[^\n;&|]*\s(--approve|-a)\b/, "Approuver une PR est réservé à l'humain. Utilise `gh pr review --comment` pour un retour."],
  [/\bgh\s+api\b[^\n;&|]*\/pulls\/\d+\/(merge|reviews)\b/, "Merger ou approuver une PR via l'API est réservé à l'humain."],
  [/\bgh\s+(pr|issue)\s+(edit|create)\b[^\n;&|]*\barch-approved\b/, "Le label arch-approved est posé uniquement par l'humain après sa revue d'architecture."],
  [/\bgh\s+api\b[^\n;&|]*\blabels\b[^\n;&|]*\barch-approved\b/, "Le label arch-approved est posé uniquement par l'humain après sa revue d'architecture."],
  [/\bgit\s+(?:-C\s+\S+\s+)?(?:commit|push|merge|rebase|am)\b[^\n;&|]*\s--no-verify\b/, "--no-verify est interdit : corrige ce que les hooks git signalent."],
  [/\bprisma\s+migrate\s+reset\b/, "`prisma migrate reset` efface la base. Demande à l'humain de le lancer lui-même s'il le veut."],
  [/\bprisma\s+db\s+push\b[^\n;&|]*--(accept-data-loss|force-reset)\b/, "`prisma db push` avec perte de données est interdit. Crée une migration avec `prisma migrate dev --name ...`."],
];
for (const [re, msg] of rules) if (re.test(command)) block(msg);

// Analyse des `git push`, segment par segment.
const segments = command.split(/&&|\|\||;|\||\n/);
for (const seg of segments) {
  const tokens = seg.trim().split(/\s+/);
  const gi = tokens.indexOf('git');
  if (gi === -1) continue;
  // ignorer les options globales de git (ex. -C path)
  let i = gi + 1;
  while (i < tokens.length && tokens[i].startsWith('-')) i += tokens[i] === '-C' || tokens[i] === '-c' ? 2 : 1;
  if (tokens[i] !== 'push') continue;
  const rest = tokens.slice(i + 1);
  const flags = rest.filter((t) => t.startsWith('-'));
  const positional = rest.filter((t) => !t.startsWith('-'));

  const hardForce = flags.some((f) => f === '--force' || f === '-f' || (/^-[a-zA-Z]*f[a-zA-Z]*$/.test(f) && !f.startsWith('--')));
  if (hardForce) block('Force push interdit. Sur ta branche de feature, utilise --force-with-lease si un rebase l\'impose.');

  const refspecs = positional.slice(1);
  const targetsProtected = refspecs.some((r) => {
    const dst = r.includes(':') ? r.split(':').pop() : r;
    const name = dst.replace(/^\+/, '').replace(/^refs\/heads\//, '');
    return PROTECTED.has(name);
  });
  if (targetsProtected) block('Push direct sur main/master interdit. Pousse une branche dédiée et ouvre une PR.');

  if (refspecs.length === 0 && !flags.includes('--tags')) {
    const current = git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
    if (current && PROTECTED.has(current)) {
      block(`Tu es sur ${current} : crée une branche <type>/<issue>-<slug> avant de pousser.`);
    }
  }
}

process.exit(0);
