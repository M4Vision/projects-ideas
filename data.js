/**
 * data.js — Configuration centralisée des projets et templates
 *
 * Usage : importé par index.html pour générer la navigation
 * Modifier ce fichier pour ajouter un projet ou un template
 */

const projectsData = [
  {
    id: 'protask',
    name: 'ProTask',
    tagline: 'Gestionnaire de tâches Kanban',
    description: 'Un Trello-like pour gérer ses projets avec boards, colonnes, cartes, labels, commentaires et invitations.',
    icon: '📋',
    docs: '/protask/docs/PRD.md',
    openapi: '/protask/docs/openapi.json',
    demoApi: '/protask/demo-api.js',
    themes: [
      { id: 'glassmorphism',   name: 'Glassmorphism',   desc: 'Fond dégradé, verre flouté, orbes animés', file: 'protask/templates/glassmorphism/index.html' },
      { id: 'neo-brutalist',   name: 'Neo-Brutalist',   desc: 'Bordures épaisses, couleurs vives, bold', file: 'protask/templates/neo-brutalist/index.html' },
      { id: 'clean-minimal',   name: 'Clean Minimal',   desc: 'Indigo, blanc, aéré, élégant', file: 'protask/templates/clean-minimal/index.html' },
      { id: 'bento',           name: 'Bento UI',         desc: 'Pastel, grille asymétrique, emojis', file: 'protask/templates/bento/index.html' },
      { id: 'dark-corporate',  name: 'Dark Corporate',  desc: 'Anthracite, data-dense, professionnel', file: 'protask/templates/dark-corporate/index.html' },
      { id: 'shadcn-docs',     name: 'Shadcn Docs',     desc: 'Border-based, dark/light toggle, sidebar', file: 'protask/templates/shadcn-docs/index.html' },
    ],
  },
  {
    id: 'shopflow',
    name: 'ShopFlow',
    tagline: 'Marketplace E-commerce',
    description: 'Marketplace où chaque utilisateur peut acheter et vendre. Wallet virtuel, stock, bonus quotidien, admin.',
    icon: '🛒',
    docs: '/shopflow/docs/PRD.md',
    openapi: '/shopflow/docs/openapi.json',
    demoApi: '/shopflow/demo-api.js',
    themes: [
      { id: 'glassmorphism',   name: 'Glassmorphism',   desc: 'Fond dégradé, verre flouté', file: 'shopflow/templates/glassmorphism/index.html' },
      { id: 'neo-brutalist',   name: 'Neo-Brutalist',   desc: 'Bordures épaisses, style impact', file: 'shopflow/templates/neo-brutalist/index.html' },
      { id: 'clean-minimal',   name: 'Clean Minimal',   desc: 'Indigo, blanc, aéré', file: 'shopflow/templates/clean-minimal/index.html' },
      { id: 'bento',           name: 'Bento UI',         desc: 'Pastel, emojis, arrondi', file: 'shopflow/templates/bento/index.html' },
      { id: 'dark-corporate',  name: 'Dark Corporate',  desc: 'Anthracite, compact, pro', file: 'shopflow/templates/dark-corporate/index.html' },
      { id: 'shadcn-docs',     name: 'Shadcn Docs',     desc: 'Border-based, dark/light toggle', file: 'shopflow/templates/shadcn-docs/index.html' },
    ],
  },
];
