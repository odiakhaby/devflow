---
name: spec
description: Rédige la spec fonctionnelle d'une fonctionnalité (user stories, critères d'acceptation AC-n testables, cas limites) après un entretien ciblé. Produit docs/specs/NNN-slug/spec.md. À utiliser avant de planifier ou coder une fonctionnalité.
argument-hint: "<fonctionnalité ou numéro d'issue>"
effort: high
---

# devflow : spécifier une fonctionnalité

La spec décrit le QUOI, jamais le COMMENT : pas de nom de table, de route ou de librairie ici (ça va dans le plan).

Références : `${CLAUDE_PLUGIN_ROOT}/reference/conventions.md`. Modèle : `${CLAUDE_PLUGIN_ROOT}/templates/docs/spec.md`.

## 1. Contexte

- Fonctionnalité demandée : $ARGUMENTS (si c'est un numéro, lis l'issue avec `gh issue view`).
- Lis `docs/product/BRIEF.md`, les specs existantes dans `docs/specs/` (pour ne pas dupliquer et garder la cohérence), et le code concerné s'il existe.
- Si le brief n'existe pas, ce n'est pas bloquant pour un projet existant : appuie-toi sur le code et le README.
- Vérifie que la fonctionnalité est dans le périmètre du brief. Sinon, signale-le avant d'aller plus loin.

## 2. Entretien

Questions à choix multiples, par lots de 4 maximum, uniquement sur ce que le code et les docs ne disent pas :

- qui l'utilise et dans quel parcours ;
- le comportement attendu dans le cas nominal ;
- les règles métier (limites, calculs, états, transitions) ;
- les erreurs et cas limites : entrée invalide, droits insuffisants, doublons, service tiers en panne, données vides ;
- ce qui est explicitement hors scope ;
- les exigences non fonctionnelles qui comptent vraiment (perf, RGPD, accessibilité).

Arrête quand chaque critère d'acceptation peut s'écrire sans ambiguïté.

## 3. Rédiger

1. Numéro : plus grand `NNN` existant dans `docs/specs/` + 1. Slug court en anglais.
2. Crée `docs/specs/NNN-slug/spec.md` à partir du modèle, statut `Brouillon`.
3. Critères d'acceptation : format **AC-n — Étant donné / quand / alors**, un comportement observable par critère, chacun vérifiable par un test automatisé. Les cas d'erreur importants sont aussi des AC.
4. Liste les questions ouvertes restantes plutôt que de les trancher toi-même.

## 4. Point de validation

Présente : les user stories, la liste des AC (titres seulement), le hors scope, les questions ouvertes. Demande : valider, modifier ou compléter.

À la validation : statut `Validée (date)`. Prochaine étape : `/devflow:plan NNN`.
