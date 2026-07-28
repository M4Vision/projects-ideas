# 02 — Timeout fetch 10s

**What to build:** Chaque helper fetch (`post`, `get`, `put`, `patch`, `del`) dans `protask/api/tester.js` doit utiliser `AbortSignal.timeout(10000)` pour qu'un serveur qui ne répond pas ne bloque pas la suite indéfiniment. Si le timeout est dépassé, le test est marqué `error` avec le message "Timeout dépassé (10s)" au lieu de rester bloqué.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Chaque helper fetch accepte un signal optionnel ou intègre AbortSignal.timeout(10000)
- [ ] Un fetch qui dépasse 10s est catché proprement et marque le test en `error`
- [ ] Tests passent toujours avec `pnpm test:api`