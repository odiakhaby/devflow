---
name: build
description: Implémente une issue GitHub en TDD jusqu'à une PR prête à relire - branche, tests qui échouent puis code, vérification complète, revue par l'agent spec-reviewer, commits conventionnels, push, PR avec preuves, CI verte. Ne merge jamais.
argument-hint: "<numéro d'issue>"
disable-model-invocation: true
allowed-tools: Read Edit Write Grep Glob Agent Bash(git *) Bash(gh issue *) Bash(gh pr create *) Bash(gh pr view *) Bash(gh pr checks *) Bash(gh pr comment *) Bash(gh pr edit *) Bash(gh run view *) Bash(pnpm *) Bash(npm *) Bash(npx *) Bash(yarn *) Bash(bun *) Bash(node *)
---

# devflow : implémenter une issue

Références : `${CLAUDE_PLUGIN_ROOT}/reference/conventions.md` (Definition of Done, règle de déviation, mode sans humain) et `${CLAUDE_PLUGIN_ROOT}/reference/testing.md` (boucle TDD). Lis-les d'abord.

Détermine si un humain est présent : si la variable d'environnement `GITHUB_ACTIONS` ou `CI` vaut `true`, tu es en **mode sans humain** (pas de question interactive, voir les conventions).

## 1. Comprendre

1. `gh issue view $ARGUMENTS --json number,title,body,labels,comments`.
2. Lis la spec et le plan référencés. Le plan doit être `Approuvé` ; s'il ne l'est pas, ou si l'issue a le label `blocked`, arrête-toi et explique pourquoi.
3. Vérifie les dépendances (`Dépend de #x`) : si une issue requise n'est pas fermée, arrête-toi.
4. Reformule en quelques lignes : ce que tu vas livrer, la liste des AC, les fichiers probables, la liste ordonnée des tests à écrire. En mode interactif, ne demande pas de confirmation sauf si quelque chose est ambigu.

## 2. Branche

- Arbre de travail propre requis (`git status`). Sinon, arrête-toi et signale-le.
- `git fetch origin`, puis crée `<type>/<issue>-<slug>` depuis `origin/main` (ou reprends-la si elle existe déjà, ex. après un retour de revue).
- Astuce à rappeler à l'humain s'il lance plusieurs issues en parallèle : `claude -w <issue>-<slug>` crée une session isolée dans un worktree.

## 3. TDD

Pour chaque élément de ta liste de tests :

1. Écris un test qui échoue, nommé avec son `AC-n`. Lance **ce seul fichier** de test et constate l'échec pour la bonne raison. Garde la sortie pour la PR.
2. Écris le code minimal qui le fait passer. Relance.
3. Refactore si utile, tests au vert.
4. Commit dès qu'un ensemble cohérent passe : Conventional Commits en anglais, corps avec `Refs #<issue>`.

**Règle de déviation** : si tu as besoin de modifier le schéma de données, l'auth, une dépendance, un contrat d'API ou l'infra d'une façon que le plan approuvé ne prévoit pas, arrête-toi. En interactif, expose le besoin et les options et attends la décision. En mode sans humain, commente l'issue avec la question précise (`gh issue comment`) et termine sans ouvrir de PR.

Ne modifie pas un test existant pour le faire passer sans le justifier explicitement dans la PR.

## 4. Vérifier

1. Lance la vérification complète du projet (`check`, puis `build`, puis `test:e2e` si la tâche touche un parcours critique). Tout doit passer. Garde la fin des sorties.
2. Si l'interface change et qu'un navigateur est disponible, lance l'app et vérifie le parcours à la main (la commande `/verify` peut aider) ; joins une capture si possible.
3. Délègue la revue à l'agent `devflow:spec-reviewer` en lui donnant : numéro d'issue, chemins de la spec et du plan, branche. Corrige chaque écart bloquant, relance la vérification, et redemande une revue si les corrections sont importantes. Les remarques non bloquantes : corrige si c'est rapide et sûr, sinon liste-les dans la PR.

## 5. Pull request

1. `git push -u origin <branche>`.
2. `gh pr create` avec :
   - titre Conventional Commits ;
   - corps suivant `.github/pull_request_template.md` : `Closes #<issue>`, résumé, lien spec/plan, impact architecture coché honnêtement, chaque AC avec le test qui le couvre, **preuves** (commandes + fin de sortie), verdict du spec-reviewer, points d'attention pour l'humain (hypothèses prises, choix discutables) ;
   - le label `needs-arch-review` si la PR touche une zone sensible.
3. Suis la CI : `gh pr checks <pr> --watch`. Si un check échoue, lis le log (`gh run view <id> --log-failed`), corrige, pousse. Trois tentatives au maximum, ensuite décris le problème dans un commentaire de PR et arrête-toi. Le check `guard` rouge en attente de `arch-approved` est normal : c'est l'humain qui le débloque.

## 6. Rendre la main

Résume en quelques lignes : lien de la PR, ce qui est livré, les preuves clés, ce que l'humain doit regarder en priorité (surtout architecture et modèle de données). Ne merge pas, n'approuve pas, ne pose pas `arch-approved`.
