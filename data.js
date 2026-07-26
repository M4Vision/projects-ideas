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
		demoApi: '/protask/api/client.js',
		themes: [
			{ id: 'neo-brutalist', name: 'Neo-Brutalist', desc: 'Bordures épaisses, couleurs vives, bold', file: 'protask/templates/neo-brutalist/index.html' },
			{ id: 'minimalist', name: 'Minimalist', desc: 'Design épuré, blanc, espace généreux, typo fine', file: 'protask/templates/minimalist/index.html' },
			{ id: 'cyberpunk', name: 'Cyberpunk', desc: 'Fond sombre, néons cyan/magenta, glow effects, mono', file: 'protask/templates/cyberpunk/index.html' },
			{ id: 'retro', name: 'Retro', desc: 'Tons chauds, typo serif, vibe papier, style artisanal', file: 'protask/templates/retro/index.html' },
			{ id: 'glass', name: 'Glass', desc: 'Glassmorphism, fond flou, transparence, bordures subtiles', file: 'protask/templates/glass/index.html' },
			{ id: 'corporate', name: 'Corporate', desc: 'Design professionnel bleu/gris, tons sobres, Inter', file: 'protask/templates/corporate/index.html' },
			{ id: 'forest', name: 'Forest', desc: 'Verts profonds, bois, ambiance sous-bois', file: 'protask/templates/forest/index.html' },
			{ id: 'gold-noir', name: 'Gold & Noir', desc: 'Noir profond, accents dorés, élégance', file: 'protask/templates/gold-noir/index.html' },
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
			{ id: 'neo-brutalist', name: 'Neo-Brutalist', desc: 'Bordures épaisses, style impact', file: 'shopflow/templates/neo-brutalist/index.html' }
		],
	},
];
