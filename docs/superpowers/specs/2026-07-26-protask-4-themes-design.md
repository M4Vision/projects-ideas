# ProTask — 4 nouveaux thèmes (Forest, Gold & Noir, Classic Terminal, Material Dark)

> Design doc pour l'ajout de 4 thèmes visuels à ProTask, portant le total de 6 à 10.

**Objectif** : Créer 4 templates ProTask supplémentaires (Forest, Gold & Noir, Classic Terminal, Material Dark) en suivant exactement l'architecture des 6 templates existants.

---

## Architecture

Chaque template est un fichier HTML autonome (CSS + JS inline) suivant le pattern strict :

```
protask/templates/<theme>/index.html
protask/templates/<theme>/<theme>.spec.js
```

Chaque template :
- 5 `<template>` elements : `tmpl-card`, `tmpl-comment`, `tmpl-settings-col`, `tmpl-settings-label`, `tmpl-label-badge`
- 5 vues (pages) : login, dashboard, board, settings, profile
- Drag & drop HTML5 natif
- Dialog overlay (remplace `prompt()`/`confirm()`)
- Toast notifications
- CSS custom properties pour la thématisation
- Aucun console.log en production
- Template literals interdits pour le HTML (utilisation des `<template>`)
- Import `demoApi` depuis `../../api/client.js`

Tests e2e (24 par template) :
- 1 walkthrough couvrant les 33 routes OpenAPI
- 7 tests UI (login, register, navigation, board, etc.)
- 16 tests API directe (invitations CRUD, board CRUD, label CRUD, colonne CRUD + reorder, assignee, labels)

---

## Thèmes

### 1. Forest

| Propriété | Valeur |
|-----------|--------|
| Palette | Fond `#1b3d2b`, surface `#2d5a3d`, accent `#8fbc8f`, bois `#d4a76a`, texte `#e8f0e4` |
| Typo | `Georgia, 'Times New Roman', serif` |
| Vibe | Sous-bois, profond, naturel, organique |
| Éléments | Ombres douces, bords légèrement arrondis, séparateurs boisés |

### 2. Gold & Noir

| Propriété | Valeur |
|-----------|--------|
| Palette | Fond `#0a0a0a`, surface `#1a1a1a`, accent or `#d4af37`, champagne `#f5e6c8`, texte `#e8e0d0` |
| Typo | `'Playfair Display', Georgia, serif` (titres), `system-ui` (corps) |
| Vibe | Luxe, contrasté, élégant, haute couture |
| Éléments | Bordures dorées subtiles, dégradés, glow doré léger |

### 3. Classic Terminal

| Propriété | Valeur |
|-----------|--------|
| Palette | Fond `#000`, surface `#0a0a0a`, texte `#00ff00`, accent `#00cc00`, erreur `#ff4444` |
| Typo | `'Courier New', 'Fira Code', monospace` |
| Vibe | Hacker, rétro, utilitaire, CRT |
| Éléments | Curseur clignotant, scanlines optionnelles, bordures fines, pas d'ombres |

### 4. Material Dark

| Propriété | Valeur |
|-----------|--------|
| Palette | Fond `#121212`, surface `#1e1e1e`, accent `#bb86fc`, secondary `#03dac6`, texte `#e0e0e0` |
| Typo | `'Roboto', system-ui, sans-serif` |
| Vibe | Google Material Design, sombre, propre, moderne |
| Éléments | Elevation shadows, ripple effect, coins arrondis, espaces généreux |

---

## Interfaces (Structure commune)

### CSS Custom Properties

```css
:root {
  --bg: <fond>;
  --bg-card: <surface>;
  --bg-secondary: <surface clair>;
  --fg: <texte>;
  --fg-secondary: <texte secondaire>;
  --accent: <couleur principale>;
  --accent-hover: <accent foncé>;
  --accent-light: <accent transparent>;
  --green: #16a34a;
  --red: <selon thème>;
  --orange: #d97706;
  --border: <couleur bordure>;
  --border-light: <bordure claire>;
  --shadow: <taille ombre>;
  --shadow-md: <ombre moyenne>;
  --radius: <rayon>;
  --radius-sm: <petit rayon>;
  --font: <typo>;
}
```

### Vues

| Vue | ID de page | Déclencheur |
|-----|-----------|-------------|
| Login | `#page-login` | Défaut, bouton nav, logout |
| Dashboard | `#page-dashboard` | `#nav-dashboard`, après login |
| Board | `#page-board` | Clic `.board-card`, après création |
| Settings | `#page-settings` | `[data-tab="settings"]` |
| Profile | `#page-profile` | `[data-tab="profile"]` |

### Éléments communs

| Élément | Sélecteur | Rôle |
|---------|-----------|------|
| Dialog overlay | `#dialog-overlay` | Confirmation, prompt |
| Toast | `#toast` | Notifications |
| Modal overlay | `#modal-overlay` | Détail carte / assignee / labels |
| Unsaved indicator | `#unsaved-indicator` | État modified dans le modal |
| Label picker | `#label-picker` | Sélection de labels dans le modal |

---

## Registration

Ajouter chaque thème dans `data.js` :

```js
themes: [
  // ... 6 existants
  { id: 'forest', name: 'Forest', desc: 'Verts profonds, bois, ambiance sous-bois', file: 'protask/templates/forest/index.html' },
  { id: 'gold-noir', name: 'Gold & Noir', desc: 'Noir profond, accents dorés, élégance', file: 'protask/templates/gold-noir/index.html' },
  { id: 'terminal', name: 'Terminal', desc: 'Vert sur noir, typo mono, style hacker', file: 'protask/templates/terminal/index.html' },
  { id: 'material-dark', name: 'Material Dark', desc: 'Material Design sombre, violet/cyan, moderne', file: 'protask/templates/material-dark/index.html' },
]
```

---

## Tests

Chaque template aura un fichier `*.spec.js` avec 24 tests :

1. **Walkthrough** (1 test) : parcourt toutes les vues, exécute toutes les actions CRUD, couvre les 33 routes OpenAPI
2. **UI tests** (7 tests) : login/register, erreur identifiants, dashboard accessible, avatars visibles, création board après inscription, workflow complet, navigation board existant sans modification
3. **API directe** (16 tests) : 10 tests invitations (accepter, refuser, annuler, retirer, wrong user, déjà invité, déjà membre, email invalide, utilisateur inexistant) + board CRUD + label CRUD + colonne CRUD + assignee modal + self-invite toast + label modal + label API

```js
test.beforeAll(async ({ request }) => {
  await request.post('http://localhost:3001/api/_reset');
});
```

---

## Ordre d'implémentation

1. Forest (le plus proche des existants)
2. Gold & Noir (élégant, contrastes forts)
3. Classic Terminal (radicalement différent, monospace)
4. Material Dark (système Material, ripple, elevation)
