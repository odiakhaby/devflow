---
name: learn
description: Transforme une correction ou une leçon apprise en règle durable au bon endroit - CLAUDE.md, règle ciblée .claude/rules/, skill de projet, ou hook/permission si la règle ne souffre aucune exception.
argument-hint: "<ce qu'il faut retenir>"
disable-model-invocation: true
---

# devflow : capitaliser une leçon

Leçon : $ARGUMENTS (si vide, prends la dernière correction faite par l'humain dans cette conversation).

## 1. Faut-il l'écrire ?

N'écris rien si Claude peut retrouver l'information en lisant le code et irait effectivement la chercher. Écris si c'est une décision hors du dépôt, un piège trompeur, une commande non évidente, ou une correction déjà faite deux fois.

## 2. Choisir la destination

| Nature de la règle | Destination |
| --- | --- |
| Guideline générale, courte, utile à presque chaque tâche | `CLAUDE.md` (une ligne) |
| Guideline qui ne concerne qu'une partie du code | `.claude/rules/<sujet>.md` avec un filtre `paths:` |
| Procédure en plusieurs étapes (release, ajout d'un module type) | `.claude/skills/<nom>/SKILL.md` du projet |
| Règle sans aucune exception (« jamais », « toujours ») | hook dans `.claude/settings.json` ou règle `deny` des permissions |
| Préférence personnelle de l'humain, pas du projet | `CLAUDE.local.md` (ignoré par git) |

Une ligne qu'on doit écrire en MAJUSCULES pour qu'elle soit suivie appartient probablement à un hook. Un hook qui encode une simple préférence devrait redevenir une ligne de `CLAUDE.md`.

## 3. Appliquer

1. Rédige la règle de façon factuelle et précise (fichier, commande, exemple), sans emphase.
2. Vérifie qu'elle ne contredit pas une règle existante ; sinon, remplace l'ancienne.
3. Garde `CLAUDE.md` court : si une section grossit, déplace-la vers `.claude/rules/` ou une skill.
4. Pour un hook ou une permission : montre la configuration, explique comment la tester, et attends l'accord avant d'écrire dans `.claude/settings.json`.
5. Montre le diff. Commit `docs(claude): …` ou `chore(claude): …` sur la branche courante si elle n'est pas `main`, sinon laisse le changement non commité et dis-le.
