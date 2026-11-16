---
name: feedback
description: Traite les retours d'une revue de PR (commentaires généraux et inline de l'humain ou de reviewers IA) - corrige, vérifie, pousse et répond à chaque commentaire. Ne merge jamais.
argument-hint: "<numéro de PR>"
disable-model-invocation: true
---

# devflow : traiter les retours de revue

PR : $ARGUMENTS

1. Récupère tout le contexte :
   - `gh pr view <n> --json title,body,headRefName,reviews,comments` ;
   - commentaires inline : `gh api repos/{owner}/{repo}/pulls/<n>/comments` ;
   - état de la CI : `gh pr checks <n>`.
2. Place-toi sur la branche de la PR, à jour (`git fetch` puis `git switch` / `git pull --ff-only`).
3. Liste les retours sous forme de tableau : commentaire, auteur, action prévue (corriger / répondre sans changer / question à l'humain). Les retours de l'humain priment sur ceux des reviewers IA. Si un retour IA te semble faux, ne l'applique pas : explique pourquoi dans ta réponse.
4. Si un retour demande un changement d'architecture ou de modèle de données non prévu par le plan, applique la règle de déviation (`${CLAUDE_PLUGIN_ROOT}/reference/conventions.md`) : demande avant de faire.
5. Corrige en TDD quand le retour révèle un bug (d'abord un test qui le reproduit). Commits Conventional Commits (`fix(scope): …` ou `refactor(scope): …`) avec `Refs #<issue>`.
6. Lance la vérification complète, pousse, suis la CI comme dans `/devflow:build`.
7. Réponds à chaque commentaire traité (référence du commit ou explication), puis poste un commentaire de synthèse sur la PR avec les preuves de vérification.

Termine par un résumé : retours traités, retours contestés et pourquoi, questions en attente pour l'humain.
