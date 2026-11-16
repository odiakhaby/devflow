# Stack par défaut d'Oumar

Point de départ pour les recommandations de stack (`discover`, `plan`). Ce sont des défauts, pas des obligations : le besoin du projet décide, et chaque choix structurant est consigné dans un ADR. Avant de recommander une version ou une API précise d'une librairie, vérifier sa documentation officielle actuelle.

## Par type de projet

| Besoin | Défaut | Alternatives à considérer |
| --- | --- | --- |
| App web avec SEO / SSR | Next.js (App Router) + TypeScript | React + Vite si SPA pure |
| Back-office / SPA | React + Vite + TanStack Router/Query | Next.js si besoin de server actions |
| API séparée | Hono | Express (écosystème, code existant) |
| Mobile | React Native + Expo (EAS pour les stores) | — |
| Desktop | Electron | — |
| Projet client Angular | Angular | — |

## Briques transverses

| Sujet | Défaut |
| --- | --- |
| UI | Tailwind CSS + shadcn/ui |
| État serveur | TanStack Query |
| État client | Zustand (Redux Toolkit si existant ou état très complexe) |
| Validation | Zod, schémas partagés front/back |
| ORM | Prisma |
| Base de données | PostgreSQL (Neon) ; MongoDB si modèle documentaire justifié ; SQLite pour local/embarqué |
| Auth | better-auth |
| Emails transactionnels | Resend |
| SMS | NimbaSMS |
| Fichiers | Cloudflare R2 (Backblaze B2 pour archivage/sauvegardes) |
| Logs prod | Splunk |
| Déploiement | Docker + Dokploy (déjà en place, hors périmètre devflow) |
| CI | GitHub Actions |

## Tests

| Niveau | Web / Node | Mobile |
| --- | --- | --- |
| Unitaire | Vitest | Jest (preset jest-expo) |
| Composant | Testing Library | React Native Testing Library |
| API | `app.request()` (Hono) / supertest (Express) | — |
| Intégration BDD | Postgres en Docker (ou branche Neon dédiée) | — |
| E2E | Playwright | Maestro (à évaluer) |

## Questions à trancher pour chaque nouveau projet

- Monorepo (pnpm workspaces / Turborepo) ou dépôts séparés si web + mobile + API ?
- Gestionnaire de paquets : pnpm par défaut.
- Multi-tenant ? Rôles ? → impacte le modèle de données dès le départ.
- Données personnelles, hébergement, RGPD ?
- Publication sur les stores (comptes Apple/Google, délais de review) ?
