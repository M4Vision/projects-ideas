## Objectif

Implémenter l'inscription, la connexion et la déconnexion avec validation des champs et token simulé.

## Ce que tu vas obtenir

Un point d'entrée API complet pour gérer les utilisateurs : `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`.

## Pourquoi maintenant ?

L'authentification est le socle de toutes les autres routes. Chaque requête ultérieure aura besoin d'un token pour identifier l'utilisateur.

## Fais-le avec moi

### 1. Implémenter le contrôleur d'auth

Dans `app/controllers/AuthController.ts`, ajoute les méthodes `register` et `login` :

```typescript
import { HttpContext } from '@adonisjs/core/http'
import User from '../models/User.js'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const { name, email, password } = request.body()
    if (!name || !email || !password) {
      return response.status(400).json({ error: 'Champs obligatoires : name, email, password' })
    }
    // Créer l'utilisateur en mémoire ou en base
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = request.body()
    // Vérifier les identifiants
  }

  async logout({ response }: HttpContext) {
    return response.json({ success: true })
  }
}
```

### 2. Ajouter les routes

Dans `start/routes.ts`, ajoute :

```typescript
router.post('/api/auth/register', [AuthController, 'register'])
router.post('/api/auth/login', [AuthController, 'login'])
router.post('/api/auth/logout', [AuthController, 'logout'])
```

### 3. Le token simulé

Le token suit le format `token-{userId}`. Par exemple, le premier utilisateur aura `token-1`.

```typescript
return response.status(201).json({
  user: { id: user.id, name: user.name, email: user.email },
  token: `token-${user.id}`,
})
```

## Vérifie maintenant

```bash
# Inscription
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass1234"}'

# Connexion
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass1234"}'

# Déconnexion
curl -X POST http://localhost:3333/api/auth/logout
```

L'inscription doit renvoyer un objet `user` et un `token`.

## Si cela échoue

- **Erreur 400"** : vérifie que le bodyparser est bien enregistré dans `start/kernel.ts`.
- **Aucune réponse** : vérifie que le serveur tourne sur le bon port.

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `protask/guides/adonis/checkpoints/03-authentication/`

Fichiers modifiés : `start/routes.ts`, `app/controllers/AuthController.ts`

</details>
