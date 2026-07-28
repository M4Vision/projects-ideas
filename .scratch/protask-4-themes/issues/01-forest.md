# 01 — Forest

**What to build:** Template ProTask thème Forest — visuel nature boisée (verts profonds, brun boisé, serif) avec 5 vues complètes, drag & drop, dialogs, toasts, et couverture des 33 routes OpenAPI.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `protask/templates/forest/index.html` existe avec 5 vues (login, dashboard, board, settings, profile), 5 `<template>` elements (tmpl-card, tmpl-comment, tmpl-settings-col, tmpl-settings-label, tmpl-label-badge), DnD, dialog, toast
- [ ] Palette Forest appliquée : `--bg: #1b3d2b`, `--accent: #8fbc8f`, typo Georgia/serif
- [ ] `protask/templates/forest/forest.spec.js` existe avec 24 tests (1 walkthrough 33 routes + 7 UI + 16 API directe)
- [ ] `data.js` enregistre le thème forest
- [ ] `npx playwright test protask/templates/forest/forest.spec.js` — 24/24 passed
