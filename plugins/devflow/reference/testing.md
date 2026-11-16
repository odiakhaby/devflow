# Stratégie de test devflow

## Boucle TDD utilisée par `build`

1. Lister les critères d'acceptation (AC) de l'issue et en déduire une liste de tests, du plus simple au plus complexe.
2. Écrire **un** test qui échoue. Le lancer et constater l'échec pour la bonne raison (garder la sortie).
3. Écrire le code minimal pour le faire passer. Relancer.
4. Refactorer avec les tests au vert.
5. Recommencer jusqu'à couvrir tous les AC, puis lancer la vérification complète.

Un test qui n'a jamais été vu rouge ne prouve rien.

## Traçabilité AC → tests

Chaque test qui couvre un critère cite son identifiant dans son nom :

```ts
describe('magic link login', () => {
  it('AC-1: sends a login email to a known address', async () => { /* … */ })
  it('AC-3: rejects an expired token with 401', async () => { /* … */ })
})
```

Le reviewer vérifie que chaque `AC-n` de l'issue apparaît dans au moins un test.

## Quel niveau pour quoi

- **Unitaire** : logique métier pure, calculs, validations Zod, reducers, hooks sans I/O.
- **Composant** : rendu et interactions, avec les états vide / chargement / erreur.
- **API** : chaque route avec cas nominal, validation (400), auth (401/403), not found (404).
- **Intégration BDD** : requêtes Prisma non triviales, transactions, contraintes d'unicité. Base jetable (Docker ou branche Neon), jamais la base de prod.
- **E2E (Playwright)** : uniquement les parcours critiques (inscription, paiement, création de l'objet principal). Peu nombreux, stables.

## Règles

- Tester le comportement, pas l'implémentation : pas d'assertion sur des détails internes.
- Pas de mock de ce qu'on possède quand un vrai test d'intégration est abordable ; mocker les services tiers (Resend, NimbaSMS, R2) à la frontière.
- Les tests doivent être déterministes : pas de dépendance à l'heure réelle, à l'ordre d'exécution ou au réseau.
- Un bug corrigé = un test de non-régression qui échouait avant la correction.
- Ne pas affaiblir ou supprimer un test existant pour faire passer la CI sans le signaler explicitement dans la PR.

## Scripts attendus dans `package.json`

devflow s'appuie sur ce contrat (adapter les commandes à la stack) :

| Script | Rôle |
| --- | --- |
| `typecheck` | `tsc --noEmit` (ou équivalent par package en monorepo) |
| `lint` | ESLint / Biome |
| `test` | tests unitaires et d'intégration |
| `check:fast` | sous-ensemble rapide (typecheck + lint + tests unitaires), utilisé par le hook Stop |
| `check` | vérification complète avant commit et en CI : typecheck + lint + test |
| `test:e2e` | Playwright, lancé en CI et avant les PR qui touchent un parcours critique |
