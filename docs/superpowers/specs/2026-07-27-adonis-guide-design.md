# Design du guide AdonisJS pour ProTask

> **Objectif** : Ajouter un guide pédagogique complet pour implémenter l'API ProTask avec AdonisJS 6, Lucid ORM et SQLite.

**Tech Stack** : Node.js v24, AdonisJS 6, Lucid ORM, better-sqlite3, TypeScript 5

---

## 1. Structure du projet

```
protask/guides/adonis/
├── app/
│   ├── models/
│   │   ├── User.ts
│   │   ├── Board.ts
│   │   ├── ProjectColumn.ts
│   │   ├── Card.ts
│   │   ├── Label.ts
│   │   ├── Comment.ts
│   │   └── Invitation.ts
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── UsersController.ts
│   │   ├── BoardsController.ts
│   │   ├── ColumnsController.ts
│   │   ├── CardsController.ts
│   │   ├── LabelsController.ts
│   │   ├── CommentsController.ts
│   │   ├── InvitationsController.ts
│   │   └── ResetController.ts
│   └── middleware/
│       └── MockAuthMiddleware.ts
├── config/
│   ├── app.ts
│   ├── bodyparser.ts
│   ├── database.ts
│   └── cors.ts
├── database/
│   └── migrations/
│       ├── 1725000000000_create_users.ts
│       ├── 1725000000001_create_boards.ts
│       ├── 1725000000002_create_project_columns.ts
│       ├── 1725000000003_create_cards.ts
│       ├── 1725000000004_create_labels.ts
│       ├── 1725000000005_create_comments.ts
│       ├── 1725000000006_create_invitations.ts
│       └── seed.ts
├── start/
│   └── routes.ts
├── ace.js
├── ace.json
├── adonisrc.json
├── tsconfig.json
├── package.json
└── index.md
```

### Principes de conception

- **AdonisJS 6** avec Lucid ORM (Active Record, comme Eloquent)
- **SQLite** via better-sqlite3 (même stack que NestJS)
- **7 modèles** Lucid — chaque modèle étend `Model`, avec relations `@hasMany`, `@belongsTo`
- **8 migrations** (7 tables + 1 seed) — timestamps numériques pour l'ordre
- **9 contrôleurs** — pattern CRUD, retournant des réponses HTTP standard
- **1 middleware** — MockAuthMiddleware global, extrait `Authorization: Bearer token-{userId}`
- **Auth mockée** — pas de vrai JWT/session, header Bearer token-{userId} comme les autres guides
- **3 routes publiques** : register, login, logout, \_reset
- **Reset** : `POST /api/_reset`, supprime et re-seed avec `PRAGMA foreign_keys = OFF`
- **Validation manuelle** — format `{ error: string }` compatible OpenAPI (pas de validation automatique AdonisJS)

### Migrations : schémas des 7 tables

Chaque migration définit une table avec `schema.createTable()`. Types AdonisJS/Lucid pour SQLite.

**users** : `id` (incrémental), `name` string(100), `email` string(150) unique, `password` string(100), `avatar` string(500) defaultsTo(''), `created_at`, `updated_at`

**boards** : `id`, `title` string(200), `owner_id` référence → users, `description` text nullable, `color` string(7) nullable, `categories` json nullable, `member_ids` json defaultsTo('[]'), timestamps

**project_columns** : `id`, `title` string(200), `order_column` integer, `board_id` référence → boards, `color` string(7) nullable, `description` text nullable, timestamps

**cards** : `id`, `title` string(200), `description` text nullable, `order_column` integer, `column_id` référence → project_columns, `due_date` date nullable, `assignee_id` integer nullable référence → users, `label_ids` json defaultsTo('[]'), timestamps

**labels** : `id`, `name` string(100), `color` string(7), `description` text nullable, `board_id` référence → boards, timestamps

**comments** : `id`, `text` text, `author_id` référence → users, `card_id` référence → cards, timestamps

**invitations** : `id`, `board_id` référence → boards, `user_id` référence → users, `status` string(20) defaultsTo('pending'), timestamps

### Contrôleurs : routes et responsabilités

| Contrôleur | Routes | Méthodes |
|---|---|---|
| AuthController | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` | register, login, logout |
| UsersController | `GET /users/me`, `PUT /users/me`, `GET /users/:id` | me, updateMe, show |
| BoardsController | `GET /boards`, `POST /boards`, `GET /boards/:id`, `PUT /boards/:id`, `DELETE /boards/:id` | index, store, show, update, destroy |
| ColumnsController | `GET /boards/:id/columns`, `POST /boards/:id/columns`, `PUT /columns/reorder`, `PUT /columns/:id`, `DELETE /columns/:id` | index, store, reorder, update, destroy |
| CardsController | `GET /columns/:id/cards`, `POST /columns/:id/cards`, `GET /cards/:id`, `PATCH /cards/:id`, `DELETE /cards/:id`, `POST /cards/reorder`, `POST /cards/:id/move` | index, store, show, update, destroy, reorder, move |
| LabelsController | `GET /boards/:id/labels`, `POST /boards/:id/labels`, `PATCH /labels/:id`, `DELETE /labels/:id` | index, store, update, destroy |
| CommentsController | `GET /cards/:id/comments`, `POST /cards/:id/comments`, `DELETE /comments/:id` | index, store, destroy |
| InvitationsController | `GET /boards/:id/invitations`, `POST /boards/:id/invitations`, `PATCH /invitations/:id`, `DELETE /invitations/:id`, `DELETE /boards/:id/members/:userId` | index, store, update, destroy, removeMember |
| ResetController | `POST /_reset` | reset |

### Modules Lucid ORM

AdonisJS 6 utilise Lucid ORM (Active Record). Points clés :

- Modèles dans `app/models/`, étendent `Model` de `@adonisjs/lucid`
- Relations : `@hasMany`, `@belongsTo`, `@manyToMany` (décorateurs)
- `order_column` au lieu de `order` (mot réservé SQL) — exposé comme `order` dans les réponses
- Colonnes JSON : Lucid utilise le type `json` avec conversion automatique en tableaux JS
- `label_ids` : colonne JSON, résolue manuellement dans `Card.toJSON()` via `Label.query().whereIn('id', this.labelIds)`

### Seed

Fichier `database/seed.ts` exécutable via `node ace db:seed`. Contenu :

- 3 users (Alexandre, Sophie, Marc, mots de passe en clair)
- 3 boards (Design System, Refonte Mobile, Marketing Q2)
- 8 colonnes (Backlog ×2, En cours ×2, Terminé ×2, Idées, En production)
- 10 cards réparties avec assignees et label_ids
- 4 labels (Design, Dev, Documentation, Urgent)
- 5 commentaires
- 2 invitations (1 acceptée, 1 en attente)

IDs explicites (hardcodés) pour prédictibilité.

### MockAuthMiddleware

Middleware global qui :
1. Extrait le header `Authorization`
2. Vérifie le format `Bearer token-{userId}`
3. Stocke `userId` dans `ctx.auth` (ou `ctx.request.userId`)
4. Passe au contrôleur suivant

### Reset

Route `POST /api/_reset` :
1. Désactive les foreign keys : `PRAGMA foreign_keys = OFF`
2. Supprime dans l'ordre inverse des dépendances
3. Réactive les foreign keys
4. Reset auto-increment : `DELETE FROM sqlite_sequence`
5. Exécute le seed

### Guide index.md

~700 lignes, 10 sections, français. Même format que Laravel/NestJS :

1. Setup — installation AdonisJS 6 avec Ace
2. Structure du projet — arborescence commentée
3. Migrations et modèles — 7 modèles Lucid avec relations
4. Données de démonstration — seed avec 3 users, 3 boards, etc.
5. Authentification — MockAuthMiddleware global, routes publiques
6. Routes — start/routes.ts, ordre des routes
7. Contrôleurs — 9 contrôleurs, patterns CRUD, reorder/move
8. Reset — route interne
9. Tests — 53 tests partagés
10. Déploiement — build, PM2, nginx

---

## 2. Contraintes globales

- Node.js v24+
- AdonisJS 6 (dernière version stable)
- SQLite via better-sqlite3
- TypeScript strict
- Pas de framework JS (vanilla JS dans les templates)
- `order` = mot réservé SQL → colonne `order_column` en DB, exposée comme `order` en API
- Validation manuelle (format `{ error: string }` compatible OpenAPI)
- IDs en dur dans le seed (pas d'auto-increment implicite)
- Pas de hash bcrypt (mots de passe en clair)
- Pas de console.log en production

---

## 3. Tests

53 tests e2e partagés dans `protask/api/e2e.spec.js`. Commande :

```bash
API_BASE_URL=http://localhost:3333/api pnpm test:api
```

Le port AdonisJS par défaut est 3333 (modifiable via `.env` `PORT=3333`).

---

## 4. Déviations par rapport aux autres guides

- AdonisJS utilise Lucid (Active Record) comme Laravel, pas TypeORM (Data Mapper)
- Les modèles sont dans `app/models/`, pas d'entités séparées
- Les migrations sont gérées par `@adonisjs/lucid` avec des timestamps numériques
- Port par défaut 3333 (vs 3000 pour NestJS, 8000 pour Laravel)
- Route `_reset` accessible sans préfixe `/api` dans AdonisJS (car configurée manuellement)
