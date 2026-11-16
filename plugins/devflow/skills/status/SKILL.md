---
name: status
description: Tableau de bord du projet devflow - specs et leur statut, issues ouvertes par état, PR en attente de revue ou d'arch-approved, CI rouge. À utiliser pour savoir où en est le projet et quoi faire ensuite.
---

# devflow : où en est le projet

Collecte (lecture seule) :

1. Statut de chaque `docs/specs/*/spec.md` et `plan.md` (deuxième ligne), et des ADR `Proposé`.
2. `gh issue list --state open --label spec --json number,title`.
3. `gh issue list --state open --label task --json number,title,labels,assignees`.
4. `gh pr list --state open --json number,title,headRefName,labels,isDraft,statusCheckRollup,reviewDecision`.
5. Branche courante et `git status --short`.

Affiche, de façon compacte :

- **À décider par l'humain** : specs `Brouillon` à valider, plans à approuver, ADR `Proposé`, PR avec `needs-arch-review` sans `arch-approved`, PR prêtes à merger (CI verte).
- **En cours** : PR ouvertes avec l'état de leur CI.
- **Prêt à implémenter** : issues `task` sans PR liée, sans `blocked`, dont les dépendances sont fermées, dans l'ordre du plan.
- **Bloqué** : issues `blocked` et pourquoi.

Termine par la ou les deux prochaines actions les plus utiles, avec la commande exacte (ex. `/devflow:build 42`).
