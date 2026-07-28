# Task 1: Forest — Rapport

## Implémentation

- **`protask/templates/forest/index.html`** — Template complet avec 5 vues (login, dashboard, board, settings, profile), 5 `<template>` elements (tmpl-card, tmpl-comment, tmpl-settings-col, tmpl-settings-label, tmpl-label-badge), DnD HTML5, dialog overlay, toast notifications. Palette Forest appliquée (verts profonds, Georgia/serif, ombres marquées).
- **`protask/templates/forest/forest.spec.js`** — 24 tests : 1 walkthrough (33 routes OpenAPI) + 7 UI + 16 API directe. Suffixe `-f@` pour emails uniques.
- **`data.js`** — Thème forest enregistré dans `projectsData[0].themes`.

## Tests

```
24 passed (34.8s)
```

Routes OpenAPI appelées: 33/33 — aucune route manquante.

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `protask/templates/forest/index.html` | Créé (1154 lignes) |
| `protask/templates/forest/forest.spec.js` | Créé (709 lignes) |
| `data.js` | Modifié (1 ligne ajoutée) |

## Self-review

- [x] 5 vues avec tous les IDs requis présents
- [x] 5 `<template>` elements
- [x] Palette Forest avec toutes les variables CSS
- [x] 24 tests, tous passants
- [x] Emails suffixe `-f@` cohérents
- [x] `data.js` mis à jour
- [x] Aucun console.log
- [x] Pas de template literals pour le HTML (utilisation des `<template>`)
