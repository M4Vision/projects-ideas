# Wayfinder Map: 5 ProTask Templates

## Destination

5 templates additionnels pour ProTask (minimalist, dark, retro, glass, corporate), chacun étant un fichier HTML standalone ~1000 lignes avec CSS+JS inline, 5 vues, toutes les routes OpenAPI couvertes, et des tests e2e complets (walkthrough + API directe). Chaque template suit l'architecture du template neo-brutalist existant.

## Notes

- Chaque template est indépendant — pas de blocage entre eux
- Les templates utilisent `demoApi` (le client API) — pas de `fetch()` direct
- CSS custom properties pour la thématisation
- `<template>` elements pour le HTML (pas de template literals)
- 5 vues : login, dashboard, board, settings, profile
- Tests e2e dans un fichier `*.spec.js` à côté du template

## Decisions so far

- **5 thèmes validés** : minimalist, dark terminal, retro, glass, corporate
- **Build un par un** : chaque template est un ticket indépendant
- **Walkthrough complet** : tests e2e = walkthrough (all routes) + API directe (30+ tests)

## Tickets

| # | Titre | Type | Status |
|---|-------|------|--------|
| 1 | **Template Minimalist** | Task | 🔵 Claimed |
| 2 | **Template Dark Terminal** | Task | ⚪ Open |
| 3 | **Template Retro** | Task | ⚪ Open |
| 4 | **Template Glass** | Task | ⚪ Open |
| 5 | **Template Corporate** | Task | ⚪ Open |

## Not yet specified

- Infrastructure de test partagée : vérifier si `e2e/helpers/intercept.js` fonctionne pour tous les templates (oui, il intercepte `**/api/client.js` qui est le même fichier pour tous)
- Template registry / pattern extraction : peut-être extraire des composants communs (toast, dialog, loading) plus tard

## Out of scope

- ShopFlow — dépriorisé
- Refactor du serveur API
- Architecture review items
