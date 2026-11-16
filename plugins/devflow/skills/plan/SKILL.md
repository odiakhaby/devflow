---
name: plan
description: Transforme une spec validée en plan technique (architecture, modèle de données, contrats d'API, stratégie de test, découpage en tâches), le fait approuver par l'humain, puis crée les issues GitHub. Écrit docs/specs/NNN-slug/plan.md et les ADR nécessaires.
argument-hint: "<NNN ou chemin de la spec>"
disable-model-invocation: true
effort: high
---

# devflow : planifier

C'est ici que l'humain valide l'architecture et le modèle de données. Aucune issue n'est créée avant son approbation explicite.

Références : `${CLAUDE_PLUGIN_ROOT}/reference/conventions.md`, `${CLAUDE_PLUGIN_ROOT}/reference/testing.md`, `${CLAUDE_PLUGIN_ROOT}/reference/stack-defaults.md`. Modèles : `${CLAUDE_PLUGIN_ROOT}/templates/docs/plan.md`, `${CLAUDE_PLUGIN_ROOT}/templates/docs/adr.md`.

## 1. Préconditions

- Spec visée : $ARGUMENTS. Elle doit être au statut `Validée`. Sinon, arrête-toi et propose `/devflow:spec`.
- Lis la spec, le brief, les ADR existants (décisions à respecter) et le `CLAUDE.md`.

## 2. Explorer et concevoir

1. Explore le code concerné (délègue les recherches larges à un sous-agent d'exploration) : modules à réutiliser, patterns en place, schéma actuel.
2. Si la conception n'est pas triviale (nouveau modèle de données, nouvelle intégration, choix entre plusieurs approches), demande à l'agent `devflow:architect` 2-3 options argumentées, en lui passant la spec et le chemin de `stack-defaults.md`.
3. Retiens une option et sois prêt à expliquer pourquoi.

## 3. Rédiger le plan

Crée `docs/specs/NNN-slug/plan.md` à partir du modèle, statut `Brouillon` :

- **Modèle de données** : diff Prisma complet (modèles, relations, contraintes, index), nom de la migration, stratégie pour les données existantes, réversibilité.
- **Contrats d'API** : méthode, route, schéma d'entrée et de sortie, erreurs.
- **Stratégie de test** : chaque AC de la spec associé à un niveau de test et un fichier prévu.
- **Découpage en tâches** : chaque tâche livrable en une PR de moins de ~400 lignes, testable seule, dans l'ordre d'exécution. La migration de schéma est souvent une tâche à part, en premier. Marque les tâches qui touchent une zone sensible.

Pour chaque décision structurante (nouvelle dépendance, choix de modélisation, pattern d'architecture), crée un ADR `docs/adr/NNNN-slug.md` au statut `Proposé`.

## 4. Point de validation (obligatoire)

Présente à l'humain, de façon lisible en 5 minutes :

1. l'approche en 3 phrases et l'option écartée ;
2. le diff du modèle de données, en entier ;
3. les contrats d'API ;
4. les nouvelles dépendances ;
5. la liste des tâches (titre, AC, zone sensible oui/non) ;
6. les risques.

Demande explicitement : **approuver**, **modifier** (et quoi), ou **rejeter**. Itère jusqu'à approbation. Sans humain pour répondre (CI), arrête-toi ici : ne crée aucune issue.

## 5. Après approbation

1. Plan → `Approuvé (date)`, ADR concernés → `Accepté`. Commit sur une branche `docs/NNN-slug-plan` et ouvre une PR de documentation (son check `guard` demandera `arch-approved` si elle touche `docs/adr/`, ce qui formalise l'approbation).
2. Crée une issue `spec` (épique) : titre `Spec NNN — <titre>`, corps = lien vers spec et plan + liste à cocher des tâches.
3. Crée une issue `task` par tâche avec le contenu du template `task` : lien plan (tâche Tn), contexte, AC repris mot pour mot de la spec, plan de test, zone sensible, dépendances (`Dépend de #x`). Ajoute le label `needs-arch-review` aux tâches en zone sensible.
4. Mets à jour la liste à cocher de l'épique avec les numéros d'issues.
5. Si un GitHub Project est indiqué dans `CLAUDE.md` : `gh project item-add <numéro> --owner <owner> --url <url-issue>` pour chaque issue.

Termine par la liste des issues créées et la prochaine commande : `/devflow:build <première issue>` (ou le label `ready-for-claude` pour la faire tourner dans GitHub Actions).
