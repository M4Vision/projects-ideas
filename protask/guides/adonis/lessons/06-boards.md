## Objectif

Implémenter le CRUD complet des boards avec vérification d'appartenance.

## Ce que tu vas obtenir

5 routes REST pour les boards : index, create, show, update, delete, avec création automatique des colonnes par défaut.

## Pourquoi maintenant ?

Les boards sont la structure racine du Kanban. Chaque board contient des colonnes, qui contiennent des cartes. Sans les boards, rien d'autre ne peut exister.

## Fais-le avec moi

### 1. Créer les modèles Board et ProjectColumn

Board (`app/models/Board.ts`) a besoin de : id, title, ownerId, description?, color?, categories?, memberIds, createdAt.

ProjectColumn (`app/models/ProjectColumn.ts`) a besoin de : id, title, order, boardId, color?, description?.

La relation : un board a plusieurs colonnes (`@hasMany`), une colonne appartient à un board (`@belongsTo`).

### 2. Implémenter BoardsController

Dans `app/controllers/BoardsController.ts` :

```typescript
import { HttpContext } from '@adonisjs/core/http'
import Board from '../models/Board.js'
import ProjectColumn from '../models/ProjectColumn.js'

export default class BoardsController {
  async index({ request, response }: HttpContext) {
    const boards = await Board.query()
      .where('ownerId', request.userId)
      .orWhereRaw('JSON_CONTAINS(memberIds, ?)', JSON.stringify(request.userId))
      .preload('columns')
    return response.json(boards)
  }

  async store({ request, response }: HttpContext) {
    const board = await Board.create({ ...request.body(), ownerId: request.userId })
    // Créer les colonnes par défaut
    await ProjectColumn.createMany([
      { boardId: board.id, title: 'Backlog', order: 0 },
      { boardId: board.id, title: 'En cours', order: 1 },
      { boardId: board.id, title: 'Terminé', order: 2 },
    ])
    return response.status(201).json(board)
  }
  // ... show, update, destroy
}
```

### 3. Ajouter les routes

Ajoute les 5 routes boards dans le groupe protégé :

```typescript
router.get('/api/boards', [BoardsController, 'index'])
router.post('/api/boards', [BoardsController, 'store'])
router.get('/api/boards/:id', [BoardsController, 'show'])
router.put('/api/boards/:id', [BoardsController, 'update'])
router.delete('/api/boards/:id', [BoardsController, 'destroy'])
```

## Vérifie maintenant

```bash
TOKEN=$(curl -s -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@protask.dev","password":"pass123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

# Créer un board
curl -X POST http://localhost:3333/api/boards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Mon projet"}'

# Lister les boards
curl http://localhost:3333/api/boards -H "Authorization: Bearer $TOKEN"
```

## Si cela échoue

- **Erreur 500 "column not found"** : vérifie que la migration boards a bien été exécutée.
- **Board vide** : vérifie que le JSON de la requête contient bien un titre.

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `protask/guides/adonis/checkpoints/06-boards/`

Fichiers créés : `app/models/Board.ts`, `app/models/ProjectColumn.ts`, `app/controllers/BoardsController.ts`

Fichiers modifiés : `start/routes.ts`, `database/migrations/`

</details>
