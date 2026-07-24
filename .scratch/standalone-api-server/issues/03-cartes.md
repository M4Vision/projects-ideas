# 03 — Cartes

**What to build:** Routes cartes (CRUD + move + reorder) ajoutées au serveur. Méthodes `getCards()`, `getCard()`, `createCard()`, `updateCard()`, `deleteCard()`, `moveCard()`, `reorderCards()` dans le client. Tests e2e pour le groupe cartes.

**Blocked by:** 02 — Boards & Colonnes

**Status:** ready-for-agent

- [ ] `GET /api/columns/:id/cards` liste les cartes d'une colonne (avec assignee et labels résolus)
- [ ] `POST /api/columns/:id/cards` crée une carte
- [ ] `GET /api/cards/:id` retourne une carte (avec assignee, labels, commentaires)
- [ ] `PATCH /api/cards/:id` met à jour titre/description/date/labels/assignee
- [ ] `DELETE /api/cards/:id` supprime une carte + ses commentaires
- [ ] `POST /api/cards/:id/move` déplace une carte vers une autre colonne
- [ ] `POST /api/cards/reorder` réordonne les cartes
- [ ] Client expose les 7 méthodes
- [ ] Tests e2e : CRUD complet, move entre colonnes, reorder, erreurs
