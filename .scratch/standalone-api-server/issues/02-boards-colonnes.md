# 02 — Boards & Colonnes

**What to build:** Routes boards (CRUD) et colonnes (CRUD + reorder) ajoutées au serveur Hono. Méthodes `getBoards()`, `getBoard()`, `createBoard()`, `updateBoard()`, `deleteBoard()`, `getColumns()`, `createColumn()`, `updateColumn()`, `deleteColumn()`, `reorderColumns()` dans le client. Tests e2e pour le groupe boards & colonnes.

**Blocked by:** 01 — Serveur Hono + Auth

**Status:** completed

- [x] `GET /api/boards` liste les boards de l'utilisateur connecté
- [x] `POST /api/boards` crée un board (avec titre, couleur, catégories, description) + 3 colonnes par défaut
- [x] `GET /api/boards/:id` retourne un board avec ses colonnes et membres
- [x] `PUT /api/boards/:id` met à jour titre/couleur/catégories/description
- [x] `DELETE /api/boards/:id` supprime board + colonnes + cartes associées
- [x] `GET /api/boards/:id/columns` liste les colonnes triées par ordre
- [x] `POST /api/boards/:id/columns` crée une colonne
- [x] `PUT /api/columns/:id` met à jour titre/couleur/description
- [x] `DELETE /api/columns/:id` supprime une colonne + ses cartes
- [x] `PUT /api/columns/reorder` réordonne les colonnes
- [x] Client expose les 10 méthodes
- [x] Tests e2e : chaque route appelée en succès + erreurs (board introuvable, colonne introuvable)
