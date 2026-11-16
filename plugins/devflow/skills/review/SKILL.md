---
name: review
description: Revue indépendante d'une PR ou d'une branche par rapport à son issue, sa spec et son plan, via l'agent spec-reviewer. Affiche le rapport ; avec --comment, le publie comme commentaire de revue sur la PR (jamais d'approbation).
argument-hint: "[numéro de PR ou branche] [--comment]"
disable-model-invocation: true
---

# devflow : revue

Arguments : $ARGUMENTS

1. Identifie la cible : numéro de PR (`gh pr view <n> --json number,title,body,headRefName,files`) ou branche (par défaut la branche courante comparée à `origin/main`).
2. Retrouve l'issue liée (`Closes #n` dans la PR ou numéro dans le nom de branche), puis la spec et le plan référencés.
3. Délègue la revue à l'agent `devflow:spec-reviewer` avec : numéro d'issue, chemins spec et plan, branche à comparer. Il ne voit pas cette conversation, donne-lui tout ce dont il a besoin.
4. En parallèle, si la PR touche une zone sensible (voir `.github/arch-paths.txt`), prépare pour l'humain un résumé de ce qui change dans l'architecture et le modèle de données, comparé au plan approuvé.
5. Affiche le rapport : verdict, couverture des AC, écarts bloquants, remarques, et le résumé architecture.
6. Seulement si `--comment` est passé : publie le rapport avec `gh pr review <n> --comment --body-file <fichier>`. Jamais `--approve`, jamais `--request-changes` au nom de l'humain.

Pour faire corriger les écarts ensuite : `/devflow:feedback <n>`.
