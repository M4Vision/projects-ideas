# Projets Web — Portfolio d'entraînement

Une collection de **mini-projets web** (5 à 10 pages) conçue pour s'entraîner sur différents frameworks (Symfony, Laravel, Adonis, Nest, Next.js, TanStack Start).

Chaque projet a **6 templates visuels** différents pour une même logique métier centralisée.

## Projets

| # | Projet | Description | Pages | Statut |
|---|--------|-------------|-------|--------|
| 1 | **ProTask** | Gestionnaire de tâches Kanban (Trello-like) | 5 | ✅ |
| 2 | **ShopFlow** | Marketplace e-commerce avec wallet virtuel | 10 | ✅ |
| 3 | *À définir* | Réseau social avec blog | — | ⏳ |
| 4 | *À définir* | CRM | — | ⏳ |
| 5 | *À définir* | Chat WebSocket | — | ⏳ |

## Structure

```
📂 projects-ideas/
├── 📄 index.html          # Navigateur de templates (iframes)
├── 📄 data.js             # Configuration des projets/thèmes
├── 📄 AGENT.md            # Guide pour les IA
├── 📄 README.md           # Ce fichier
├── 📁 protask/            # Projet 1
│   ├── 📁 docs/           # PRD + OpenAPI
│   ├── 📄 demo-api.js     # Mock API centralisé
│   └── 📁 templates/      # 6 thèmes
│       ├── 📁 glassmorphism/
│       ├── 📁 neo-brutalist/
│       ├── 📁 clean-minimal/
│       ├── 📁 bento/
│       ├── 📁 dark-corporate/
│       └── 📁 shadcn-docs/
└── 📁 shopflow/           # Projet 2
    └── ...                # Même structure
```

## Utilisation

```bash
# Lancer le serveur de preview
python3 -m http.server 8080

# Ouvrir http://localhost:8080
# Naviguer entre les projets et thèmes via l'interface
# Tester les breakpoints responsive avec les boutons XL/LG/MD/SM/XS
```

## API

Chaque projet expose une API mock centralisée dans `demo-api.js` :

```js
// Tester l'API dans la console
testApi().then(r => console.log(`${r.passed}/${r.total} tests OK`));
```

## Objectif pédagogique

Le but est de **ne plus réfléchir à la conception** pendant l'apprentissage :
- Le **PRD** définit le besoin
- L'**OpenAPI** définit les routes et les types
- Le **demo-api.js** fournit les données mock
- Les **templates HTML** montrent le rendu final

Il ne reste plus qu'à implémenter la techno.
