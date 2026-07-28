# 04 — Material Dark

**What to build:** Template ProTask thème Material Dark — visuel Material Design sombre (violet #bb86fc, cyan #03dac6, Roboto, elevation shadows, ripple) avec 5 vues complètes, drag & drop, dialogs, toasts, et couverture des 33 routes OpenAPI.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `protask/templates/material-dark/index.html` existe avec 5 vues, 5 `<template>`, DnD, dialog, toast, ripple effect sur les boutons
- [ ] Palette Material Dark appliquée : `--bg: #121212`, `--accent: #bb86fc`, `--secondary: #03dac6`, typo Roboto/system-ui, elevation shadows CSS
- [ ] `protask/templates/material-dark/material-dark.spec.js` existe avec 24 tests
- [ ] `data.js` enregistre le thème material-dark
- [ ] `npx playwright test protask/templates/material-dark/material-dark.spec.js` — 24/24 passed
