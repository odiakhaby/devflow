# Conventions devflow

Référence partagée par toutes les skills devflow. Le `CLAUDE.md` d'un projet peut surcharger n'importe quel point ici : en cas de conflit, le projet gagne.

## Rôles

- **Humain (Oumar)** : décide du périmètre, valide le brief, les specs, l'architecture, le modèle de données, et merge les PR. C'est lui qui a le dernier mot.
- **Claude** : clarifie, rédige, propose des options argumentées, implémente en TDD, vérifie, ouvre et met à jour les PR. Ne merge jamais, n'approuve jamais une PR.

## Les 4 points de validation humaine

1. **Brief validé** (`docs/product/BRIEF.md`, statut `Validé`) : on sait quoi construire et pourquoi.
2. **Spec validée** (`docs/specs/NNN-slug/spec.md`, statut `Validée`) : critères d'acceptation non ambigus.
3. **Plan approuvé** (`plan.md` statut `Approuvé` + ADR `Accepté`) : architecture et modèle de données validés. Les issues ne sont créées qu'après.
4. **PR mergée par l'humain** : après lecture du diff, des preuves de vérification et, si la PR touche une zone sensible, ajout du label `arch-approved`.

Claude ne passe jamais une étape sans la validation explicite de la précédente.

## Arborescence des documents

```
docs/
  product/
    BRIEF.md              # vision, utilisateurs, MVP, hors scope
    questions-client.md   # questions dont la réponse doit venir du client
    sources/              # comptes-rendus, mails, cahier des charges bruts
  specs/
    NNN-slug/
      spec.md             # le QUOI (fonctionnel)
      plan.md             # le COMMENT (technique) + découpage en tâches
  adr/
    NNNN-slug.md          # une décision d'architecture par fichier
```

- Numérotation : `NNN` sur 3 chiffres pour les specs, `NNNN` sur 4 chiffres pour les ADR, en prenant le plus grand numéro existant + 1.
- `slug` : kebab-case, en anglais, court (`user-auth`, `invoice-export`).
- Langue des documents : celle indiquée dans le `CLAUDE.md` du projet (français par défaut). Code, identifiants, noms de branches et messages de commit : anglais.

## Statuts

| Document | Statuts |
| --- | --- |
| BRIEF | `Brouillon` → `Validé` |
| spec | `Brouillon` → `Validée` → `Livrée` |
| plan | `Brouillon` → `Approuvé` → `Livré` |
| ADR | `Proposé` → `Accepté` → (`Remplacé par NNNN` / `Abandonné`) |

Le statut figure sur la deuxième ligne du document : `Statut : Validée (2026-11-16)`.

## Zones sensibles (architecture et modèle)

Toute modification dans ces zones exige une décision humaine explicite (plan approuvé ou question posée) :

- schéma de base de données, migrations, index, contraintes (Prisma, SQL, Mongo) ;
- authentification, autorisation, sessions, rôles (better-auth, middlewares) ;
- ajout, suppression ou montée de version majeure d'une dépendance ;
- contrats d'API publics (routes, payloads, codes d'erreur) consommés par un front ou une app mobile ;
- infra : Dockerfile, CI, variables d'environnement, services tiers (Resend, NimbaSMS, R2, Backblaze) ;
- stockage de données personnelles (RGPD).

**Règle de déviation** : pendant `build`, si le travail demande un changement dans une zone sensible qui n'est pas dans le plan approuvé, Claude s'arrête et pose la question (en interactif) ou commente l'issue et s'arrête (en CI). Il ne contourne pas.

## Labels GitHub

| Label | Sens |
| --- | --- |
| `spec` | issue « épique » qui suit une spec et la liste de ses tâches |
| `task` | tâche implémentable en une PR |
| `bug` | anomalie |
| `needs-arch-review` | touche une zone sensible, revue d'archi requise |
| `arch-approved` | posé par l'humain sur une PR après revue d'archi |
| `ready-for-claude` | l'humain autorise Claude à implémenter l'issue dans GitHub Actions |
| `blocked` | en attente d'une décision ou d'une dépendance |

## Git

- Branche : `<type>/<issue>-<slug>`, ex. `feat/42-magic-link-login`. Types : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`.
- Toujours partir de `origin/main` à jour. Jamais de commit direct sur `main`.
- Commits : [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/), en anglais, à l'impératif : `feat(auth): add magic link login`. Corps : le pourquoi, et `Refs #42`.
- Commits petits et cohérents (un test + son implémentation, une migration seule, etc.).
- Pas de `--no-verify`, pas de force push sur `main`. `--force-with-lease` toléré sur sa propre branche après un rebase.

## Pull requests

- Une issue = une PR. Titre au format Conventional Commits. Corps = template `.github/pull_request_template.md` rempli, avec `Closes #N`.
- Taille visée : moins de ~400 lignes modifiées hors fichiers générés et lockfiles. Au-delà, découper.
- La PR contient les **preuves** : commandes lancées et leur sortie (tests, typecheck, lint, build), captures si UI.
- Claude ouvre la PR prête à relire (pas en brouillon) une fois la vérification locale verte, pour que la CI et la revue tournent.

## Definition of Done (une tâche)

- [ ] Chaque critère d'acceptation de l'issue a au moins un test dont le nom cite son identifiant (`AC-2: …`).
- [ ] La vérification complète du projet passe (`check` + `build`), sortie collée dans la PR.
- [ ] L'agent `devflow:spec-reviewer` ne remonte aucun écart bloquant.
- [ ] Docs à jour si le comportement visible change (spec, README, `.env.example`, ADR).
- [ ] Aucun `TODO` sans issue associée.
- [ ] La CI de la PR est verte.

## Mode sans humain (GitHub Actions, `CI=true` ou `GITHUB_ACTIONS=true`)

- Ne pas poser de question interactive : prendre la lecture la plus raisonnable, l'écrire en tête de la PR.
- Toute décision irréversible ou en zone sensible hors plan : commenter l'issue avec la question précise et s'arrêter.
- Jamais de merge, jamais d'approbation.
