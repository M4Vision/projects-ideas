# 01 — Ajouter les 2 tests manquants

**What to build:** Deux tests manquants dans `protask/api/tester.js` par rapport à la référence `protask/api/e2e.spec.js` :

1. Auth #8 — Vérifie que les utilisateurs de démo existent au démarrage : `POST /auth/login` avec `alex@protask.dev` / `pass123` retourne un utilisateur nommé `Alexandre`
2. Invitations #12 — Vérifie qu'un non-propriétaire ne peut pas retirer un membre : un utilisateur tiers (Marc) reçoit 403 en tentant `DELETE /boards/:id/members/:userId`

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Auth test 8 ajouté dans la catégorie Authentification : login avec alex@protask.dev → user.name === 'Alexandre'
- [ ] Invitations test 12 ajouté dans la catégorie Invitations : Marc (non-owner) tente de retirer Sophie → 403
- [ ] `pnpm test:api` passe (51 → 53 tests)