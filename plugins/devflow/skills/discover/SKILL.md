---
name: discover
description: Clarifie une idée de produit ou une demande client par un entretien structuré, challenge le périmètre et produit docs/product/BRIEF.md plus la liste des questions pour le client. À utiliser au démarrage d'un projet ou d'un gros chantier, avant toute spec.
argument-hint: "[idée en une phrase]"
effort: high
---

# devflow : clarifier l'idée

But : sortir d'ici avec un brief que l'humain valide, où le problème, les utilisateurs, le MVP et le hors scope sont nets. Tu es un product manager exigeant, pas un preneur de notes.

Références : `${CLAUDE_PLUGIN_ROOT}/reference/conventions.md`, `${CLAUDE_PLUGIN_ROOT}/reference/stack-defaults.md`. Modèle : `${CLAUDE_PLUGIN_ROOT}/templates/docs/brief.md`.

## 1. Lire avant de demander

- Lis `docs/product/sources/` (comptes-rendus client, mails, cahier des charges), un `BRIEF.md` existant, le README, et le code s'il y en a.
- Idée de départ : $ARGUMENTS
- Résume en 5 lignes ce que tu as compris et ce qui manque.

## 2. Entretien

Pose tes questions avec l'outil de questions à choix multiples, par lots de 4 maximum, en proposant des réponses plausibles. Ne pose jamais une question dont la réponse est déjà dans les sources. Couvre, dans cet ordre :

1. **Problème et utilisateurs** : qui souffre de quoi, aujourd'hui comment ils font, à quelle fréquence.
2. **Valeur** : pourquoi ils changeraient d'outil ; le résultat qui ferait dire « ça marche ».
3. **MVP** : le plus petit parcours qui délivre cette valeur de bout en bout. Classe chaque fonctionnalité en Must / Should / Could.
4. **Hors scope** : ce qu'on ne fait pas maintenant, écrit noir sur blanc.
5. **Contraintes** : plateformes (web, mobile, desktop, stores), délais, budget, données personnelles, intégrations (paiement, Resend, NimbaSMS, API du client), multi-tenant, rôles.
6. **Succès** : indicateurs mesurables.
7. **Risques** : l'hypothèse la plus risquée et le moyen le moins cher de la tester.

Challenge activement :
- Repousse le scope creep : pour chaque ajout, demande ce qu'on retire ou si ça peut attendre la v2.
- Signale les contradictions entre réponses.
- Quand une réponse relève du client et pas de l'humain, ne la devine pas : ajoute-la à `docs/product/questions-client.md`.

Arrête l'entretien quand tu peux remplir chaque section du brief sans inventer. Typiquement 2 à 4 lots de questions.

## 3. Rédiger

1. Écris `docs/product/BRIEF.md` à partir du modèle, statut `Brouillon`, dans la langue du projet (français par défaut). Concis : un brief se lit en 5 minutes.
2. Écris ou complète `docs/product/questions-client.md` : questions numérotées, regroupées par thème, formulées pour être envoyées telles quelles au client.
3. Si la stack n'est pas encore décidée, propose-la à partir de `stack-defaults.md` et des contraintes, et rédige `docs/adr/0001-stack.md` (statut `Proposé`) avec les options considérées.

## 4. Point de validation

Présente un résumé : la phrase de positionnement, le MVP en 5 puces, le hors scope, les 3 risques, la stack proposée, le nombre de questions client en attente. Demande explicitement : valider, modifier, ou attendre les réponses du client.

À la validation : passe le brief à `Validé (date)` et l'ADR à `Accepté`. Prochaine étape suggérée : `/devflow:init` (si le projet n'est pas encore initialisé) puis `/devflow:spec <première fonctionnalité du MVP>`.
