# Task 1: Forest — thème nature boisée

## Acceptance Criteria

- [ ] `protask/templates/forest/index.html` existe avec 5 vues (login, dashboard, board, settings, profile), 5 `<template>` elements (tmpl-card, tmpl-comment, tmpl-settings-col, tmpl-settings-label, tmpl-label-badge), DnD, dialog, toast
- [ ] Palette Forest : `--bg: #1b3d2b`, `--accent: #8fbc8f`, typo Georgia/serif
- [ ] `protask/templates/forest/forest.spec.js` existe avec 24 tests (1 walkthrough 33 routes + 7 UI + 16 API directe)
- [ ] `data.js` enregistre le thème forest
- [ ] `npx playwright test protask/templates/forest/forest.spec.js` — 24/24 passed

## Spécifications détaillées

### Palette CSS

```css
--bg: #1b3d2b;
--bg-card: #2d5a3d;
--bg-secondary: #234a32;
--fg: #e8f0e4;
--fg-secondary: #a8c4a8;
--accent: #8fbc8f;
--accent-hover: #7aaa7a;
--accent-light: rgba(143, 188, 143, 0.15);
--green: #16a34a;
--red: #dc2626;
--orange: #d97706;
--border: #3a6b4a;
--border-light: #2d5a3d;
--shadow: 0 1px 3px rgba(0,0,0,.3),0 1px 2px rgba(0,0,0,.2);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,.4),0 2px 4px -2px rgba(0,0,0,.2);
--radius: 8px;
--radius-sm: 4px;
--font: Georgia, 'Times New Roman', serif;
```

### Architecture du template

- Fichier HTML autonome (CSS + JS inline), importe `demoApi` depuis `../../api/client.js`
- 5 pages : `#page-login`, `#page-dashboard`, `#page-board`, `#page-settings`, `#page-profile`
- 5 `<template>` : tmpl-card, tmpl-comment, tmpl-settings-col, tmpl-settings-label, tmpl-label-badge
- Fonctions JS : `showView(name)`, `openCardModal(id)`, `dialogConfirm(msg, callback)`, `showToast(msg, type)`
- Drag & drop HTML5 natif pour les cartes
- Dialog overlay remplace prompt()/confirm()
- Aucun console.log en production
- Template literals interdits pour le HTML (utiliser les `<template>`)

### IDs requis (identiques aux autres templates)

| Élément | ID |
|---------|-----|
| Login | `page-login`, `login-form`, `login-email`, `login-password`, `login-submit-btn`, `login-toggle-link`, `login-toggle-text`, `login-error`, `reg-name`, `reg-name-field`, `reg-confirm`, `reg-confirm-field` |
| Nav | `nav-login`, `nav-dashboard`, `nav-board`, `nav-settings`, `nav-profile`, `nav-logout` |
| Dashboard | `page-dashboard`, `dash-new-board-btn`, `dash-grid` |
| Board | `page-board`, `board-title`, `board-avatars`, `board-cols`, `board-invite-btn`, `board-invitations-btn`, `board-invitations-panel` |
| Modal | `modal-overlay`, `modal-title`, `modal-close-btn`, `modal-desc`, `modal-assignee`, `modal-due`, `modal-labels`, `modal-comments`, `modal-comment-input`, `modal-comment-btn`, `modal-edit-title`, `modal-save-btn`, `modal-delete-btn`, `modal-edit-assignee`, `label-picker`, `unsaved-indicator` |
| Settings | `page-settings`, `settings-board-name`, `settings-board-desc`, `settings-col-list`, `settings-add-col`, `settings-label-list`, `settings-add-label`, `settings-save-btn`, `settings-del-board-btn` |
| Profile | `page-profile`, `profile-avatar`, `profile-name-display`, `profile-email-display`, `profile-name`, `profile-email`, `profile-pw-current`, `profile-pw-new`, `profile-pw-confirm`, `profile-save-btn` |
| Dialog | `dialog-overlay`, `dialog-title`, `dialog-input`, `dialog-confirm-btn`, `dialog-cancel` |
| Toast | `toast` |
| Classes | `.board-card`, `.task-card`, `.board-col-body`, `.board-avatar`, `.settings-col-item`, `.col-edit`, `.col-del`, `.settings-label-item`, `.toast`, `.modal-comment` |

### Règles pour les tests

```js
import { test, expect } from '@playwright/test';
import { interceptDemoApi, getApiCalls } from '../../../e2e/helpers/intercept.js';
import { ALL_METHODS } from '../../../e2e/helpers/api-coverage.js';

const OPENAPI_METHODS = ALL_METHODS.filter(m => !['getColumns', 'cancelInvitation', 'removeMember'].includes(m));

test.beforeAll(async ({ request }) => {
  await request.post('http://localhost:3001/api/_reset');
});

async function dialogConfirm(page, value) { /* same as corporate */ }
```

- Emails uniques : utiliser suffixe `-f@` (pour Forest). Ex: `e2e-f@test.com`, `accept-f@test.com`
- Texte du bouton register : `"S'inscrire"` (comme corporate)
- Nom du describe : `'ProTask forest'`
- 24 tests : 1 walkthrough (33 routes) + 7 UI (login+register, erreur, dashboard, avatars, board post-inscription, workflow complet, navigation) + 16 API directe (10 invitations + board CRUD + label CRUD + colonne CRUD + assignee modal + self-invite toast + label modal + label API)

### Registration dans data.js

Ajouter dans `projectsData[0].themes` :

```js
{ id: 'forest', name: 'Forest', desc: 'Verts profonds, bois, ambiance sous-bois', file: 'protask/templates/forest/index.html' },
```

### Fichiers de référence

- Template existant : `protask/templates/corporate/index.html` (architecture identique, palette différente)
- Tests existants : `protask/templates/corporate/corporate.spec.js`
- Helpers : `e2e/helpers/intercept.js`, `e2e/helpers/api-coverage.js`
- Data : `data.js`
