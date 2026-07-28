## Objectif

Ajouter une route de santé et une première route publique à l'API.

## Ce que tu vas obtenir

Un serveur qui répond à `GET /api/health` avec `{ "status": "ok" }`.

## Pourquoi maintenant ?

Avant de construire l'authentification, il faut savoir comment AdonisJS relie une URL à du code. Cette leçon introduit le fichier `start/routes.ts` et la notion de contrôleur.

## Fais-le avec moi

### 1. Créer le fichier de routes

Dans `start/routes.ts`, importe le routeur et définis une route :

```typescript
import router from '@adonisjs/core/services/router'

router.get('/api/health', async ({ response }) => {
  return response.json({ status: 'ok' })
})
```

### 2. Redémarrer le serveur

```bash
node bin/server.ts
```

Teste avec curl :

```bash
curl http://localhost:3333/api/health
```

Tu devrais recevoir `{"status":"ok"}`.

### 3. Créer un contrôleur

Sépare la logique dans un contrôleur. Crée `app/controllers/AuthController.ts` :

```typescript
import { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async health({ response }: HttpContext) {
    return response.json({ status: 'ok' })
  }
}
```

Puis modifie la route pour utiliser le contrôleur :

```typescript
const AuthController = () => import('../app/controllers/AuthController.js')
router.get('/api/health', [AuthController, 'health'])
```

## Vérifie maintenant

Redémarre le serveur et exécute :

```bash
curl http://localhost:3333/api/health
```

Résultat attendu : `{"status":"ok"}`.

## Si cela échoue

- **Erreur "Cannot find module"** : vérifie le chemin d'import du contrôleur (extension `.js` même en TypeScript).
- **Erreur "route not found"** : vérifie que le fichier `start/routes.ts` est bien au bon endroit.

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `protask/guides/adonis/checkpoints/02-first-server/`

Fichiers modifiés : `start/routes.ts`, `app/controllers/AuthController.ts`

</details>
