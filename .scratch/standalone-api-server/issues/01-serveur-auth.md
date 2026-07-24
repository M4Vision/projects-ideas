# 01 — Serveur Hono + Auth

**What to build:** Un serveur Hono autonome dans `protask/api/server.js` qui démarre, charge les données de démo en mémoire (mockData), expose `POST /api/_reset` pour réinitialiser l'état, et implémente les 3 routes d'authentification : register, login, logout. Le client (`protask/api/client.js`) expose `register()`, `login()`, `logout()` via fetch. Les tests e2e (`protask/api/e2e.spec.js`) couvrent le groupe auth avec `API_URL` configurable.

**Blocked by:** None — can start immediately

**Status:** completed

- [x] Serveur Hono démarre sur un port configurable
- [x] mockData pré-chargé (users, boards, columns, cards, labels, comments, invitations)
- [x] `POST /api/_reset` remet toutes les données à l'état initial
- [x] `POST /api/auth/register` crée un utilisateur, retourne token + user
- [x] `POST /api/auth/login` authentifie, retourne token + user
- [x] `POST /api/auth/logout` (simple réponse 200)
- [x] Auth protégée : middlewaresans token valide retournent 401
- [x] `client.js` expose `register()`, `login()`, `logout()` avec les mêmes signatures que l'ancien `demoApi`
- [x] Tests e2e auth : register succès, register doublon échoue, login succès, login mauvais mdp échoue
- [x] `beforeEach` appelle `_reset`
- [x] `API_URL` variable d'environnement (défaut `http://localhost:3001/api`)
