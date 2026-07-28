## Objectif

CRUD complet des colonnes et des cartes avec réordonnancement et déplacement entre colonnes.

## Ce que tu vas obtenir

- Routes colonnes : index, create, update, delete, reorder
- Routes cartes : index, create, show, update, delete, reorder, move

## Pourquoi maintenant ?

Colonnes et cartes sont le cœur du Kanban. Chaque board a des colonnes, chaque colonne a des cartes, et l'utilisateur doit pouvoir réordonner et déplacer les cartes.

## Fais-le avec moi

### 1. Implémenter ColumnsController

```typescript
import { HttpContext } from '@adonisjs/core/http'
import ProjectColumn from '../models/ProjectColumn.js'

export default class ColumnsController {
  async index({ params, response }: HttpContext) {
    const columns = await ProjectColumn.query()
      .where('boardId', params.boardId)
      .orderBy('order', 'asc')
    return response.json(columns)
  }

  async store({ params, request, response }: HttpContext) {
    const column = await ProjectColumn.create({
      ...request.body(),
      boardId: params.boardId,
    })
    return response.status(201).json(column)
  }

  async reorder({ request, response }: HttpContext) {
    const items = request.body()
    for (const item of items) {
      const col = await ProjectColumn.find(item.id)
      if (col) col.order = item.order
    }
    const all = await ProjectColumn.all()
    return response.json(all)
  }

  async update({ params, request, response }: HttpContext) {
    const col = await ProjectColumn.find(params.id)
    if (!col) return response.status(404).json({ error: 'Colonne introuvable.' })
    col.merge(request.body())
    await col.save()
    return response.json(col)
  }

  async destroy({ params, response }: HttpContext) {
    const col = await ProjectColumn.find(params.id)
    if (!col) return response.status(404).json({ error: 'Colonne introuvable.' })
    await col.delete()
    return response.status(204)
  }
}
```

### 2. Attention à l'ordre des routes

Les routes spécifiques (`reorder`, `move`) doivent être déclarées **avant** les routes avec paramètre `:id` dans `start/routes.ts` :

```typescript
// AVANT :id
router.put('/api/columns/reorder', [ColumnsController, 'reorder'])
router.post('/api/cards/reorder', [CardsController, 'reorder'])
router.post('/api/cards/:id/move', [CardsController, 'move'])

// APRÈS
router.get('/api/columns/:columnId/cards', [CardsController, 'index'])
router.get('/api/cards/:id', [CardsController, 'show'])
```

### 3. Le modèle Card

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/orm'
import ProjectColumn from './ProjectColumn.js'

export default class Card extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare description: string | null
  @column() declare order: number
  @column() declare columnId: number
  @column.date() declare dueDate: DateTime | null
  @column() declare assigneeId: number | null
  @column() declare labelIds: number[]

  @belongsTo(() => ProjectColumn)
  declare column: BelongsTo<typeof ProjectColumn>
}
```

## Vérifie maintenant

```bash
# Créer une colonne
curl -X POST http://localhost:3333/api/boards/1/columns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Nouvelle","color":"#FF9800"}'

# Créer une carte
curl -X POST http://localhost:3333/api/columns/1/cards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ma première carte"}'
```

## Si cela échoue

- **La route reorder ne fonctionne pas** : vérifie qu'elle est déclarée avant `:id` dans `routes.ts`.
- **Erreur "columnId is required"** : vérifie le nom du paramètre dans la route (`columnId` vs `column_id`).
- **Les cartes ne s'affichent pas** : vérifie la relation entre Column et Card.

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `protask/guides/adonis/checkpoints/07-kanban-core/`

Fichiers créés : `app/models/Card.ts`, `app/controllers/ColumnsController.ts`, `app/controllers/CardsController.ts`

Fichiers modifiés : `start/routes.ts`, `database/migrations/`

</details>
