# 03 — Cartes

**What to build:** Routes cartes (CRUD + move + reorder) ajoutées au serveur. Méthodes `getCards()`, `getCard()`, `createCard()`, `updateCard()`, `deleteCard()`, `moveCard()`, `reorderCards()` dans le client. Tests e2e pour le groupe cartes.

**Blocked by:** 02 — Boards & Colonnes

**Status:** completed

- [x] `GET /api/columns/:id/cards` liste les cartes d'une colonne (avec assignee et labels résolus)
- [x] `POST /api/columns/:id/cards` crée une carte
- [x] `GET /api/cards/:id` retourne une carte (avec assignee, labels, commentaires)
- [x] `PATCH /api/cards/:id` met à jour titre/description/date/labels/assignee
- [x] `DELETE /api/cards/:id` supprime une carte + ses commentaires
- [x] `POST /api/cards/:id/move` déplace une carte vers une autre colonne
- [x] `POST /api/cards/reorder` réordonne les cartes
- [x] Client expose les 7 méthodes
- [x] Tests e2e : CRUD complet, move entre colonnes, reorder, erreurs
