# Guide d'implémentation AdonisJS 6 pour ProTask

> **Objectif** : Implémenter les 19 routes de l'API ProTask avec AdonisJS 6.21, Lucid ORM et better-sqlite3, étape par étape.

**Prérequis** : Node.js v24+, pnpm

**Connaissances** : Bases de TypeScript, notions de MVC.

**Durée estimée** : 3-4 heures

---

## 1. Setup

```bash
mkdir protask-adonis && cd protask-adonis
pnpm init

# AdonisJS 6 core
pnpm add @adonisjs/core@6.21.0
pnpm add @adonisjs/lucid@21.8.2
pnpm add @adonisjs/bodyparser
pnpm add better-sqlite3
pnpm add luxon
pnpm add -D tsx @types/better-sqlite3 @types/luxon

# Démarrage
node --import tsx bin/server.ts
```

AdonisJS 6 utilise un `--import tsx` natif pour TypeScript, pas de CLI nécessaire. Tout part du `bin/server.ts`.

### Fichier `.env`

```env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
SESSION_DRIVER=cookie
```

### `env.ts`

```typescript
import env from '@adonisjs/core/env'

export default env.create({
  PORT: env.number(),
  HOST: env.string({ default: '0.0.0.0' }),
  NODE_ENV: env.enum(['development', 'production', 'test'] as const),
})
```

### `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### `adonisrc.js`

```javascript
export default {
  typescript: true,
  providers: [
    { file: () => import('@adonisjs/core/providers/app_provider') },
    { file: () => import('@adonisjs/lucid/database_provider') },
  ],
  preloads: [
    { file: () => import('./start/routes.js') },
    { file: () => import('./start/kernel.js') },
  ],
  commands: [
    '@adonisjs/core/commands',
    '@adonisjs/lucid/commands',
  ],
  directories: {
    config: 'config',
    controllers: 'app/controllers',
    middleware: 'app/middleware',
    models: 'app/models',
    migrations: 'database/migrations',
    start: 'start',
  },
}
```

---

## 2. Structure du projet

```
protask/guides/adonis/
├── adonisrc.js
├── tsconfig.json
├── env.ts
├── .env
├── bin/
│   ├── server.ts              ← Point d'entrée HTTP
│   └── console.ts             ← Point d'entrée ACE (CLI)
├── config/
│   ├── app.ts
│   ├── database.ts
│   ├── logger.ts
│   ├── bodyparser.ts
│   └── cors.ts
├── start/
│   ├── kernel.ts              ← Middleware global
│   └── routes.ts              ← Routes API
├── app/
│   ├── models/                ← Modèles Lucid (7)
│   ├── controllers/           ← Contrôleurs (9)
│   └── middleware/            ← Middleware (1)
└── database/
    ├── migrations/            ← Migrations Lucid (7)
    └── seeders/               ← Seed
```

AdonisJS 6 suit le pattern **MVC avec providers** : chaque fichier dans `config/` est chargé automatiquement dans un namespace (ex: `config/logger.ts` → `logger.*`).

---

## 3. Base de données

### Config `config/database.ts`

```typescript
export default {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: { filename: './data.db' },
      useNullAsDefault: true,
      migrations: { paths: ['./database/migrations'] },
    },
  },
}
```

### Migrations

AdonisJS utilise **Lucid Schema Builder** (wrapper Knex) pour les migrations. Chaque fichier exporte une classe qui étend `BaseSchema` :

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 100).notNullable()
      table.string('email', 200).unique().notNullable()
      table.string('password', 200).notNullable()
      table.string('avatar', 500).nullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

7 migrations créées (ordre chronologique par timestamp) :
1. `1725000000000_create_users.ts`
2. `1725000000001_create_boards.ts` — `json` pour `categories` et `member_ids`
3. `1725000000002_create_project_columns.ts`
4. `1725000000003_create_cards.ts` — `json` pour `label_ids`
5. `1725000000004_create_labels.ts`
6. `1725000000005_create_comments.ts`
7. `1725000000006_create_invitations.ts`

Les colonnes `json` en SQLite stockent la valeur comme texte. Lucid les manipule via les hooks `prepare`/`consume` (voir § Modèles).

### Exécution

```bash
# Créer une migration
node --import tsx bin/console.ts make:migration create_boards

# Appliquer
node --import tsx bin/console.ts migration:run

# Rollback
node --import tsx bin/console.ts migration:rollback

# Seed
node --import tsx bin/console.ts db:seed
```

> **Note** : Laravel utilise `php artisan make:migration`. AdonisJS utilise `node ace make:migration`. ACE est le CLI intégré d'AdonisJS.

---

## 4. Modèles (Lucid ORM)

AdonisJS utilise des décorateurs TypeScript (`@column`, `@belongsTo`, `@hasMany`) pour définir les colonnes et relations.

### User

```typescript
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare avatar: string | null

  toResponse() {
    return { id: this.id, name: this.name, email: this.email, avatar: this.avatar }
  }
}
```

### Board (avec colonnes JSON)

```typescript
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/orm'
import ProjectColumn from './ProjectColumn.js'

export default class Board extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare ownerId: number

  @column({
    prepare: (v: string[] | null) => v ? JSON.stringify(v) : null,
    consume: (v: string | null) => v ? JSON.parse(v) : [],
  })
  declare categories: string[] | null

  @column({
    prepare: (v: number[] | null) => v ? JSON.stringify(v) : null,
    consume: (v: string | null) => v ? JSON.parse(v) : [],
  })
  declare memberIds: number[]

  @hasMany(() => ProjectColumn)
  declare columns: HasMany<typeof ProjectColumn>
}
```

> **Note** : Les colonnes `json` de SQLite sont stockées comme texte. Les hooks `prepare` (écriture) et `consume` (lecture) assurent la sérialisation JSON automatiquement. Dans NestJS/TypeORM, cela se fait via `@Column('simple-json')`.

### Card

```typescript
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/orm'

export default class Card extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare orderColumn: number

  @column()
  declare columnId: number

  @column({
    prepare: (v: number[]) => v ? JSON.stringify(v) : '[]',
    consume: (v: string) => v ? JSON.parse(v) : [],
  })
  declare labelIds: number[]

  @column.date()
  declare dueDate: string | null

  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>

  @belongsTo(() => ProjectColumn, { foreignKey: 'columnId' })
  declare column: BelongsTo<typeof ProjectColumn>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>
}
```

### Seed

```typescript
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '../app/models/User.js'
import Board from '../app/models/Board.js'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      { id: 1, name: 'Alexandre', email: 'alex@protask.dev', password: 'pass123', avatar: '' },
      { id: 2, name: 'Sophie', email: 'sophie@protask.dev', password: 'pass123', avatar: '' },
      { id: 3, name: 'Marc', email: 'marc@protask.dev', password: 'pass123', avatar: '' },
    ])

    await Board.createMany([
      { id: 1, title: 'Design System', ownerId: 1, description: 'Composants et design tokens', color: '#1976D2', categories: ['Design', 'UI/UX'], memberIds: [2, 3] },
      { id: 2, title: 'Refonte Mobile', ownerId: 2, description: 'Application mobile', color: '#388E3C', categories: ['Mobile'], memberIds: [1] },
      { id: 3, title: 'Marketing Q2', ownerId: 3, description: 'Campagne marketing Q2', color: '#F57C00', categories: ['Marketing'], memberIds: [1, 2] },
    ])
    // ... ProjectColumn, Card, Label, Comment, Invitation
  }
}
```

---

## 5. Middleware d'authentification

AdonisJS 6 distingue **middleware global** (enregistré via `server.use()` dans `start/kernel.ts`) et **middleware de route** (appliqué à un groupe via `.use()`).

Le `MockAuthMiddleware` est un middleware de route, appliqué uniquement au groupe protégé, pas globalement.

### `app/middleware/MockAuthMiddleware.ts`

```typescript
import { HttpContext } from '@adonisjs/core/http'

export default class MockAuthMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const auth = ctx.request.header('Authorization') || ''

    if (!auth.startsWith('Bearer token-')) {
      return ctx.response.status(401).json({
        error: 'Token manquant ou invalide.',
        statusCode: 401,
      })
    }

    const userId = parseInt(auth.slice('Bearer token-'.length), 10)
    if (isNaN(userId) || userId <= 0) {
      return ctx.response.status(401).json({
        error: 'Token invalide.',
        statusCode: 401,
      })
    }

    ctx.request.userId = userId
    await next()
  }
}
```

### `start/kernel.ts`

```typescript
import server from '@adonisjs/core/services/server'

server.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
])
```

### Application au groupe de routes

Dans `start/routes.ts`, le middleware est passé comme fonction asynchrone au groupe :

```typescript
router.group(() => {
  // routes protégées...
}).use([async (ctx, next) => {
  const { default: Middleware } = await import('../app/middleware/MockAuthMiddleware.js')
  return new Middleware().handle(ctx, next)
}])
```

> **Note** : Dans NestJS, les guards sont des classes décorées avec `@Injectable()` et globales via `app.useGlobalGuards()`. AdonisJS utilise un système de middleware en pipeline — chaque middleware peut stopper le flux ou passer au suivant via `next()`.

---

## 6. Routes

### `start/routes.ts`

```typescript
import router from '@adonisjs/core/services/router'

// Lazy loading des contrôleurs
const AuthController = () => import('../app/controllers/AuthController.js')
const UsersController = () => import('../app/controllers/UsersController.js')
// ...

// Routes publiques
router.post('/api/auth/register', [AuthController, 'register'])
router.post('/api/auth/login', [AuthController, 'login'])
router.post('/api/auth/logout', [AuthController, 'logout'])
router.post('/api/_reset', [ResetController, 'reset'])

// Routes protégées
router.group(() => {
  router.get('/api/users/me', [UsersController, 'me'])
  router.put('/api/users/me', [UsersController, 'updateMe'])
  router.get('/api/users/:id', [UsersController, 'show'])
  // ... boards, columns, cards, labels, comments, invitations
}).use([async (ctx, next) => {
  const { default: Middleware } = await import('../app/middleware/MockAuthMiddleware.js')
  return new Middleware().handle(ctx, next)
}])
```

### Lazy loading des contrôleurs

AdonisJS utilise `() => import(...)` pour les contrôleurs au lieu de `import` statique. Cela permet :
- Le **lazy loading** : le fichier n'est chargé qu'à la première requête
- Pas de **dépendances circulaires** entre routes et modèles
- Compatible avec le **hot-reload** Vite

Syntaxe : `[ControllerImport, 'methodName']` — similaire à NestJS `@Controller()` + méthode.

### Ordre des routes

Les routes paramétrées (`:id`) et les routes nommées (`/reorder`) doivent être déclarées dans le bon ordre :

```typescript
// AVANT /columns/:id
router.put('/api/columns/reorder', [ColumnsController, 'reorder'])
router.get('/api/boards/:boardId/columns', [ColumnsController, 'index'])

// APRÈS
router.put('/api/columns/:id', [ColumnsController, 'update'])
```

> **Note** : Laravel résout ce problème avec des expressions régulières explicites. AdonisJS et NestJS utilisent l'ordre de déclaration.

---

## 7. Contrôleurs

AdonisJS 6 suit le pattern **controller as class with methods**. Chaque méthode reçoit `HttpContext` (qui encapsule `request`, `response`, etc.).

### AuthController

```typescript
import { HttpContext } from '@adonisjs/core/http'
import User from '../models/User.js'

export default class AuthController {
  async register(ctx: HttpContext) {
    const body = ctx.request.body() as any
    if (!body.name || !body.email || !body.password) {
      return ctx.response.status(400).json({ error: 'Champs requis.', statusCode: 400 })
    }

    const existing = await User.findBy('email', body.email)
    if (existing) {
      return ctx.response.status(400).json({ error: 'Email déjà utilisé.', statusCode: 400 })
    }

    const user = await User.create({
      name: body.name, email: body.email, password: body.password, avatar: body.avatar || '',
    })

    return ctx.response.status(201).json({
      user: user.toResponse(),
      token: 'token-' + user.id,
    })
  }
  // login, logout...
}
```

### UsersController (avec accès à l'utilisateur courant)

```typescript
export default class UsersController {
  async me(ctx: HttpContext) {
    const userId = (ctx.request as any).userId
    const user = await User.find(userId)
    return ctx.response.json(user?.toResponse() ?? { error: 'Utilisateur introuvable.' })
  }

  async updateMe(ctx: HttpContext) {
    const userId = (ctx.request as any).userId
    const user = await User.find(userId)
    if (!user) return ctx.response.status(404).json({ error: 'Utilisateur introuvable.' })

    const body = ctx.request.body() as any
    if (body.name !== undefined) user.name = body.name
    if (body.email !== undefined) user.email = body.email
    if (body.avatar !== undefined) user.avatar = body.avatar
    await user.save()

    return ctx.response.json(user.toResponse())
  }
}
```

> **Note** : `ctx.request` n'a pas de propriété `userId` par défaut. Le `MockAuthMiddleware` l'attache via `(ctx.request as any).userId = userId`. C'est un pattern simple mais efficace pour un mock auth.

### BoardsController (avec relations et chargement)

```typescript
export default class BoardsController {
  async index(ctx: HttpContext) {
    const userId = (ctx.request as any).userId
    const boards = await Board.query().where('ownerId', userId).orWhereRaw('json_extract(member_ids, \'$#\') IS NOT NULL').preload('columns')
    return ctx.response.json(boards.map(board => ({
      ...board.toJSON(),
      members: [],  // chargé via getMembers()
    })))
  }

  async show(ctx: HttpContext) {
    const board = await Board.query()
      .where('id', ctx.request.param('id'))
      .preload('columns', (q) => q.orderBy('orderColumn', 'asc'))
      .firstOrFail()
    return ctx.response.json({
      ...board.toJSON(),
      columns: board.columns,
      members: await board.getMembers(),
    })
  }
}
```

### CardsController (reorder et move)

```typescript
async reorder(ctx: HttpContext) {
  const body = ctx.request.body() as any
  if (!body.cardIds || !Array.isArray(body.cardIds)) {
    return ctx.response.status(400).json({ error: 'cardIds requis.' })
  }
  for (let i = 0; i < body.cardIds.length; i++) {
    await Card.query().where('id', body.cardIds[i]).update({ orderColumn: i })
  }
  const cards = await Card.query().whereIn('id', body.cardIds)
  return ctx.response.json(await Promise.all(cards.map(formatCard)))
}

async move(ctx: HttpContext) {
  const card = await Card.find(ctx.request.param('id'))
  if (!card) return ctx.response.status(404).json({ error: 'Carte introuvable.' })

  const body = ctx.request.body() as any
  if (body.columnId !== undefined) card.columnId = body.columnId
  if (body.order !== undefined) card.orderColumn = body.order
  await card.save()

  return ctx.response.json(await formatCard(card))
}
```

---

## 8. Configuration

### `config/app.ts`

```typescript
export default {
  appKey: 'a'.repeat(32),  // requis par AdonisJS
  http: {
    allowMethodSpoofing: false,
    trustProxy: false,
    etag: false,
    jsonpCallback: 'callback',
    cookie: {},
    forceContentNegotiationToJSON: true,
  },
}
```

### `config/bodyparser.ts`

```typescript
export default {
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
  json: { encoding: 'utf-8', limit: '1mb', strict: true, types: ['application/json'] },
  form: { encoding: 'utf-8', limit: '1mb', types: ['application/x-www-form-urlencoded'] },
  raw: { encoding: 'utf-8', limit: '1mb', types: ['text/plain'] },
  multipart: { autoProcess: true, processManually: [] },
}
```

### `config/cors.ts`

```typescript
export default {
  enabled: true,
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
}
```

---

## 9. Points clés

### Différences avec NestJS

| Aspect | AdonisJS 6 | NestJS 11 |
|--------|-----------|-----------|
| ORM | Lucid (Knex wrapper) | TypeORM / Prisma |
| CLI | ACE (`node ace`) | `@nestjs/cli` |
| Config | Fichiers dans `config/` | Fichiers `.env` + `ConfigModule` |
| Middleware | Pipeline `server.use()` + route `.use()` | Classes `@Injectable()` + `app.useGlobalGuards()` |
| Validation | VineJS (manuel) | `class-validator` + pipes |
| Routes | `start/routes.ts` | Décorateurs `@Controller()` + `@Get()` |
| SQLite JSON | `prepare`/`consume` hooks | `@Column('simple-json')` |

### Astuces

1. **Lazy loading** : Toujours utiliser `() => import(...)` pour les contrôleurs — évite les circular dependencies
2. **Ordre des routes** : Les routes spécifiques (`/reorder`) avant les routes paramétrées (`/:id`)
3. **JSON en SQLite** : Utiliser `prepare`/`consume` dans les décorateurs `@column()` pour les tableaux
4. **user_id dans request** : AdonisJS 6 n'a pas de concept d'utilisateur authentifié par défaut — le middleware attache manuellement l'ID
5. **Server.use() vs route.use()** : `server.use()` utilise `moduleImporter` (lazy import auto-résolu) ; `route.group().use()` reçoit une fonction middleware directe `(ctx, next) =>`
6. **Bin scripts** : `bin/server.ts` utilise `Ignitor.httpServer().start()` ; `bin/console.ts` utilise `Ignitor.ace().handle(process.argv.slice(2))`

---

## 10. Tests

```bash
# Démarrer le serveur
node --import tsx bin/server.ts

# Réinitialiser la base
curl -X POST http://localhost:3333/api/_reset

# Tester les 19 routes
curl -X POST http://localhost:3333/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alex@protask.dev","password":"pass123"}'

curl http://localhost:3333/api/boards \
  -H 'Authorization: Bearer token-1'
```

Le guide complet valide les 19 routes via des appels curl. Voir `test_guide.sh` pour le script complet.

---

### Résumé des 19 routes

| # | Méthode | Route | Auth |
|---|---------|-------|------|
| 1 | POST | /api/auth/register | Non |
| 2 | POST | /api/auth/login | Non |
| 3 | POST | /api/auth/logout | Non |
| 4 | POST | /api/_reset | Non |
| 5 | GET | /api/users/me | Oui |
| 6 | PUT | /api/users/me | Oui |
| 7 | GET | /api/users/:id | Oui |
| 8 | GET | /api/boards | Oui |
| 9 | POST | /api/boards | Oui |
| 10 | GET | /api/boards/:id | Oui |
| 11 | PUT | /api/boards/:id | Oui |
| 12 | DELETE | /api/boards/:id | Oui |
| 13 | GET | /api/boards/:boardId/columns | Oui |
| 14 | POST | /api/boards/:boardId/columns | Oui |
| 15 | PUT | /api/columns/reorder | Oui |
| 16 | PUT | /api/columns/:id | Oui |
| 17 | DELETE | /api/columns/:id | Oui |
| 18 | GET | /api/columns/:columnId/cards | Oui |
| 19 | POST | /api/columns/:columnId/cards | Oui |
| 20 | GET | /api/cards/:id | Oui |
| 21 | PATCH | /api/cards/:id | Oui |
| 22 | DELETE | /api/cards/:id | Oui |
| 23 | POST | /api/cards/reorder | Oui |
| 24 | POST | /api/cards/:id/move | Oui |
| 25 | GET | /api/boards/:boardId/labels | Oui |
| 26 | POST | /api/boards/:boardId/labels | Oui |
| 27 | PATCH | /api/labels/:id | Oui |
| 28 | DELETE | /api/labels/:id | Oui |
| 29 | GET | /api/cards/:cardId/comments | Oui |
| 30 | POST | /api/cards/:cardId/comments | Oui |
| 31 | DELETE | /api/comments/:id | Oui |
| 32 | GET | /api/boards/:boardId/invitations | Oui |
| 33 | POST | /api/boards/:boardId/invitations | Oui |
| 34 | PATCH | /api/invitations/:id | Oui |
| 35 | DELETE | /api/invitations/:id | Oui |
| 36 | DELETE | /api/boards/:boardId/members/:memberId | Oui |
