# Task 4: Material Dark — thème Material Design sombre

## Acceptance Criteria

- [ ] `protask/templates/material-dark/index.html` existe avec 5 vues, 5 `<template>`, DnD, dialog, toast, ripple effect
- [ ] Palette Material Dark : `--bg: #121212`, `--accent: #bb86fc`, `--secondary: #03dac6`, typo Roboto, elevation shadows
- [ ] `protask/templates/material-dark/material-dark.spec.js` — 24 tests
- [ ] `data.js` enregistre le thème material-dark
- [ ] `npx playwright test protask/templates/material-dark/material-dark.spec.js` — 24/24 passed

## Spécifications

### Palette CSS
```css
--bg: #121212;
--bg-card: #1e1e1e;
--bg-secondary: #1a1a1a;
--fg: #e0e0e0;
--fg-secondary: #9e9e9e;
--accent: #bb86fc;
--accent-hover: #a070e0;
--accent-light: rgba(187, 134, 252, 0.12);
--secondary: #03dac6;
--green: #4caf50;
--red: #cf6679;
--orange: #ff9800;
--border: #2c2c2c;
--border-light: #252525;
--shadow: 0 1px 3px rgba(0,0,0,.3),0 1px 2px rgba(0,0,0,.24);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,.4),0 2px 4px -2px rgba(0,0,0,.3);
--radius: 4px;
--radius-sm: 2px;
--font: 'Roboto', system-ui, -apple-system, sans-serif;
```

### Éléments uniques du thème Material Dark
- **Ripple effect** sur les boutons : au clic, une ondulation circulaire en `var(--accent-light)` part du point de clic
- **Elevation shadows** : ombres Material Design sur les cartes, modales, dialogues
- **Bordures subtiles**, coins légèrement arrondis (4px)
- Typo Roboto (Google Material standard)
- Le bouton register texte : `"S'inscrire"`
- Mêmes IDs et architecture que corporate

### Ripple effect CSS
```css
.btn {
  position: relative;
  overflow: hidden;
}
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, var(--accent-light) 10%, transparent 10%);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 0%;
  transition: background-size 0.5s, opacity 0.5s;
}
.btn:active::after {
  background-size: 1000%;
  opacity: 0;
  transition: none;
}
```

### Tests

- Emails suffixe `-md@` (Material Dark). Ex: `e2e-md@test.com`
- `test.beforeAll` avec `await request.post('http://localhost:3001/api/_reset')`
- Nom du describe : `'ProTask material-dark'`
- 24 tests : 1 walkthrough + 7 UI + 16 API directe
- Texte bouton register : `"S'inscrire"`

### data.js

Ajouter dans `projectsData[0].themes` (après terminal) :
```js
{ id: 'material-dark', name: 'Material Dark', desc: 'Material Design sombre, violet/cyan, moderne', file: 'protask/templates/material-dark/index.html' },
```
