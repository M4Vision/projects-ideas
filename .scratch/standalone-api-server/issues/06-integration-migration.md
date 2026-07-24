# 06 — Intégration & Migration

**What to build:** Le template neo-brutalist bascule de `demo-api.js` vers `client.js`. `vite.config.js` est adapté pour lancer/proxyfier le serveur Hono. Les scripts `package.json` sont ajoutés (`test:api`, `dev:api`). `demo-api.js` est supprimé. Les tests e2e Playwright existants continuent de passer.

**Blocked by:** 01 — Serveur Hono + Auth, 02 — Boards & Colonnes, 03 — Cartes, 04 — Labels & Commentaires, 05 — Invitations

**Status:** ready-for-agent

- [ ] `vite.config.js` proxyfie les requêtes `/api` vers le serveur Hono
- [ ] Script `pnpm dev:api` lance le serveur Hono seul
- [ ] Script `pnpm test:api` lance le serveur + les tests Vitest API
- [ ] Template neo-brutalist importe `client.js` au lieu de `demo-api.js`
- [ ] Tous les appels `demoApi.*` dans le template fonctionnent via le client fetch
- [ ] `demo-api.js` supprimé
- [ ] Tests e2e Playwright (neo-brutalist.spec.js) toujours verts (33/33 routes)
- [ ] Tests API (e2e.spec.js) verts
