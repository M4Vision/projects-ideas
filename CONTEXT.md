# Projets d'entraînement

Bac à sable pédagogique pour apprendre des frameworks web (Symfony, Laravel, Nest, Next.js…).
Chaque projet a sa logique métier centralisée dans une mock API, et peut s'afficher dans 6 thèmes visuels.

## Language

**Template**:
Fichier HTML autonome (CSS + JS inline) qui implémente l'interface utilisateur complète d'un projet dans un thème visuel donné. Consomme la mock API centralisée.
_Avoid_: Page, vue, SPA

**Thème**:
Langage visuel et système de design appliqué à un template. Chaque template appartient à exactement un thème.
_Avoid_: Style, habillage, skin

**Mock API** (protask/api/server.js) :
Serveur Hono autonome (fichier unique) exposant les 19 routes OpenAPI avec des données en mémoire. Remplacé par un `client.js` qui wrappe les appels `fetch()` pour les templates. Chaque projet suit ce pattern : `protask/api/`, `shopflow/api/`, etc.
_Avoid_: Backend, serveur, BaaS

**Projet**:
Mini-application avec un domaine métier spécifique (ex: ProTask pour le Kanban, ShopFlow pour l'e-commerce). Contient un PRD, une spec OpenAPI, une mock API, et 6 templates.
_Avoid_: App, application

**PRD**:
Product Requirements Document décrivant les pages, le modèle de données, les fonctionnalités et les routes API d'un projet.
_Avoid_: Spec, cahier des charges

**Vue**:
Mode d'affichage dans le template (ex: login, dashboard, board). Le template peut avoir plusieurs vues, une seule active à la fois (classe `.active`).
_Avoid_: Page, écran

---

## Arborescence

```
projets-ideas/
├── CONTEXT.md                    ← ce fichier
├── index.html                    ← Vite dev server entry (liste les projets/thèmes)
├── vite.config.js
├── improve-codebase-architecture/ ← rapports d'architecture
│   ├── *-rapport-architecture.html
│   └── *-plan-implementation.html
├── protask/                      ← Projet Kanban
│   ├── README.md
│   ├── docs/
│   │   ├── prd.md
│   │   ├── openapi.json          ← Contrat OpenAPI 3.0 (19 routes)
│   │   └── adr/                  ← ADRs spécifiques à ProTask
│   ├── api/
│   │   ├── server.js             ← Serveur Hono (fichier unique)
│   │   ├── client.js             ← Wrapper fetch pour les templates
│   │   └── e2e.spec.js           ← Tests Vitest (fichier unique)
│   └── templates/
│       ├── neo-brutalist/
│       │   ├── index.html        ← Template neo-brutalist (1131 lignes, 5 <template>)
│       │   └── neo-brutalist.spec.js  ← Tests e2e (30 tests)
│       └── (5 autres thèmes vides)
├── shopflow/                     ← Projet e-commerce (dépriorisé)
│   └── ...
├── docs/                         ← Documentation globale du repo
│   ├── adr/
│   │   └── 0001-standalone-api-server.md  ← Décision architecturale globale
│   └── spec-standalone-api-server.md      ← Spécification d'implémentation
└── ...
```

## Architecture technique

- **Serveur API** : `protask/api/server.js` (Hono, fichier unique, 19 routes, données en mémoire)
- **Client API** : `protask/api/client.js` (wrapper fetch avec mêmes noms de méthodes que l'ancien `demoApi`)
- **Reset state** : `POST /api/_reset` (route interne aux tests, pas dans l'OpenAPI contract)
- **Auth** : header `Authorization: Bearer token-{userId}`, pas de vraie sécurité
- **Données** : pré-chargées au démarrage (identique à l'ancien mockData); `_reset` ramène à l'état initial
- **Zéro backend** : tout est client-side, pas de serveur, pas de build
- **Vite** sert les fichiers statiques et hot-reload. Entrypoint: `index.html` liste les projets/thèmes avec des iframes
- **Pas de framework JS** : vanilla JS uniquement dans les templates (portable vers React/Blade/Twig)

## ProTask — État actuel

### Ce qui est fait
- `demo-api.js` : 36 méthodes asynchrones (auth, users, boards, columns, cards, labels, comments, invitations), 62 tests intégrés (100% couverture) — **sera remplacé par le serveur Hono**
- Template neo-brutalist : 1131 lignes, 5 `<template>` elements, 5 vues (login, dashboard, board, settings, profile), DnD HTML5, 18 custom properties CSS, responsive breakpoints, toast notifications, dialog overlay (remplace `prompt()`/`confirm()`), board nav label dynamique
- PRD et OpenAPI spec complets (19 routes)
- Tests e2e néo-brutalist : 30 tests (14 walkthrough + 16 API directe), couvrant toutes les routes via intercept

### À faire
- **Serveur Hono** : implémenter les 19 routes dans `protask/api/server.js`
- **Client API** : créer `protask/api/client.js` (wrapper fetch)
- **Tests e2e API** : créer `protask/api/e2e.spec.js` (Vitest, 1 fichier)
- Adapter `vite.config.js` et `package.json` pour lancer / proxyfier le serveur
- 5 autres templates (1 par thème) pour ProTask
- Chaque template doit appeler **toutes** les routes API de l'OpenAPI
- ShopFlow (e-commerce) — dépriorisé, ne pas toucher

### Architecture du template

Les templates suivent un pattern strict :

```html
<template id="tpl-login">
  <form class="login-form">…</form>
</template>

<div id="app">
  <div class="view login-view active">  <!-- une seule .active à la fois -->
    <!-- login content -->
  </div>
  <div class="view dashboard-view">
    <!-- dashboard content -->
  </div>
</div>

<script>
import { demoApi } from '../../demo-api.js';

let state = { currentUser: null, boards: [], currentBoard: null };

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelector(`.${name}-view`).classList.add('active');
}

// Tous les appels API passent par demoApi. Pas de fetch() direct.
</script>
```

### Règles pour les templates
1. Pas de `console.log` en production
2. Utiliser `<template>` elements (pas de template literals pour le HTML)
3. Chaque route OpenAPI doit être appelée au moins une fois
4. CSS custom properties pour la thématisation
5. Pas de commentaires inutiles dans les fichiers de prod

## Tests

### Scripts

| Script | Description |
|--------|-------------|
| `pnpm test` | Lance tous les tests e2e Playwright |
| `pnpm test:e2e` | idem |
| `pnpm test:e2e:ui` | Mode interactif Playwright UI |
| `pnpm test:e2e:report` | Exécute les tests + génère le rapport HTML |
| `pnpm preview-report` | Ouvre le rapport HTML (après `test:e2e:report`) |
| `pnpm test:api` | Tests unitaires de la mock API (40 tests) |

### Infrastructure e2e

```
e2e/
├── helpers/
│   ├── api-coverage.js    ← Mapping OpenAPI → méthodes demoApi
│   └── intercept.js       ← Monkey-patch pour tracer les appels API
├── index.spec.js          ← Tests du navigateur de projets
playwright.config.js       ← Configuration Playwright
.github/workflows/
└── playwright.yml         ← CI GitHub Actions
```

Chaque template peut avoir son propre fichier `*.spec.js` à côté de son `index.html`. Exemple : `protask/templates/neo-brutalist/neo-brutalist.spec.js`.

### Principe de couverture API

Les tests e2e utilisent un **monkey-patch** via `page.route()` : le fichier `demo-api.js` est intercepté au chargement, chaque méthode `demoApi.*` est wrappée pour enregistrer son appel dans `window.__apiCalls`. Après le parcours complet du template, le test compare les appels collectés avec la liste des routes OpenAPI.

## Architecture review

Un audit a identifié 8 opportunités d'amélioration sur l'architecture du codebase :
1. Template Registry pattern
2. Mock API versioning
3. Shared CSS custom properties
4. Centralized error handling
5. Auto-generation OpenAPI → tests
6. State management pattern
7. Test runner/framework
8. Shared linting config

Rapport détaillé : `improve-codebase-architecture/*-rapport-architecture.html`
