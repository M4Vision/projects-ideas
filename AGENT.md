# AGENT.md — Guide pour les IA travaillant sur ce projet

## Philosophie du projet

Ce dépôt est un **bac à sable pédagogique** pour apprendre des frameworks web (Symfony, Laravel, Adonis, Nest, Next.js, TanStack Start). Chaque projet est conçu pour être implémenté dans **6 styles visuels différents** avec **une seule logique métier centralisée**.

---

## Structure obligatoire d'un projet

```
projet/
├── docs/
│   ├── PRD.md                  # Product Requirements Document
│   └── openapi.json            # Spécification OpenAPI 3.0 complète
├── demo-api.js                 # Mock API centralisé (mockData + demoApi + testApi)
└── templates/
    ├── glassmorphism/
    │   └── index.html          # Template autonome (tout en 1 fichier)
    ├── neo-brutalist/
    │   └── index.html
    ├── clean-minimal/
    │   └── index.html
    ├── bento/
    │   └── index.html
    ├── dark-corporate/
    │   └── index.html
    └── shadcn-docs/
        └── index.html
```

## Règles strictes

### 1. PRD.md
- Doit contenir : Présentation, Pages, Modèle de données (avec diagramme Mermaid ERD), **Tables détaillées** (tous les champs avec types et contraintes), Fonctionnalités, Layout, Design System, **API Routes** (toutes les routes avec méthode, path, auth, description, request/response).

### 2. openapi.json
- OpenAPI 3.0 valide
- Tous les schemas avec `$id`, descriptions en français, exemples
- Toutes les routes avec request/response typés
- Security scheme (bearerAuth JWT)

### 3. demo-api.js
- Centralise TOUTE la logique mock
- 3 sections : `mockData` (seed data), `demoApi` (fonctions asynchrones simulant l'API), `testApi()` (tests unitaires)
- Chaque fonction `demoApi.xxx()` doit : simuler un délai, valider l'auth, gérer les erreurs, retourner les bonnes structures
- `testApi()` teste TOUS les endpoints et retourne `{ total, passed, failed }`
- Expose `getCurrentUser()`, `setCurrentUser()`, `resetMockData()` pour les templates

### 4. Templates (index.html)
- 1 seul fichier HTML autonome (CSS + JS inline)
- Importe `../../demo-api.js` en premier script
- Utilise `const api = demoApi;` pour référencer l'API centralisée
- Ne JAMAIS réimplémenter la logique API dans un template
- Toutes les données via `api.xxx()` — pas de données hardcodées dans le HTML
- Tous les thèmes doivent avoir les MÊMES pages et la MÊME logique — SEUL le CSS change
- Responsive : breakpoints 1440px, 1024px, 768px, 480px, 375px
- Touch targets minimum 44px
- Contenu en français

### 5. Thèmes disponibles
| Thème | Description |
|-------|-------------|
| glassmorphism | Fond dégradé sombre, cartes floutées (backdrop-filter), verre |
| neo-brutalist | Fond blanc, bordures noires épaisses, ombres marquées, Impact font |
| clean-minimal | Fond blanc/gris, accent indigo #4F46E5, aéré, élégant |
| bento | Pastel, grille asymétrique, emojis, border-radius 20px, pills |
| dark-corporate | Fond #1A1B2F, accent bleu #2563EB, compact, data-dense |
| shadcn-docs | Border-based, dark/light toggle, sidebar gauche, CSS custom props |

## Ajouter un nouveau projet

1. Créer `projet/docs/PRD.md` avec TOUTES les sections requises
2. Créer `projet/docs/openapi.json` complet
3. Créer `projet/demo-api.js` avec mockData + demoApi + testApi
4. Créer les 6 templates dans `projet/templates/<theme>/index.html`
5. Ajouter l'entrée dans `data.js` (racine du dépôt)

## Ajouter un nouveau thème à un projet existant

1. Créer `projet/templates/<nouveau-theme>/index.html`
2. Ajouter l'entrée dans `data.js`
3. Le template doit importer `../../demo-api.js` et utiliser `demoApi`

## Tests

Lancer les tests API dans la console du navigateur :
```js
testApi().then(r => console.log(`${r.passed}/${r.total} tests passed`));
```

Ou depuis un template, ouvrir la console et taper `testApi()`.

## Commandes utiles

```bash
# Lancer le serveur de preview
python3 -m http.server 8080
# ou
npx serve .

# Vérifier la validité d'un OpenAPI
npx swagger-cli validate docs/openapi.json
```
