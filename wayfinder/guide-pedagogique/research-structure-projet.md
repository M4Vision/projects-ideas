# Recherche : Structure d'un projet dans ce repo

## 1. Convention de dossiers projet (template)

Chaque projet suit cette arborescence :

```
{project-name}/
├── docs/
│   ├── PRD.md              ← Product Requirements Document
│   └── openapi.json         ← Contrat OpenAPI 3.0
├── api/
│   ├── server.js            ← Serveur Hono (toutes les routes in-memory)
│   ├── client.js            ← Wrapper fetch pour les templates
│   ├── e2e.spec.js          ← Tests Vitest (intégration API)
│   ├── tester.js            ← Micro test runner autonome (exécution in-browser)
│   └── start.js             ← Entrypoint pour démarrer le serveur
├── templates/
│   └── {theme-name}/
│       ├── index.html       ← Template HTML autonome
│       └── {theme-name}.spec.js  ← Tests e2e Playwright du template
└── docs/
    └── adr/                 ← Architecture Decision Records
```

Les deux projets existants (`protask/` et `shopflow/`) respectent ce pattern avec quelques différences documentées en section 6.

## 2. ProTask — structure détaillée (projet de référence)

### Fichiers racine

| Fichier | Rôle |
|---------|------|
| `protask/docs/PRD.md` | PRD au format Markdown, 278 lignes |
| `protask/docs/openapi.json` | OpenAPI 3.0, 1786 lignes, 19 routes |
| `protask/api/server.js` | Serveur Hono, 516 lignes, 19 routes + `_reset` + `logout` |
| `protask/api/client.js` | Wrapper fetch, 210 lignes, 28 méthodes |
| `protask/api/tester.js` | Micro test runner, 675 lignes, 7 catégories, ~50 tests |
| `protask/api/start.js` | Entrypoint serveur (port 3001) |
| `protask/api/e2e.spec.js` | Tests Vitest, 559 lignes, 7 describe blocks |

### Guides pédagogiques

```
protask/guides/
├── GUIDE-TEMPLATE.md
├── adonis/            ← Guide AdonisJS complet
├── laravel/           ← Guide Laravel (début)
```

### Templates (10 thèmes)

```
protask/templates/
├── neo-brutalist/     ← index.html + neo-brutalist.spec.js
├── cyberpunk/
├── glass/
├── gold-noir/
├── retro/
├── minimalist/
├── material-dark/
├── terminal/
├── forest/
├── corporate/
```

Chaque template a : un `index.html` (template autonome) et un fichier `{theme}.spec.js` (tests Playwright).

## 3. PRD — Format

Le PRD (`docs/PRD.md`) est structuré en sections numérotées :

1. **Présentation** — description du domaine métier en 1-2 phrases
2. **Pages** — tableau des pages/vues du projet
3. **Modèle de données** — diagramme Mermaid ERD
4. **Tables détaillées** — champs, types, contraintes, descriptions
5. **Fonctionnalités** — liste des features utilisateur
6. **Layout global** — description de l'UI structurelle
7. **Design System** — palette, typographie, composants (optionnel)
8. **Interactions clés** — comportements interactifs
9. **API Routes** — tableau complet des routes : Méthode, Route, Auth, Description, Corps requête, Réponse

Les routes dans le PRD sont la source de vérité la plus lisible pour un humain, mais l'OpenAPI spec est plus précise pour un parsing automatique.

## 4. OpenAPI spec — Comment parser les routes

Fichier : `{project}/docs/openapi.json` (format OpenAPI 3.0).

### Structure

```json
{
  "openapi": "3.0.3",
  "info": { "title": "...", "version": "1.0.0" },
  "servers": [
    { "url": "http://localhost:3000/api", "description": "..." }
  ],
  "paths": {
    "/auth/register": {
      "post": {
        "tags": ["Authentification"],
        "operationId": "registerUser",
        "requestBody": { ... },
        "responses": { "201": { ... }, "400": { ... } }
      }
    },
    "/users/me": {
      "get": { ... },
      "put": { ... }
    }
  },
  "components": {
    "securitySchemes": { "bearerAuth": { ... } },
    "schemas": {
      "User": { "type": "object", "properties": { ... } },
      "Board": { ... },
      ...
    }
  }
}
```

### Comment parser les routes

Pour chaque clé de `paths` (ex: `/boards/{id}`) et chaque méthode HTTP (get, post, put, patch, delete) :

- **path** : la clé du path (ex: `/boards/{id}`)
- **method** : la méthode HTTP (ex: `get`, `post`)
- **operationId** : identifiant unique (ex: `getBoardById`)
- **tags** : catégorie (ex: `["Boards"]`)
- **parameters** : paramètres de path/query (nom, type, required, description)
- **requestBody** : body schema (required fields, properties)
- **responses** : status codes, response schemas (via `$ref` vers `components/schemas`)

Les schemas de données sont dans `components/schemas` avec des `$ref` croisées.

### Routes ProTask (19 dans l'OpenAPI)

| Tag | Routes |
|-----|--------|
| Authentification | POST `/auth/register`, POST `/auth/login` |
| Utilisateurs | GET `/users/me`, PUT `/users/me`, GET `/users/{id}` |
| Boards | GET `/boards`, POST `/boards`, GET `/boards/{id}`, PUT `/boards/{id}`, DELETE `/boards/{id}` |
| Colonnes | POST `/boards/{id}/columns`, PUT `/columns/{id}`, DELETE `/columns/{id}`, PUT `/columns/reorder` |
| Cartes | GET `/columns/{id}/cards`, POST `/columns/{id}/cards`, GET `/cards/{id}`, PUT `/cards/{id}`, DELETE `/cards/{id}`, PUT `/cards/reorder`, PUT `/cards/{id}/move` |
| Labels | POST `/boards/{id}/labels`, PUT `/labels/{id}`, DELETE `/labels/{id}` |
| Commentaires | GET `/cards/{id}/comments`, POST `/cards/{id}/comments`, DELETE `/comments/{id}` |
| Invitations | POST `/boards/{id}/invitations`, GET `/boards/{id}/invitations`, PUT `/invitations/{id}` |

Note : Le serveur implémente **plus de routes** que l'OpenAPI n'en déclare :
- `POST /api/auth/logout` (dans server.js, pas dans l'OpenAPI)
- `POST /api/_reset` (route de test interne)
- `GET /api/boards/{id}/columns` (dans server.js, pas dans l'OpenAPI)
- `GET /api/cards/{id}/comments` (dans server.js, pas dans l'OpenAPI)
- `DELETE /api/boards/{id}/members/{userId}` (dans server.js, pas dans l'OpenAPI)
- `GET /api/boards/{id}/invitations` (dans server.js, pas dans l'OpenAPI)
- `DELETE /api/invitations/{id}` (dans server.js, pas dans l'OpenAPI)
- `GET /api/users/{id}` (dans server.js, pas dans l'OpenAPI)

## 5. API Server — Convention Hono

Fichier : `{project}/api/server.js`

### Pattern général

```js
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const mockData = {
  users: [ ... ],
  boards: [ ... ],
  // collections en mémoire
}

const initialData = JSON.parse(JSON.stringify(mockData))

function resetData() {
  Object.assign(mockData, JSON.parse(JSON.stringify(initialData)))
}

// Helpers : findBoard, findColumn, findCard, findUser, findLabel
// Resolveurs : resolveCard (résout les relations)

// Middleware CORS + Auth
app.use('/api/*', cors())
app.use('/api/*', async (c, next) => {
  // Skip public routes
  // Parse token → userId
  // Set c.set('userId', ...) / c.set('currentUser', ...)
})

// Routes
app.get('/api/boards', (c) => { ... })
app.post('/api/boards', async (c) => { ... })
// ...

// Route de réinitialisation (tests)
app.post('/api/_reset', (c) => { ... })

export default app
```

### Auth

- Header `Authorization: Bearer token-{userId}`
- Parse `token-` prefix → extrait l'ID utilisateur
- Routes protégées : tout `/*` sauf `/api/auth/*` et `/api/_reset`
- Pas de vraie sécurité, pas de JWT, pas de hash de mot de passe

### Modèle de données in-memory

Les collections sont stockées dans l'objet `mockData` :

| Collection | Type | Relations |
|------------|------|-----------|
| `users[]` | Array | — |
| `boards[]` | Array | ownerId → User |
| `columns[]` | Array | boardId → Board |
| `cards[]` | Array | columnId → Column, assigneeId → User, labels[] → Label[] |
| `labels[]` | Array | boardId → Board |
| `comments[]` | Array | authorId → User, cardId → Card |
| `invitations[]` | Array | boardId → Board, invitedById → User |
| `boardMembers{}` | Object | { boardId: [userId, ...] } |

Les IDs sont auto-incrémentés (`mockData.boards.length + 1`).

### Seed data

Les données de démo sont pré-chargées dans `mockData` :
- 3 users (Alexandre, Sophie, Marc)
- 3 boards
- 8 columns
- 10 cards
- 4 labels
- 5 comments
- 2 invitations
- boardMembers mapping

`resetData()` remet `mockData` à l'état initial (deep clone de `initialData`).

## 6. Client API — Wrapper fetch

Fichier : `{project}/api/client.js`

### Pattern

```js
const API_URL = (globalThis.API_URL || 'http://localhost:3001') + '/api'
let _token = null
let _currentUser = null

async function request(method, path, body) {
  const res = await fetch(API_URL + path, { method, headers, body })
  const data = res.status === 204 ? null : await res.json()
  if (!res.ok) throw new Error(data?.error || 'Erreur ' + res.status)
  return data
}

const demoApi = {
  async register(data) { ... set _token, _currentUser ... },
  async login(data) { ... },
  async getMe() { ... },
  async getBoards() { ... },
  // etc.
}

window.demoApi = demoApi
```

### Méthodes client.js → Routes serveur

| Méthode client.js | HTTP | Path serveur |
|-------------------|------|--------------|
| `register(data)` | POST | `/auth/register` |
| `login(data)` | POST | `/auth/login` |
| `logout()` | POST | `/auth/logout` |
| `getMe()` | GET | `/users/me` |
| `updateMe(data)` | PUT | `/users/me` |
| `getUser(id)` | GET | `/users/{id}` |
| `getBoards()` | GET | `/boards` |
| `createBoard(data)` | POST | `/boards` |
| `getBoard(id)` | GET | `/boards/{id}` |
| `updateBoard(id, data)` | PUT | `/boards/{id}` |
| `deleteBoard(id)` | DELETE | `/boards/{id}` |
| `getColumns(boardId)` | GET | `/boards/{boardId}/columns` |
| `createColumn(boardId, data)` | POST | `/boards/{boardId}/columns` |
| `updateColumn(id, data)` | PUT | `/columns/{id}` |
| `deleteColumn(id)` | DELETE | `/columns/{id}` |
| `reorderColumns(items)` | PUT | `/columns/reorder` |
| `getCards(columnId)` | GET | `/columns/{columnId}/cards` |
| `createCard(columnId, data)` | POST | `/columns/{columnId}/cards` |
| `getCard(id)` | GET | `/cards/{id}` |
| `updateCard(id, data)` | PATCH | `/cards/{id}` |
| `deleteCard(id)` | DELETE | `/cards/{id}` |
| `moveCard(id, columnId, order)` | POST | `/cards/{id}/move` |
| `reorderCards(items)` | POST | `/cards/reorder` |
| `getLabels(boardId)` | GET | `/boards/{boardId}/labels` |
| `createLabel(boardId, data)` | POST | `/boards/{boardId}/labels` |
| `updateLabel(id, data)` | PATCH | `/labels/{id}` |
| `deleteLabel(id)` | DELETE | `/labels/{id}` |
| `getComments(cardId)` | GET | `/cards/{cardId}/comments` |
| `addComment(cardId, data)` | POST | `/cards/{cardId}/comments` |
| `deleteComment(id)` | DELETE | `/comments/{id}` |
| `inviteMember(boardId, email)` | POST | `/boards/{boardId}/invitations` |
| `getInvitations(boardId)` | GET | `/boards/{boardId}/invitations` |
| `acceptInvitation(id)` | PATCH | `/invitations/{id}` |
| `respondToInvitation(id, status)` | PATCH | `/invitations/{id}` |
| `cancelInvitation(id)` | DELETE | `/invitations/{id}` |
| `removeMember(boardId, userId)` | DELETE | `/boards/{boardId}/members/{userId}` |

### API call tracking pour e2e

Le client.js patche automatiquement toutes ses méthodes pour tracer les appels dans `window.__apiCalls` (utilisé par les tests e2e Playwright pour vérifier la couverture API).

## 7. Tester.js — Micro test runner autonome

Fichier : `{project}/api/tester.js`

C'est un micro-framework de test qui peut s'exécuter dans le navigateur ou dans Node.js (via import). Il expose :

- `describe(name, fn)` — définit une catégorie de tests
- `beforeEach(fn)` — hook exécuté avant chaque test
- `it(name, fn)` — définit un test individuel
- `expect(actual)` — assertions : `toBe`, `toEqual`, `toContain`, `toBeDefined`, `toBeTruthy`, `toBeUndefined`, `toBeGreaterThan`, `toBeLessThan`
- `runTests(baseUrl, allowedCategories)` — exécute tous les tests, retourne `{ categories, summary }`
- `abortTests()` — arrête l'exécution

### Structure des catégories de tests

ProTask définit 7 catégories via `describe()` :

| Catégorie | Tests | Description |
|-----------|-------|-------------|
| Authentification | 8 | register, login, logout, reset, duplicate, wrong password |
| Boards | 6 | list, create, get with columns, update, 404, 401 |
| Colonnes | 6 | list, create, update, delete, reorder, 404 |
| Cartes | 10 | list, create, require title, get detail, 404, update, labels, delete, move, reorder |
| Labels | 6 | list, create, require name, update, 404, delete |
| Commentaires | 5 | list, create, require text, delete, 404 |
| Invitations | 10 | list, invite, invalid email, self-invite, unknown user, already invited, accept, decline, wrong user, cancel, remove member |

Chaque test utilise les helpers `get/post/put/patch/del` qui appellent directement le serveur avec `fetch()`.

Le `beforeEach` de chaque catégorie appelle `POST /_reset` et se connecte comme utilisateur de démo.

### Export pour Vitest

Le fichier `e2e.spec.js` fait le pont entre tester.js et Vitest : il utilise les mêmes `describe`/`it`/`expect` de Vitest mais réimplémente les helpers HTTP localement (au lieu d'importer tester.js). Les tests sont structurellement identiques.

## 8. Données / Modèles (ProTask)

Les entités et leurs champs (d'après mockData dans server.js) :

### User
```js
{ id: 1, name: 'Alexandre', email: 'alex@protask.dev', avatar: '', password: 'pass123', createdAt: '2025-01-15T08:00:00Z' }
```
Champs : id, name, email, avatar, password, createdAt

### Board
```js
{ id: 1, title: 'Design System', ownerId: 1, description: '...', color: '#8B5CF6', categories: ['Design', 'UI/UX'], createdAt: '2025-03-01T09:00:00Z' }
```
Champs : id, title, ownerId, description, color, categories, createdAt
Réponse enrichie : + members[], columns[], cardCount

### Column
```js
{ id: 1, title: 'Backlog', order: 0, boardId: 1, color: '#6B7280', description: '...' }
```
Champs : id, title, order, boardId, color, description

### Card
```js
{ id: 1, title: 'Définir la palette', description: '...', order: 0, columnId: 1, dueDate: '2025-04-15', assigneeId: 1, labels: [1] }
```
Champs internes : id, title, description, order, columnId, dueDate, assigneeId, labels[]
Réponse résolue : + assignee (User résolu), labels (Label[] résolus), comments (Comment[] résolus avec author)

### Label
```js
{ id: 1, name: 'Design', color: '#8B5CF6', boardId: 1, description: '...' }
```
Champs : id, name, color, boardId, description

### Comment
```js
{ id: 1, text: 'J\'ai commencé la palette...', authorId: 1, cardId: 1, createdAt: '2025-04-01T10:00:00Z' }
```
Champs : id, text, authorId, cardId, createdAt
Réponse : + author (User résolu sans password)

### Invitation
```js
{ id: 1, boardId: 1, email: 'marc@protask.dev', invitedById: 1, status: 'accepted', createdAt: '2025-03-15T08:00:00Z' }
```
Champs : id, boardId, email, invitedById, status (pending|accepted|declined), createdAt

### boardMembers (relation many-to-many)
```js
{ 1: [2, 3], 2: [], 3: [1] }
// boardId → [memberUserId, ...]
```

## 9. Différences entre ProTask et ShopFlow

### Ce qui est identique

- Structure `docs/` avec `PRD.md` et `openapi.json`
- Format PRD : mêmes sections (Présentation, Pages, Modèle de données, API Routes)
- Format OpenAPI 3.0 : mêmes conventions (`paths`, `components/schemas`, `securitySchemes`)
- Auth par token (Bearer token-{userId})
- Données en mémoire (mockData dans server.js ou demo-api.js)
- Méthode `_reset` pour réinitialiser les données de test
- Template pattern : `templates/{theme}/index.html`

### Ce qui diffère

| Aspect | ProTask | ShopFlow |
|--------|---------|----------|
| **API server** | `api/server.js` (Hono) | `demo-api.js` (fichier unique, pas de Hono) |
| **Client API** | `api/client.js` (fetch wrapper) | Intégré dans `demo-api.js` |
| **Tests API** | `api/e2e.spec.js` (Vitest) | Intégré dans `demo-api.js` via `testApi()` |
| **Tester.js** | `api/tester.js` (micro test runner) | Pas de fichier séparé |
| **Routes OpenAPI** | 19 routes | ~30 routes |
| **Start server** | `api/start.js` | Pas de serveur HTTP (client-side direct) |
| **Top-level** | `demo-api.js` supprimé (migré vers Hono) | A encore un `demo-api.js` legacy |
| **Guides** | Dossier `guides/` avec Adonis + Laravel | Pas de guides |
| **api/ dossier** | Existe avec serveur Hono | Pas de dossier `api/` |

### Constat important

ShopFlow n'a **pas encore migré** vers l'architecture Hono. Son fichier `demo-api.js` est un fichier unique qui combine :
- mockData (comme server.js)
- demoApi (comme client.js)
- testApi (comme e2e.spec.js)

ProTask est le projet de référence le plus avancé architecturalement.

### Comment un skill peut découvrir la structure

1. **Lire `protask/docs/openapi.json`** → routes, modèles, tags
2. **Lire `protask/api/server.js`** → routes réelles, implémentation, mockData structures
3. **Lire `protask/api/client.js`** → méthodes disponibles pour les templates
4. **Lire `protask/api/tester.js`** → catégories de tests, fixtures
5. **Lire `protask/docs/PRD.md`** → description métier, pages, features
6. **Pour ShopFlow** : lire `shopflow/demo-api.js` (fichier unique) et `shopflow/docs/openapi.json`

### Comment découvrir les routes programmatiquement

**À partir de l'OpenAPI spec :**
```js
const spec = JSON.parse(fs.readFileSync('protask/docs/openapi.json'))
const routes = []
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, def] of Object.entries(methods)) {
    routes.push({
      method: method.toUpperCase(),
      path,
      tags: def.tags || [],
      operationId: def.operationId,
      auth: !!def.security,
      params: def.parameters || [],
      requestBody: def.requestBody || null,
      responses: Object.keys(def.responses || {}).map(Number)
    })
  }
}
```

**À partir du server.js (parsing regex) :**
```
app\.(get|post|put|patch|delete)\('([^']+)'
```

**À partir de client.js :**
Les noms de méthodes sont les clés de l'objet `demoApi`. Chaque méthode appelle `request(METHOD, PATH, ...)`.
