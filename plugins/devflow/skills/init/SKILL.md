---
name: init
description: Installe devflow dans un projet, nouveau ou existant. Détecte la stack, génère un CLAUDE.md court, les permissions, l'arborescence docs/, la CI, les templates GitHub et les labels. N'écrase jamais un fichier existant.
argument-hint: "[--dry-run]"
disable-model-invocation: true
---

# devflow : initialiser le projet

Conventions de référence : `${CLAUDE_PLUGIN_ROOT}/reference/conventions.md`. Lis-les avant de commencer.

## 1. État des lieux (sans rien modifier)

Détermine le mode :

- **Dossier vide ou presque** (pas de `package.json`, pas de code) → mode *nouveau projet*.
- **Code existant** → mode *projet existant*.

Collecte, en lisant le dépôt :

- gestionnaire de paquets (lockfile), monorepo ou non (workspaces, `turbo.json`), version de Node (`.nvmrc`, `engines`) ;
- frameworks (Next.js, Vite, Expo, Electron, Hono, Express, Angular), ORM (Prisma), base de données, tests (Vitest, Jest, Playwright), lint (ESLint, Biome) ;
- scripts `package.json` existants ;
- fichiers déjà présents : `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.github/workflows/`, `docs/` ;
- remote GitHub (`git remote -v`, `gh repo view --json nameWithOwner`) et état de `gh auth status`.

## 2. Mode nouveau projet

1. Si `docs/product/BRIEF.md` n'existe pas ou n'est pas `Validé`, propose de lancer `/devflow:discover` d'abord et arrête-toi : on ne choisit pas une stack sans savoir ce qu'on construit.
2. Si le brief est validé et qu'un ADR de stack existe, propose la commande officielle de création correspondante (ex. `pnpm create next-app`, `pnpm create expo-app`, `pnpm create hono`), en vérifiant la syntaxe actuelle dans la doc officielle. Lance-la seulement après accord.
3. Initialise git si besoin, puis continue en mode projet existant.

## 3. Mode projet existant

Présente d'abord un plan court : fichiers qui seront créés, fichiers existants qui seront complétés (jamais écrasés), commandes GitHub qui seront lancées. Attends l'accord.

Puis :

1. **Scaffold** — lance (ajoute `--dry-run` si l'argument est passé) :
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/scaffold.mjs" . --set GITHUB_OWNER=<owner> --set PM=<pnpm|npm|yarn|bun> --set PROJECT_NAME=<nom>`
   Le script affiche les fichiers créés et ceux ignorés car déjà présents.
2. **Fichiers ignorés** — pour chacun (souvent `CLAUDE.md`, `.claude/settings.json`, `ci.yml`), fusionne à la main le contenu utile du template dans le fichier existant, sans perdre ce qui y est déjà. Montre le diff.
3. **CLAUDE.md** — remplis-le avec les vraies commandes du projet (vérifiées en les lançant quand c'est rapide). Garde uniquement ce que Claude ne peut pas deviner en lisant le code : le fichier doit rester court (viser moins de 60 lignes, jamais plus de 200). Si un `AGENTS.md` existe, ne le duplique pas : fais pointer l'un vers l'autre.
4. **Contrat de scripts** — vérifie que `package.json` expose `typecheck`, `lint`, `test`, `check:fast`, `check` (voir `${CLAUDE_PLUGIN_ROOT}/reference/testing.md`). Propose les scripts manquants à partir des outils déjà installés ; n'installe aucune nouvelle dépendance sans accord. Ajoute un `.nvmrc` si absent.
5. **CI** — adapte `.github/workflows/ci.yml` et `claude.yml` au gestionnaire de paquets et à la structure (monorepo, services Postgres si les tests en ont besoin, Expo). Adapte `.github/arch-paths.txt` aux vrais chemins sensibles du projet.
6. **`.gitignore`** — vérifie que `.env*` (sauf `.env.example`), `.claude/settings.local.json` et `CLAUDE.local.md` sont ignorés.
7. **Vérification** — lance `check` et note le résultat. Si la base de code ne passe pas aujourd'hui, ne corrige rien : signale-le (le hook Stop insisterait sur un échec préexistant ; l'humain peut mettre `DEVFLOW_STOP_GATE=0` le temps d'assainir).

## 4. GitHub

Chacune de ces actions modifie le dépôt distant : liste-les et demande l'accord avant de les lancer.

1. Labels : `node "${CLAUDE_PLUGIN_ROOT}/scripts/setup-github.mjs"`.
2. GitHub Project (optionnel) : `gh project create --owner @me --title "<nom>"` puis `gh project link <numéro> --owner @me --repo <owner/repo>`. Le scope `project` est nécessaire (`gh auth refresh -s project`). Note le numéro dans `CLAUDE.md`.
3. Protection de `main` : proposer d'exiger les checks `check` et `guard`, d'interdire force push et suppression. Ne pas exiger de revue approuvée (les PR créées en local sont signées par l'humain lui-même, qui ne peut pas approuver sa propre PR). Rappeler que la protection de branche n'est pas disponible sur les dépôts privés du plan GitHub Free.
4. Claude dans GitHub Actions : rappeler à l'humain de lancer `/install-github-app` et de créer le secret `CLAUDE_CODE_OAUTH_TOKEN` (`claude setup-token`) ; ces étapes demandent ses identifiants, ne les fais pas à sa place.

## 5. Fin

Commit sur une branche `chore/devflow-init` (message `chore: set up devflow workflow`), push, PR. Résume en quelques lignes : ce qui a été créé, ce qui reste à faire par l'humain, et la prochaine commande (`/devflow:discover` ou `/devflow:spec <fonctionnalité>`).
