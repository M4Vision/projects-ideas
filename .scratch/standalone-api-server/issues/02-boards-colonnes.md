# 02 — Boards & Colonnes

**What to build:** Routes boards (CRUD) et colonnes (CRUD + reorder) ajoutées au serveur Hono. Méthodes `getBoards()`, `getBoard()`, `createBoard()`, `updateBoard()`, `deleteBoard()`, `getColumns()`, `createColumn()`, `updateColumn()`, `deleteColumn()`, `reorderColumns()` dans le client. Tests e2e pour le groupe boards & colonnes.

**Blocked by:** 01 — Serveur Hono + Auth

**Status:** ready-for-agent

- [ ] `GET /api/boards` liste les boards de l'utilisateur connecté
- [ ] `POST /api/boards` crée un board (avec titre, couleur, catégories, description) + 3 colonnes par défaut
- [ ] `GET /api/boards/:id` retourne un board avec ses colonnes et membres
- [ ] `PATCH /api/boards/:id` met à jour titre/couleur/catégories/description
- [ ] `DELETE /api/boards/:id` supprime board + colonnes + cartes associées
- [ ] `GET /api/boards/:id/columns` liste les colonnes triées par ordre
- [ ] `POST /api/boards/:id/columns` crée une colonne
- [ ] `PATCH /api/columns/:id` met à jour titre/couleur/description
- [ ] `DELETE /api/columns/:id` supprime une colonne + ses cartes
- [ ] `POST /api/columns/reorder` réordonne les colonnes
- [ ] Client expose les 10 méthodes
- [ ] Tests e2e : chaque route appelée en succès + erreurs (board introuvable, colonne introuvable)
