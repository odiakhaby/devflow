# devflow

Plugin Claude Code pour développer de bout en bout avec l'IA, de l'idée floue à la PR prête à merger, en gardant l'humain aux commandes de l'architecture, du modèle de données et du merge.

| Commande | Rôle |
| --- | --- |
| `/devflow:discover [idée]` | Entretien produit → `docs/product/BRIEF.md` + questions client |
| `/devflow:init` | Installe devflow dans un projet neuf ou existant (CLAUDE.md, docs, CI, labels) |
| `/devflow:spec <fonctionnalité>` | Spec fonctionnelle avec critères d'acceptation `AC-n` |
| `/devflow:plan <NNN>` | Plan technique + ADR, validation humaine, puis création des issues |
| `/devflow:build <issue>` | TDD → vérification → revue IA → commits → PR avec preuves |
| `/devflow:review [pr]` | Revue indépendante par rapport à la spec |
| `/devflow:feedback <pr>` | Traite les retours de revue |
| `/devflow:adr <décision>` | Consigne une décision d'architecture |
| `/devflow:learn <leçon>` | Range une correction au bon endroit (CLAUDE.md, rule, skill, hook) |
| `/devflow:status` | Où en est le projet, quoi faire ensuite |

Agents : `devflow:spec-reviewer` (revue en lecture seule), `devflow:architect` (options d'architecture).

Hooks : blocage du merge/approbation de PR, du label `arch-approved`, des push sur `main`, du force push, de `--no-verify`, des commandes Prisma destructrices, de l'accès aux `.env`, de la modification de migrations versionnées ; quality gate `check:fast` avant la fin d'un tour.

## Installation

```
/plugin marketplace add <ton-user-github>/devflow
/plugin install devflow@oumar-plugins
```

Guide complet : voir le README à la racine du dépôt.
