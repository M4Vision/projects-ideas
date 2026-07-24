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
