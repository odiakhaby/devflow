---
name: adr
description: Consigne une décision d'architecture dans docs/adr/NNNN-slug.md (contexte, options, décision, conséquences). À utiliser dès qu'un choix structurant est fait ou proposé - stack, modélisation, dépendance, pattern, service tiers.
argument-hint: "<décision à consigner>"
---

# devflow : ADR

Décision : $ARGUMENTS

1. Lis `docs/adr/` pour éviter un doublon et repérer un ADR que celui-ci remplacerait.
2. Numéro : plus grand `NNNN` existant + 1. Slug court en anglais.
3. Rédige `docs/adr/NNNN-slug.md` à partir de `${CLAUDE_PLUGIN_ROOT}/templates/docs/adr.md`, dans la langue du projet :
   - le contexte et les contraintes réelles, pas génériques ;
   - au moins deux options sérieuses, avec leurs inconvénients honnêtes ;
   - la décision et sa raison principale ;
   - les conséquences, y compris la dette acceptée et le signal qui ferait revoir la décision.
4. Statut `Proposé`, sauf si l'humain a déjà tranché explicitement dans cette conversation : alors `Accepté (date)`.
5. Si cet ADR en remplace un autre, passe l'ancien à `Remplacé par NNNN` sans réécrire son contenu.
6. Ajoute une ligne au tableau de `docs/adr/README.md`.

Un ADR fait une page au plus. Si tu as besoin de plus, c'est probablement deux décisions.
