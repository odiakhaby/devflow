# {{PROJECT_NAME}}

{{Une phrase : ce que fait le produit et pour qui.}} Détails : `docs/product/BRIEF.md`.

## Commandes
- Installer : `{{PM}} install`
- Lancer en dev : `{{PM}} dev`
- Vérification complète (doit passer avant chaque commit) : `{{PM}} run check`
- Vérification rapide : `{{PM}} run check:fast`
- Un seul fichier de test : `{{PM}} exec vitest run path/to/file.test.ts`
- E2E : `{{PM}} run test:e2e`
- Nouvelle migration : `{{PM}} exec prisma migrate dev --name <nom>`

## Workflow
- Ce dépôt suit devflow : specs dans `docs/specs/NNN-slug/`, décisions dans `docs/adr/`, tâches en GitHub Issues.
- Langue des documents (specs, ADR, PR) : français. Code, commits, branches : anglais.
- GitHub Project : {{numéro ou "aucun"}}

## Conventions
<!-- Uniquement ce que Claude ne peut pas deviner en lisant le code. Exemples : -->
<!-- - Erreurs : utiliser les helpers de src/lib/errors.ts, jamais de throw de string -->
<!-- - src/legacy/ est encore en prod mais ne pas copier ses patterns -->

## Pièges
<!-- - Les tests d'intégration ont besoin de DATABASE_URL (voir .env.example) -->
