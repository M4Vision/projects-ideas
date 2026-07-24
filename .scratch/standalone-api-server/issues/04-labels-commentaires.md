# 04 — Labels & Commentaires

**What to build:** Routes labels (CRUD) et commentaires (CRUD) ajoutées au serveur. Méthodes `getLabels()`, `createLabel()`, `updateLabel()`, `deleteLabel()`, `getComments()`, `addComment()`, `deleteComment()` dans le client. Tests e2e.

**Blocked by:** 02 — Boards & Colonnes

**Status:** completed

- [x] `GET /api/boards/:id/labels` liste les labels d'un board
- [x] `POST /api/boards/:id/labels` crée un label (nom, couleur, description)
- [x] `PATCH /api/labels/:id` met à jour un label
- [x] `DELETE /api/labels/:id` supprime un label
- [x] `GET /api/cards/:id/comments` liste les commentaires d'une carte (avec auteur résolu)
- [x] `POST /api/cards/:id/comments` ajoute un commentaire
- [x] `DELETE /api/comments/:id` supprime un commentaire
- [x] Client expose les 7 méthodes
- [x] Tests e2e : CRUD labels, CRUD commentaires, erreurs
