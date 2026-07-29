## Question

Définir précisément ce que le skill `write-guide-docs` produit. Quels fichiers, dans quelle structure, avec quel contenu ?

### Questions à résoudre

1. **Fichiers à générer** — manifest, leçons (Markdown), checkpoints, quizzes, tests ? Lesquels sont obligatoires ?
2. **Conventions de dossier** — où chaque fichier est créé dans l'arborescence du projet ?
3. **Format du manifest** — `learning-path.js` (ES module) ou JSON ? Structure exacte ?
4. **Format des leçons** — frontmatter ? Sections obligatoires ? Longueur cible ?
5. **Format des checkpoints** — dossiers par leçon, fichiers cumulatifs, README ?
6. **Structure des quizzes** — où sont-ils définis (inline dans le manifest ou fichiers séparés) ?
7. **Tests générés** — le skill génère-t-il des tests ? Si oui, pour qui ? tester.js categories ?
8. **Fichiers de config du projet** — le skill crée-t-il des fichiers de config (package.json, .env, tsconfig) pour le framework cible ?

### Dépendances

Bloqué par le contrat d'entrée (ticket **Définir le contrat d'entrée du skill**) — la sortie dépend de ce qu'on reçoit en entrée.

Blocked by: 02-contrat-entree-skill
