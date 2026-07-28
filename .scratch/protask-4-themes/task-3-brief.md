# Task 3: Classic Terminal — thème hacker monospace

## Acceptance Criteria

- [ ] `protask/templates/terminal/index.html` existe avec 5 vues, 5 `<template>`, DnD, dialog, toast
- [ ] Palette Terminal : `--bg: #000`, `--accent: #00ff00`, typo Courier New / monospace, curseur clignotant
- [ ] `protask/templates/terminal/terminal.spec.js` — 24 tests
- [ ] `data.js` enregistre le thème terminal
- [ ] `npx playwright test protask/templates/terminal/terminal.spec.js` — 24/24 passed

## Spécifications

### Palette CSS
```css
--bg: #000;
--bg-card: #0a0a0a;
--bg-secondary: #050505;
--fg: #00ff00;
--fg-secondary: #00cc00;
--accent: #00ff00;
--accent-hover: #00cc00;
--accent-light: rgba(0, 255, 0, 0.1);
--green: #00ff00;
--red: #ff4444;
--orange: #ff8800;
--border: #1a1a1a;
--border-light: #111;
--shadow: none;
--shadow-md: none;
--radius: 0;
--radius-sm: 0;
--font: 'Courier New', 'Fira Code', 'Consolas', monospace;
```

### Éléments uniques du thème Terminal
- Curseur clignotant sur les inputs : `caret-color: #00ff00; animation: blink 1s step-end infinite;`
- Bordures fines (1px solid)
- Pas d'ombres (flat design terminal)
- Coins carrés (radius: 0)
- Le bouton register texte : `"S'inscrire"`
- Mêmes IDs et architecture que corporate

### Tests

- Emails suffixe `-t@` (Terminal). Ex: `e2e-t@test.com`
- `test.beforeAll` avec `await request.post('http://localhost:3001/api/_reset')`
- Nom du describe : `'ProTask terminal'`
- 24 tests : 1 walkthrough + 7 UI + 16 API directe
- Texte bouton register : `"S'inscrire"`

### data.js

Ajouter dans `projectsData[0].themes` (après gold-noir) :
```js
{ id: 'terminal', name: 'Terminal', desc: 'Vert sur noir, typo mono, style hacker', file: 'protask/templates/terminal/index.html' },
```
