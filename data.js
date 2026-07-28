/**
 * data.js — Configuration centralisée des projets et templates
 *
 * Usage : importé par index.html pour générer la navigation
 * Modifier ce fichier pour ajouter un projet ou un template
 */

var projectsData = [
	{
		id: 'protask',
		name: 'ProTask',
		tagline: 'Gestionnaire de tâches Kanban',
		description: 'Un Trello-like pour gérer ses projets avec boards, colonnes, cartes, labels, commentaires et invitations.',
		icon: '📋',
		guides: [
			{ name: 'Symfony', file: 'protask/guides/symfony/index.md' },
			{ name: 'Laravel', file: 'protask/guides/laravel/index.md' },
			{ name: 'NestJS', file: 'protask/guides/nestjs/index.md' },
			{ name: 'AdonisJS', file: 'protask/guides/adonis/index.md', format: 'learning-path', manifest: 'protask/guides/adonis/learning-path.js' },
		],
		docs: '/protask/docs/PRD.md',
		openapi: '/protask/docs/openapi.json',
		demoApi: '/protask/api/client.js',
		themes: [
			{ id: 'neo-brutalist', name: 'Neo-Brutalist', desc: 'Bordures épaisses, couleurs vives, bold', palette: ['#FFD700','#1A1A1A','#FFFFFF'], file: 'protask/templates/neo-brutalist/index.html' },
			{ id: 'minimalist', name: 'Minimalist', desc: 'Design épuré, blanc, espace généreux, typo fine', palette: ['#FFFFFF','#E5E5E5','#888'], file: 'protask/templates/minimalist/index.html' },
			{ id: 'cyberpunk', name: 'Cyberpunk', desc: 'Fond sombre, néons cyan/magenta, glow effects, mono', palette: ['#0A0A0A','#00FFFF','#FF00FF'], file: 'protask/templates/cyberpunk/index.html' },
			{ id: 'retro', name: 'Retro', desc: 'Tons chauds, typo serif, vibe papier, style artisanal', palette: ['#D4A574','#8B6914','#F5E6CA'], file: 'protask/templates/retro/index.html' },
			{ id: 'glass', name: 'Glass', desc: 'Glassmorphism, fond flou, transparence, bordures subtiles', palette: ['#B8D4E3','#FFFFFF','#A0C4E0'], file: 'protask/templates/glass/index.html' },
			{ id: 'corporate', name: 'Corporate', desc: 'Design professionnel bleu/gris, tons sobres, Inter', palette: ['#2563EB','#64748B','#1E293B'], file: 'protask/templates/corporate/index.html' },
			{ id: 'forest', name: 'Forest', desc: 'Verts profonds, bois, ambiance sous-bois', palette: ['#2D5A27','#8B6914','#4A7C3F'], file: 'protask/templates/forest/index.html' },
			{ id: 'gold-noir', name: 'Gold & Noir', desc: 'Noir profond, accents dorés, élégance', palette: ['#0A0A0A','#D4AF37','#1A1A1A'], file: 'protask/templates/gold-noir/index.html' },
			{ id: 'terminal', name: 'Terminal', desc: 'Vert sur noir, typo mono, style hacker', palette: ['#0A0A0A','#00FF41','#003B00'], file: 'protask/templates/terminal/index.html' },
			{ id: 'material-dark', name: 'Material Dark', desc: 'Material Design sombre, violet/cyan, moderne', palette: ['#121212','#BB86FC','#03DAC6'], file: 'protask/templates/material-dark/index.html' },
		],
	},
	{
		id: 'shopflow',
		name: 'ShopFlow',
		tagline: 'Marketplace E-commerce',
		description: 'Marketplace où chaque utilisateur peut acheter et vendre. Wallet virtuel, stock, bonus quotidien, admin.',
		icon: '🛒',
		guides: [],
		docs: '/shopflow/docs/PRD.md',
		openapi: '/shopflow/docs/openapi.json',
		demoApi: '/shopflow/demo-api.js',
		themes: [
			{ id: 'neo-brutalist', name: 'Neo-Brutalist', desc: 'Bordures épaisses, style impact', palette: ['#FFD700','#1A1A1A'], file: 'shopflow/templates/neo-brutalist/index.html' }
		],
	},
];
