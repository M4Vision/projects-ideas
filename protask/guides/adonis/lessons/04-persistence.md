## Objectif

Configurer SQLite, créer la table `users` via une migration et le modèle Lucid correspondant.

## Ce que tu vas obtenir

Un modèle `User` complet avec les champs id, name, email, password et createdAt, stocké dans SQLite.

## Pourquoi maintenant ?

Jusqu'ici les utilisateurs étaient en mémoire. Pour une vraie API, il faut persister les données. Lucid ORM est l'outil AdonisJS pour interagir avec la base de données.

## Fais-le avec moi

### 1. Configurer la base de données

Dans `config/database.ts`, configure Lucid pour utiliser SQLite :

```typescript
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const databaseConfig = defineConfig({
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: { filename: env.get('DB_PATH', './tmp/data.db') },
      useNullAsDefault: true,
    },
  },
})
```

### 2. Créer une migration

```bash
node bin/console.ts make:migration users
```

Modifie la migration générée dans `database/migrations/` :

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 100).notNullable()
      table.string('email', 180).unique().notNullable()
      table.string('password', 255).notNullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### 3. Créer le modèle

Dans `app/models/User.ts` :

```typescript
import { DateTime } from 'luxon'
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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
```

### 4. Exécuter la migration

```bash
node bin/console.ts migration:run
```

## Vérifie maintenant

Redémarre le serveur et connecte-toi avec l'utilisateur créé précédemment. Les données sont maintenant persistées dans SQLite.

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass1234"}'
```

## Si cela échoue

- **Erreur "table users already exists"** : exécute `node bin/console.ts migration:rollback` puis relance.
- **Erreur "better-sqlite3"** : vérifie que better-sqlite3 est bien installé dans `node_modules/`.
- **Erreur Lucid** : vérifie que `@adonisjs/lucid` est bien dans `package.json` et que la configuration est correcte.

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `protask/guides/adonis/checkpoints/04-persistence/`

Fichiers créés : `config/database.ts`, `database/migrations/1725000000000_create_users.ts`, `app/models/User.ts`

</details>
