# 03 — Classic Terminal

**What to build:** Template ProTask thème Classic Terminal — visuel hacker (vert #00ff00 sur noir, typo monospace, curseur clignotant) avec 5 vues complètes, drag & drop, dialogs, toasts, et couverture des 33 routes OpenAPI.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `protask/templates/terminal/index.html` existe avec 5 vues, 5 `<template>`, DnD, dialog, toast
- [ ] Palette Terminal appliquée : `--bg: #000`, `--accent: #00ff00`, typo Courier New / monospace, curseur clignotant sur les inputs
- [ ] `protask/templates/terminal/terminal.spec.js` existe avec 24 tests
- [ ] `data.js` enregistre le thème terminal
- [ ] `npx playwright test protask/templates/terminal/terminal.spec.js` — 24/24 passed
