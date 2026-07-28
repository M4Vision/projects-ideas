# Task 2: Gold & Noir — thème luxe doré

## Acceptance Criteria

- [ ] `protask/templates/gold-noir/index.html` existe avec 5 vues, 5 `<template>`, DnD, dialog, toast
- [ ] Palette Gold & Noir : `--bg: #0a0a0a`, `--accent: #d4af37`, typo Playfair Display
- [ ] `protask/templates/gold-noir/gold-noir.spec.js` — 24 tests
- [ ] `data.js` enregistre le thème gold-noir
- [ ] `npx playwright test protask/templates/gold-noir/gold-noir.spec.js` — 24/24 passed

## Spécifications

### Palette CSS
```css
--bg: #0a0a0a;
--bg-card: #1a1a1a;
--bg-secondary: #141414;
--fg: #e8e0d0;
--fg-secondary: #a09880;
--accent: #d4af37;
--accent-hover: #c4a030;
--accent-light: rgba(212, 175, 55, 0.12);
--green: #16a34a;
--red: #dc2626;
--orange: #d97706;
--border: #2a2a2a;
--border-light: #1e1e1e;
--shadow: 0 1px 3px rgba(0,0,0,.5),0 1px 2px rgba(0,0,0,.3);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,.6),0 2px 4px -2px rgba(0,0,0,.3);
--radius: 6px;
--radius-sm: 3px;
--font: 'Playfair Display', Georgia, serif;
--font-body: system-ui, -apple-system, sans-serif;
```

### Architecture

Même architecture que corporate et forest. Points clés :
- Tous les IDs identiques (voir brief Task 1)
- Fonctions JS : `showDialog(title, opts)`, `navigate(tab)`, `openCardModal(id)`, `showToast(msg, type)`
- Import `demoApi` depuis `../../api/client.js`
- Pas de console.log, pas de template literals pour le HTML
- Le bouton register texte : `"S'inscrire"`

### Tests

- Helper `dialogConfirm(page, value)` identique à corporate — clique sur `#dialog-confirm-btn`
- Emails suffixe `-gn@` (Gold & Noir). Ex: `e2e-gn@test.com`
- `test.beforeAll` avec `await request.post('http://localhost:3001/api/_reset')`
- Nom du describe : `'ProTask gold-noir'`
- 24 tests : 1 walkthrough + 7 UI + 16 API directe

### data.js

Ajouter dans `projectsData[0].themes` (après forest) :
```js
{ id: 'gold-noir', name: 'Gold & Noir', desc: 'Noir profond, accents dorés, élégance', file: 'protask/templates/gold-noir/index.html' },
```

### Fichiers de référence

- Modèle : `protask/templates/corporate/index.html` (architecture identique)
- Tests modèle : `protask/templates/corporate/corporate.spec.js`
- Thème déjà fait : `protask/templates/forest/` (même structure)
