# Guide d'implémentation {Framework} pour {Projet}

> **Objectif** : Implémenter les {N} routes de l'API {Projet} avec {Framework}, étape par étape.

**Prérequis** : {PHP 8.2+, Composer, etc.}

**Durée estimée** : {2-3 heures}

---

## 1. Setup

Installation, création du projet, dépendances.

## 2. Structure du projet

Arborescence des fichiers, explication des dossiers clés.

## 3. Modèles / schémas de données

Définition des entités : User, Board, Column, Card, Label, Comment, Invitation.

## 4. Routes groupées par ressource

### 4.1 Authentification
- POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout
- GET /api/users/me, PUT /api/users/me

### 4.2 Boards
- GET /api/boards, POST /api/boards, GET /api/boards/:id, PUT /api/boards/:id, DELETE /api/boards/:id

### 4.3 Colonnes
- GET /api/boards/:id/columns, POST /api/boards/:id/columns
- PUT /api/columns/reorder, PUT /api/columns/:id, DELETE /api/columns/:id

### 4.4 Cartes
- GET /api/columns/:id/cards, POST /api/columns/:id/cards
- GET /api/cards/:id, PATCH /api/cards/:id, DELETE /api/cards/:id
- POST /api/cards/reorder, POST /api/cards/:id/move

### 4.5 Labels
- GET /api/boards/:id/labels, POST /api/boards/:id/labels
- PATCH /api/labels/:id, DELETE /api/labels/:id

### 4.6 Commentaires
- GET /api/cards/:id/comments, POST /api/cards/:id/comments, DELETE /api/comments/:id

### 4.7 Invitations
- GET /api/boards/:id/invitations, POST /api/boards/:id/invitations
- PATCH /api/invitations/:id, DELETE /api/invitations/:id
- DELETE /api/boards/:id/members/:userId

## 5. Authentification

Middleware, header Bearer token.

## 6. Tests

Lancer la batterie de tests existante contre ce serveur :

```bash
API_BASE_URL=http://localhost:{PORT}/api pnpm test:api
```

## 7. Déploiement

Variables d'environnement, configuration production.
