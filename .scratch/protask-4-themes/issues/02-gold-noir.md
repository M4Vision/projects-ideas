# 02 — Gold & Noir

**What to build:** Template ProTask thème Gold & Noir — visuel luxe (noir profond, accents dorés, Playfair Display) avec 5 vues complètes, drag & drop, dialogs, toasts, et couverture des 33 routes OpenAPI.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `protask/templates/gold-noir/index.html` existe avec 5 vues, 5 `<template>`, DnD, dialog, toast
- [ ] Palette Gold & Noir appliquée : `--bg: #0a0a0a`, `--accent: #d4af37`, typo Playfair Display
- [ ] `protask/templates/gold-noir/gold-noir.spec.js` existe avec 24 tests
- [ ] `data.js` enregistre le thème gold-noir
- [ ] `npx playwright test protask/templates/gold-noir/gold-noir.spec.js` — 24/24 passed
