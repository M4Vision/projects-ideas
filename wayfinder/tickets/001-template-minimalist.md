## Question

Créer le template **minimalist** pour ProTask — design épuré, blanc, beaucoup d'espace, peu de couleurs, typo fine.

### Exigences

1. **Fichier** : `protask/templates/minimalist/index.html`
2. **Thème** : Design minimaliste — fond blanc, palette restreinte (gris + un accent), typo fine (Inter/system-ui), pas de bordures épaisses, coins légèrement arrondis, espacement généreux
3. **Architecture** : Même pattern que neo-brutalist — `<template>` elements, 5 vues (login, dashboard, board, settings, profile), navigation, toast, dialog, loading state
4. **API** : Tous les appels via `demoApi` — toutes les 19 routes OpenAPI couvertes
5. **Tests** : `protask/templates/minimalist/minimalist.spec.js` — walkthrough complet + tests API directe (30+ tests)
6. **Registration** : Ajouter dans `data.js`

### Pattern de référence

Voir `protask/templates/neo-brutalist/index.html` pour l'architecture complète — views, navigation, dialog, toast, drag & drop, card modal, settings, profile.

Voir `protask/templates/neo-brutalist/neo-brutalist.spec.js` pour le pattern de test e2e.
