# 01 — Serveur Hono + Auth

**What to build:** Un serveur Hono autonome dans `protask/api/server.js` qui démarre, charge les données de démo en mémoire (mockData), expose `POST /api/_reset` pour réinitialiser l'état, et implémente les 3 routes d'authentification : register, login, logout. Le client (`protask/api/client.js`) expose `register()`, `login()`, `logout()` via fetch. Les tests e2e (`protask/api/e2e.spec.js`) couvrent le groupe auth avec `API_URL` configurable.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Serveur Hono démarre sur un port configurable
- [ ] mockData pré-chargé (users, boards, columns, cards, labels, comments, invitations)
- [ ] `POST /api/_reset` remet toutes les données à l'état initial
- [ ] `POST /api/auth/register` crée un utilisateur, retourne token + user
- [ ] `POST /api/auth/login` authentifie, retourne token + user
- [ ] `POST /api/auth/logout` (simple réponse 200)
- [ ] Auth protégée : routes sans token valide retournent 401
- [ ] `client.js` expose `register()`, `login()`, `logout()` avec les mêmes signatures que l'ancien `demoApi`
- [ ] Tests e2e auth : register succès, register doublon échoue, login succès, login mauvais mdp échoue
- [ ] `beforeEach` appelle `_reset`
- [ ] `API_URL` variable d'environnement (défaut `http://localhost:3001/api`)
