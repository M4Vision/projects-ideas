## Objectif

Créer un middleware d'authentification simulé et exposer l'utilisateur connecté.

## Ce que tu vas obtenir

- Middleware qui extrait le userId du token Bearer
- Routes protégées : `GET /api/users/me`, `PUT /api/users/me`, `GET /api/users/:id`

## Pourquoi maintenant ?

Sans middleware, chaque contrôleur devrait répéter la logique d'extraction du token. Un middleware centralise cette responsabilité et protège toutes les routes du groupe.

## Fais-le avec moi

### 1. Créer le middleware

Dans `app/middleware/MockAuthMiddleware.ts` :

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
    ctx.request.userId = userId
    await next()
  }
}
```

### 2. Appliquer le middleware aux routes protégées

Dans `start/routes.ts`, groupe les routes protégées avec le middleware :

```typescript
router.group(() => {
  router.get('/api/users/me', [UsersController, 'me'])
  router.put('/api/users/me', [UsersController, 'updateMe'])
  router.get('/api/users/:id', [UsersController, 'show'])
}).use([async (ctx, next) => {
  const { default: Middleware } = await import('../app/middleware/MockAuthMiddleware.js')
  return new Middleware().handle(ctx, next)
}])
```

### 3. Créer UsersController

Dans `app/controllers/UsersController.ts` :

```typescript
import { HttpContext } from '@adonisjs/core/http'
import User from '../models/User.js'

export default class UsersController {
  async me({ request, response }: HttpContext) {
    const user = await User.find(request.userId)
    return response.json(user)
  }

  async updateMe({ request, response }: HttpContext) {
    const user = await User.find(request.userId)
    user.merge(request.body())
    await user.save()
    return response.json(user)
  }

  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.status(404).json({ error: 'Utilisateur introuvable.' })
    return response.json(user)
  }
}
```

## Vérifie maintenant

```bash
# Connexion
TOKEN=$(curl -s -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass1234"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

# Route protégée
curl http://localhost:3333/api/users/me -H "Authorization: Bearer $TOKEN"

# Sans token (doit échouer)
curl http://localhost:3333/api/users/me
```

## Si cela échoue

- **401 sans token** : normal, le middleware bloque les requêtes sans token.
- **Erreur "Cannot read properties of undefined"** : vérifie que `ctx.request.userId` est bien défini.
- **Erreur "Cannot find module"** : vérifie le chemin du middleware dans `routes.ts`.

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `protask/guides/adonis/checkpoints/05-current-user/`

Fichiers créés : `app/middleware/MockAuthMiddleware.ts`, `app/controllers/UsersController.ts`

Fichiers modifiés : `start/routes.ts`

</details>
