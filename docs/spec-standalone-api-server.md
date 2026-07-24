# Spec — Serveur API autonome par projet

## Problem Statement

Chaque projet (ProTask, ShopFlow, etc.) a actuellement un fichier `demo-api.js` qui centralise :
- les données de démonstration (mockData)
- toutes les méthodes API asynchrones (36 pour ProTask)
- des tests intégrés (62 pour ProTask) dans la même page

Ce couplage pose plusieurs problèmes :
- Pas possible de tester l'API sans charger le fichier JS complet dans un navigateur
- Pas possible de substituer une vraie implémentation backend
- Pas de contrat exécutable entre templates et serveur
- Les tests des routes et les tests UI partagent le même runtime (`page.evaluate`)
- Impossible de tester un autre serveur qui implémente la même API

## Solution

Chaque projet se voit doter d'un dossier `api/` contenant trois fichiers :
1. **Serveur Hono** autonome (fichier unique) — expose les routes OpenAPI avec des données en mémoire
2. **Client API** (wrapper fetch) — expose les mêmes noms de méthode que l'ancien `demoApi` pour que les templates changent 0 ligne
3. **Tests e2e API** (Vitest, fichier unique) — appellent le serveur via HTTP, testent le contrat OpenAPI complet

Les tests sont indépendants du serveur : la même batterie peut tourner contre n'importe quelle implémentation qui respecte le contrat OpenAPI.

## User Stories

1. En tant que développeur de template, je veux appeler `api.getBoards()` comme avant, sans changer mon code, pour que la migration soit transparente.
2. En tant que développeur de template, je veux que les appels API passent par HTTP (fetch), pour pouvoir un jour basculer vers un vrai backend.
3. En tant que testeur e2e, je veux tester l'API via HTTP sans navigateur, pour isoler les bugs backend des bugs UI.
4. En tant que testeur e2e, je veux lancer les mêmes tests contre mon serveur local ou un serveur distant, pour valider n'importe quelle implémentation du contrat.
5. En tant que testeur e2e, je veux réinitialiser l'état du serveur entre chaque test, pour garantir l'isolation.
6. En tant que développeur d'un nouveau projet, je veux suivre le même pattern (serveur + client + tests), pour avoir une structure cohérente dans tout le repo.
7. En tant que développeur, je veux que le serveur pré-charge des données de démo, pour que les templates fonctionnent sans setup.
8. En tant que développeur, je veux que les routes API respectent le contrat OpenAPI, pour que la spec soit la source de vérité.
9. En tant que développeur API, je veux que le serveur tienne dans un seul fichier, pour pouvoir le comprendre et le modifier rapidement.
10. En tant que développeur API, je veux que les tests tiennent dans un seul fichier, pour les lancer sans chercher dans plusieurs endroits.
11. En tant que développeur API, je veux que l'authentification soit simulée via un header `Authorization: Bearer token-{userId}`, pour tester les routes protégées sans vraie session.
12. En tant que mainteneur, je veux que les tests API soient indépendants du serveur, pour pouvoir réimplémenter le serveur sans réécrire les tests.
13. En tant que développeur de CI, je veux pouvoir lancer le serveur puis les tests avec une commande, pour intégrer ça dans le pipeline.
14. En tant que développeur, je veux ajouter de nouvelles routes à l'API en modifiant un seul fichier (le serveur), pour minimiser le nombre de fichiers impactés.
15. En tant que développeur, je veux que chaque projet ait son propre serveur isolé, pour ne pas mélanger les données entre projets.

## Implementation Decisions

### Architecture par projet

Chaque projet racine (`protask/`, `shopflow/`, etc.) contient un dossier `api/` avec :

- **server.js** : serveur Hono, fichier unique, 19 routes OpenAPI pour ProTask. Les données sont stockées en mémoire (tableaux JS). Pré-charge les mêmes données de démonstration que l'ancien `mockData`.
- **client.js** : wrapper fetch. Exporte un objet avec les mêmes noms de méthodes que `demoApi`. Chaque méthode appelle `fetch()` sur `http://localhost:3001/api/...` et parse la réponse JSON. Les templates importent ce client au lieu de `demo-api.js`.
- **e2e.spec.js** : tests Vitest. Un seul fichier. Utilise `API_URL` (défaut `http://localhost:3001/api`). Structure en `describe` par groupe logique (auth, boards, columns & cards, labels & comments, invitations). Appelle `POST /api/_reset` dans `beforeEach`.

### Routes

Le serveur implémente les routes exactement comme définies dans le contrat OpenAPI du projet (19 routes pour ProTask). Une seule route supplémentaire : `POST /api/_reset` qui ramène les données à l'état initial. Cette route n'apparaît pas dans l'OpenAPI contract.

### Authentification

Token simulé : `Authorization: Bearer token-{userId}`. Le serveur lit le header, extrait l'userId, et l'utilise pour identifier l'utilisateur courant. Pas de vraie vérification cryptographique. Le `POST /auth/login` retourne le token.

### Réinitialisation des données

`POST /api/_reset` remet toutes les données en mémoire à leur état de départ (identique au `mockData` initial). Appelée dans le `beforeEach` de chaque test Vitest pour garantir l'isolation.

### Configuration du serveur de développement

Le `vite.config.js` doit être capable de lancer ou proxyfier le serveur Hono selon le projet actif. Un script `pnpm test:api` lance le serveur + les tests Vitest en séquence. Un script `pnpm dev:api` lance le serveur seul pour le développement des templates.

## Testing Decisions

### Seam

Un seul seam : **les tests appellent le serveur via HTTP (fetch)**. Pas de mock, pas d'intercept, pas de require direct du serveur. Les tests sont une boîte noire qui valide le contrat OpenAPI depuis l'URL configurée.

### Prior art

Les tests e2e Playwright actuels (neo-brutalist.spec.js) ont déjà validé que les 19 routes sont appelables. Les nouveaux tests API remplacent le besoin de `page.evaluate()` pour valider les routes — ils tournent sans navigateur.

### Ce qu'un bon test couvre

- Chaque route OpenAPI est appelée au moins une fois (succès)
- Les erreurs attendues sont testées (404, 401, validation)
- Les chemins happy path sont testés (CRUD complet)
- Les tests sont indépendants du serveur (même batterie, autre serveur)

### Fichiers testés

- `protask/api/server.js` via `protask/api/e2e.spec.js`
- Extensible à `shopflow/api/server.js` via `shopflow/api/e2e.spec.js`

## Out of Scope

- Base de données persistante (tout est en mémoire)
- Sécurité réelle (auth token simulé, pas de hash, pas de JWT)
- Interface utilisateur (c'est une spec API uniquement)
- Déploiement serveur (le serveur sert seulement au développement et aux tests)
- Migration des templates `demo-api.js` → `client.js` (détaillée dans les tickets d'implémentation)

## Further Notes

- L'ADR `docs/adr/0001-standalone-api-server.md` documente la décision architecturale
- Le glossaire dans `CONTEXT.md` a été mis à jour avec les nouveaux termes
- Le pattern s'applique à tous les projets du repo (`protask/`, puis `shopflow/`)
