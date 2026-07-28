# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Trois publics principaux :
- **Développeurs en formation** (reconversion, bootcamp) qui pratiquent des frameworks web sur un cas concret
- **Développeurs pros en veille** qui veulent tester un nouveau framework sans repartir de zéro
- **Formateurs / enseignants** qui montrent l'impact du choix du framework sur un même produit

L'utilisateur utilise l'outil pour explorer un projet métier (ex: Kanban), lire son PRD, inspecter son contrat OpenAPI, prévisualiser ses templates dans différents thèmes, et suivre des guides pour le reproduire dans le framework de son choix.

## Product Purpose

Bac à sable pédagogique pour apprendre des frameworks web (Symfony, Laravel, Nest, Next.js…). Chaque projet a sa logique métier centralisée dans une mock API, et peut s'afficher dans 6+ thèmes visuels.

## Positioning

Ce qui rend le projet unique :
1. **Comparaison framework par framework** — même métier, même mock API, N frameworks : l'étudiant voit ce qui change et ce qui reste
2. **Bac à sable clé en main** — PRD, OpenAPI, guides, mock API : tout est fourni pour se concentrer sur l'apprentissage du framework
3. **Galerie de thèmes** — chaque projet s'affiche dans des habillages visuels radicalement différents (neo-brutalist, cyberpunk, glass, retro, etc.)

## Operating Context

- Navigateur web (Vite dev server en local)
- L'utilisateur ouvre `index.html` → sélectionne un projet et un thème → prévisualise le template dans une iframe
- Un panneau latéral affiche le code source, le PRD, l'OpenAPI, le client API, ou les guides
- Le serveur mock API tourne en parallèle (Hono, port 3001)
- L'outil sert aussi bien l'apprentissage local que la démonstration en formation

## Capabilities and Constraints

- **Viewer** : prévisualisation iframe, coloration syntaxique (shiki), visualisateur OpenAPI, rendu PRD/Markdown/Mermaid, testeur API intégré
- **Projets** : ProTask (Kanban, 19 routes API) — actif ; ShopFlow (e-commerce) — dépriorisé
- **Thèmes** : 10 thèmes ProTask, 1 thème ShopFlow. Chaque thème est un template HTML autonome (CSS + JS inline)
- **Guides** : Symfony, Laravel, NestJS, AdonisJS pour ProTask
- **Mock API** : serveur Hono fichier unique, données en mémoire, 19 routes, endpoint `/_reset` pour les tests
- **Zéro backend** : pas de serveur de prod, pas de base de données, pas d'authentification réelle
- **Vanilla JS uniquement** dans les templates (portable vers React/Blade/Twig)
- **Architecture multi-projet / multi-thème** : chaque projet suit le pattern `protask/api/`, `protask/templates/`, etc.
- **Tests** : Vitest pour la mock API (53 tests), Playwright pour les e2e templates

## Brand Commitments

- Nom informel : « Projets d'entraînement »
- Emoji 🏗️ dans le titre du header
- Pas de marque formelle, pas de logo, pas de charte graphique contraignante
- Langue : français (documentation, UI du viewer, commentaires)

## Evidence on Hand

- Code source complet avec 2 projets (ProTask + ShopFlow)
- PRD détaillé pour ProTask (`protask/docs/PRD.md`)
- Spécification OpenAPI 3.0 (19 routes)
- Template neo-brutalist fonctionnel (1131 lignes, 5 vues, tests e2e)
- Suite de tests API : 53 tests Vitest (100% couverture)
- Tests e2e Playwright pour le template neo-brutalist (30 tests)
- Guides framework : Symfony, Laravel, NestJS, AdonisJS
- Viewer avec coloration syntaxique, visualisateur OpenAPI, Mermaid, testeur API

## Product Principles

1. **Un projet = un domaine métier** : chaque projet a son propre PRD, sa spec OpenAPI, sa mock API, et ses templates. Pas de mélange entre domaines.
2. **Le template est souverain** : fichier HTML autonome (CSS+JS inline) qui consomme la mock API. Aucune dépendance framework dans le template.
3. **La mock API est la source de vérité** : toute la logique métier centralisée dans le serveur Hono. Les templates ne font que consommer.
4. **Comparabilité d'abord** : le même projet avec les mêmes données doit fonctionner à l'identique dans tous les thèmes et tous les frameworks cibles.
5. **Zéro friction à l'installation** : `pnpm install && pnpm run dev` suffit pour tout lancer.

## Accessibility & Inclusion

Aucune exigence spécifique documentée. Le viewer utilise des couleurs à contraste élevé (fond noir, texte clair). Les templates suivent les bonnes pratiques HTML sans exigences WCAG explicites.