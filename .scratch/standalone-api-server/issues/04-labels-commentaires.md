# 04 — Labels & Commentaires

**What to build:** Routes labels (CRUD) et commentaires (CRUD) ajoutées au serveur. Méthodes `getLabels()`, `createLabel()`, `updateLabel()`, `deleteLabel()`, `getComments()`, `addComment()`, `deleteComment()` dans le client. Tests e2e.

**Blocked by:** 02 — Boards & Colonnes

**Status:** ready-for-agent

- [ ] `GET /api/boards/:id/labels` liste les labels d'un board
- [ ] `POST /api/boards/:id/labels` crée un label (nom, couleur, description)
- [ ] `PATCH /api/labels/:id` met à jour un label
- [ ] `DELETE /api/labels/:id` supprime un label
- [ ] `GET /api/cards/:id/comments` liste les commentaires d'une carte (avec auteur résolu)
- [ ] `POST /api/cards/:id/comments` ajoute un commentaire
- [ ] `DELETE /api/comments/:id` supprime un commentaire
- [ ] Client expose les 7 méthodes
- [ ] Tests e2e : CRUD labels, CRUD commentaires, erreurs
