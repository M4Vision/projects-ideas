# 03 — Viewer polish

**What to build:** Corrections dans `viewer.js` et `index.html` suite à la revue de code :

1. Barre de progression : remplacer l'animation width par un état indéterminé (CSS animation) pour que l'utilisateur voit une activité pendant les tests
2. Import statique de `abortTests` : remplacer `await import()` dans `_abortTests` par un import en haut du fichier, à côté de `runTests`
3. Afficher expected/actual : dans le bloc d'erreur du test, ajouter `expected:` et `actual:` en plus du message (champs déjà capturés par AssertionError)
4. Nettoyer le scope creep : retirer `fetchRawJs` et `window.__getHL` de viewer.js si non documentés — ou les conserver et les justifier

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Barre de progression animée (indéterminée CSS)
- [ ] `abortTests` importé statiquement en haut de viewer.js, plus de `await import()` dans le handler
- [ ] Les détails d'erreur affichent `expected:` et `actual:` séparément
- [ ] `fetchRawJs` et `window.__getHL` retirés ou justifiés