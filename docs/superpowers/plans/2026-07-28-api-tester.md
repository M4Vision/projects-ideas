# API Tester Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Testeur" view in the ProTask viewer where users enter an API URL, click run, and see pass/fail results for all 51 API tests.

**Architecture:** New `protask/api/tester.js` module exports `runTests(baseUrl)` (Promise), which runs tests sequentially and returns structured results. `viewer.js` imports it and renders the interactive UI (URL input + results tree). `index.html` adds a "Testeur" button.

**Tech Stack:** Vanilla JS, fetch API, no framework

## Global Constraints

- Single HTML file per view (no separate CSS/JS files for the tester UI — inline everything in viewer.js and index.html)
- All 51 tests from `protask/api/e2e.spec.js` must be ported verbatim (same assertions, same error messages)
- Tests run sequentially against the user-provided base URL
- `tester.js` must be browser-compatible (no Node.js imports like `vitest` or `@hono/node-server`)
- Existing `e2e.spec.js` Vitest file must remain untouched
- Dark theme consistent with viewer
- French labels throughout the UI

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `protask/api/tester.js` | **Create** | Browser test runner + 51 test definitions in 7 categories. Exports `runTests(baseUrl)` and `abortTests()`. |
| `index.html` | **Modify** | Add "Testeur" view button. |
| `viewer.js` | **Modify** | Import `runTests`, add `switchView('tester')` handler, render tester UI and results. |

### Task 1: Create tester module

**Files:**
- Create: `protask/api/tester.js`

**Interfaces:**
- Consumes: nothing from other tasks (standalone)
- Produces: `runTests(baseUrl: string): Promise<TestResults>`, `abortTests(): void`

```js
// TestResults shape:
{
  categories: [
    {
      name: string,
      tests: [
        {
          name: string,
          status: 'pass' | 'fail' | 'error',
          duration: number,  // ms
          error: null | {
            message: string,
            expected: string,
            actual: string
          }
        }
      ]
    }
  ],
  summary: {
    total: number,
    passed: number,
    failed: number,
    errors: number,
    duration: number  // ms
  }
}
```

#### Sub-step 1.1: Mini test runner

- [ ] **Step 1.1 — Write the AssertionError class and describe/it/beforeEach**

```js
class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message)
    this.name = 'AssertionError'
    this.expected = expected
    this.actual = actual
  }
}

let _currentCategory = null
let _categories = []
let _abort = false

function describe(name, fn) {
  _currentCategory = { name, tests: [], beforeEach: null }
  _categories.push(_currentCategory)
  fn()
}

function beforeEach(fn) {
  _currentCategory.beforeEach = fn
}

function it(name, fn) {
  _currentCategory.tests.push({ name, fn })
}
```

- [ ] **Step 1.2 — Write expect() with all required matchers**

```js
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new AssertionError(
          `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`,
          JSON.stringify(expected),
          JSON.stringify(actual)
        )
      }
    },
    toContain(expected) {
      if (!String(actual).includes(expected)) {
        throw new AssertionError(
          `Expected "${actual}" to contain "${expected}"`,
          expected,
          actual
        )
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new AssertionError(
          `Expected value to be defined but got ${String(actual)}`,
          'defined',
          String(actual)
        )
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new AssertionError(
          `Expected undefined but got ${JSON.stringify(actual)}`,
          'undefined',
          JSON.stringify(actual)
        )
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(actual)
      const e = JSON.stringify(expected)
      if (a !== e) {
        throw new AssertionError(
          `Expected ${e} but got ${a}`,
          e,
          a
        )
      }
    },
    toBeGreaterThanOrEqual(n) {
      if (actual < n) {
        throw new AssertionError(`Expected ${actual} >= ${n}`, `>= ${n}`, String(actual))
      }
    },
    toBeLessThan(n) {
      if (actual >= n) {
        throw new AssertionError(`Expected ${actual} < ${n}`, `< ${n}`, String(actual))
      }
    },
  }
}
```

#### Sub-step 1.2: Fetch helpers

- [ ] **Step 1.2 — Write browser-compatible fetch helpers (same interface as e2e.spec.js)**

```js
let _baseUrl = ''

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { method: 'POST', headers, body: JSON.stringify(body) })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function get(path, token) {
  const headers = {}
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { headers })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function put(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { method: 'PUT', headers, body: JSON.stringify(body) })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function patch(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { method: 'PATCH', headers, body: JSON.stringify(body) })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function del(path, token) {
  const headers = {}
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { method: 'DELETE', headers })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}
```

#### Sub-step 1.3: Auth tests

- [ ] **Step 1.3 — Write Authentification test category (7 tests)**

```js
function defineTests() {
  describe('Authentification', () => {

    it('inscrit un nouvel utilisateur', async () => {
      const { status, data } = await post('/auth/register', { name: 'Test', email: 'test@test.com', password: 'test1234' })
      expect(status).toBe(201)
      expect(data.user).toBeDefined()
      expect(data.user.name).toBe('Test')
      expect(data.user.email).toBe('test@test.com')
      expect(data.user.password).toBeUndefined()
      expect(data.token).toBe('token-' + data.user.id)
    })

    it('rejette un doublon email', async () => {
      await post('/auth/register', { name: 'A', email: 'dup@test.com', password: 'pass1234' })
      const { status, data } = await post('/auth/register', { name: 'B', email: 'dup@test.com', password: 'pass5678' })
      expect(status).toBe(400)
      expect(data.error).toContain('déjà utilisé')
    })

    it('connecte un utilisateur existant', async () => {
      await post('/auth/register', { name: 'Test', email: 'login@test.com', password: 'pass1234' })
      const { status, data } = await post('/auth/login', { email: 'login@test.com', password: 'pass1234' })
      expect(status).toBe(200)
      expect(data.user.email).toBe('login@test.com')
      expect(data.token).toBeTruthy()
    })

    it('rejette un mauvais mot de passe', async () => {
      await post('/auth/register', { name: 'Test', email: 'badpw@test.com', password: 'pass1234' })
      const { status, data } = await post('/auth/login', { email: 'badpw@test.com', password: 'wrong' })
      expect(status).toBe(401)
      expect(data.error).toContain('incorrect')
    })

    it('rejette un email inconnu', async () => {
      const { status, data } = await post('/auth/login', { email: 'nobody@test.com', password: 'pass1234' })
      expect(status).toBe(401)
      expect(data.error).toContain('incorrect')
    })

    it('retourne success sur logout', async () => {
      const { status, data } = await post('/auth/logout')
      expect(status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('réinitialise les données via _reset', async () => {
      await post('/auth/register', { name: 'Temp', email: 'temp@test.com', password: 'pass1234' })
      await post('/_reset')
      const { data } = await post('/auth/login', { email: 'temp@test.com', password: 'pass1234' })
      expect(data.error).toBeDefined()
    })
  })
```

#### Sub-step 1.4: Boards tests

- [ ] **Step 1.4 — Write Boards test category (6 tests)**

```js
  describe('Boards', () => {
    let token

    beforeEach(async () => {
      const { data } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
      token = data.token
    })

    it('liste les boards de l\'utilisateur connecté', async () => {
      const { status, data } = await get('/boards', token)
      expect(status).toBe(200)
      expect(data.length).toBeGreaterThanOrEqual(2)
      expect(data[0].cardCount).toBeDefined()
      expect(data[0].members).toBeDefined()
    })

    it('crée un board avec titre, couleur, catégories, description', async () => {
      const { status, data } = await post('/boards', { title: 'Test', color: '#FF5722', categories: ['Dev', 'Design'], description: 'Un board de test' }, token)
      expect(status).toBe(201)
      expect(data.title).toBe('Test')
      expect(data.color).toBe('#FF5722')
      expect(data.categories).toEqual(['Dev', 'Design'])
      expect(data.description).toBe('Un board de test')
    })

    it('récupère un board avec ses colonnes et membres', async () => {
      const { data: board } = await post('/boards', { title: 'Complet' }, token)
      const { status, data } = await get('/boards/' + board.id, token)
      expect(status).toBe(200)
      expect(data.columns.length).toBe(3)
      expect(data.members).toBeDefined()
    })

    it('met à jour un board', async () => {
      const { data: board } = await post('/boards', { title: 'Avant' }, token)
      const { status, data } = await put('/boards/' + board.id, { title: 'Après', description: 'Modifié', color: '#4CAF50', categories: ['Backend'] }, token)
      expect(status).toBe(200)
      expect(data.title).toBe('Après')
      expect(data.description).toBe('Modifié')
      expect(data.color).toBe('#4CAF50')
      expect(data.categories).toEqual(['Backend'])
    })

    it('retourne 404 sur board inconnu', async () => {
      const { status, data } = await get('/boards/999', token)
      expect(status).toBe(404)
      expect(data.error).toContain('introuvable')
    })

    it('retourne 401 sans token', async () => {
      const { status } = await get('/boards')
      expect(status).toBe(401)
    })
  })
```

#### Sub-step 1.5: Columns tests

- [ ] **Step 1.5 — Write Colonnes test category (6 tests)**

```js
  describe('Colonnes', () => {
    let token, boardId

    beforeEach(async () => {
      await post('/_reset')
      const { data: loginData } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
      token = loginData.token
      const { data } = await post('/boards', { title: 'Col Test' }, token)
      boardId = data.id
    })

    it('liste les colonnes d\'un board', async () => {
      const { status, data } = await get('/boards/' + boardId + '/columns', token)
      expect(status).toBe(200)
      expect(data.length).toBe(3)
      expect(data[0].order).toBeLessThan(data[1].order)
    })

    it('crée une colonne', async () => {
      const { status, data } = await post('/boards/' + boardId + '/columns', { title: 'Nouvelle', color: '#FF9800', description: 'Ma col' }, token)
      expect(status).toBe(201)
      expect(data.title).toBe('Nouvelle')
      expect(data.color).toBe('#FF9800')
      expect(data.description).toBe('Ma col')
      expect(data.boardId).toBe(boardId)
    })

    it('met à jour une colonne', async () => {
      const { data: cols } = await get('/boards/' + boardId + '/columns', token)
      const { status, data } = await put('/columns/' + cols[0].id, { title: 'Modifiée', color: '#E91E63', description: 'Desc' }, token)
      expect(status).toBe(200)
      expect(data.title).toBe('Modifiée')
      expect(data.color).toBe('#E91E63')
      expect(data.description).toBe('Desc')
    })

    it('supprime une colonne', async () => {
      const { data: cols } = await get('/boards/' + boardId + '/columns', token)
      const { status } = await del('/columns/' + cols[0].id, token)
      expect(status).toBe(204)
      const { data: remaining } = await get('/boards/' + boardId + '/columns', token)
      expect(remaining.length).toBe(2)
    })

    it('réordonne les colonnes', async () => {
      const { data: cols } = await get('/boards/' + boardId + '/columns', token)
      const { status, data } = await put('/columns/reorder', [{ id: cols[0].id, order: 2 }, { id: cols[2].id, order: 0 }], token)
      expect(status).toBe(200)
      expect(data.find(c => c.id === cols[0].id).order).toBe(2)
      expect(data.find(c => c.id === cols[2].id).order).toBe(0)
    })

    it('retourne 404 sur colonne inconnue', async () => {
      const { status } = await put('/columns/999', { title: 'Nope' }, token)
      expect(status).toBe(404)
    })
  })
```

#### Sub-step 1.6: Cards tests

- [ ] **Step 1.6 — Write Cartes test category (10 tests)**

```js
  describe('Cartes', () => {
    let token, colId

    beforeEach(async () => {
      await post('/_reset')
      const { data: loginData } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
      token = loginData.token
      const { data: board } = await post('/boards', { title: 'Carte Test' }, token)
      const { data: cols } = await get('/boards/' + board.id + '/columns', token)
      colId = cols[0].id
    })

    it('liste les cartes d\'une colonne', async () => {
      const { status, data } = await get('/columns/' + colId + '/cards', token)
      expect(status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      data.forEach(c => {
        expect(c.assignee).toBeDefined()
        expect(c.labels).toBeDefined()
      })
    })

    it('crée une carte', async () => {
      const { status, data } = await post('/columns/' + colId + '/cards', { title: 'Nouvelle carte', description: 'Desc', dueDate: '2025-05-01', assigneeId: 1, labels: [] }, token)
      expect(status).toBe(201)
      expect(data.title).toBe('Nouvelle carte')
      expect(data.description).toBe('Desc')
      expect(data.dueDate).toBe('2025-05-01')
      expect(data.columnId).toBe(colId)
      expect(data.order).toBeGreaterThanOrEqual(0)
    })

    it('exige un titre pour créer une carte', async () => {
      const { status, data } = await post('/columns/' + colId + '/cards', {}, token)
      expect(status).toBe(400)
      expect(data.error).toContain('titre')
    })

    it('récupère une carte avec assignee, labels et commentaires', async () => {
      const { data: created } = await post('/columns/' + colId + '/cards', { title: 'Détail' }, token)
      const { status, data } = await get('/cards/' + created.id, token)
      expect(status).toBe(200)
      expect(data.title).toBe('Détail')
      expect(data.assignee).toBeDefined()
      expect(data.labels).toBeDefined()
      expect(data.comments).toBeDefined()
    })

    it('retourne 404 sur carte inconnue', async () => {
      const { status } = await get('/cards/999', token)
      expect(status).toBe(404)
    })

    it('met à jour titre, description, dueDate, assignee et labels', async () => {
      const { data: card } = await post('/columns/' + colId + '/cards', { title: 'Avant' }, token)
      const { status, data } = await patch('/cards/' + card.id, { title: 'Après', description: 'Modifié', dueDate: '2025-06-01', assigneeId: 2, labels: [] }, token)
      expect(status).toBe(200)
      expect(data.title).toBe('Après')
      expect(data.description).toBe('Modifié')
      expect(data.dueDate).toBe('2025-06-01')
      expect(data.assignee).toBeDefined()
    })

    it('assigne des labels à une carte par ID', async () => {
      const { data: card } = await post('/columns/' + colId + '/cards', { title: 'Labels Test' }, token)
      const { data: boards } = await get('/boards', token)
      const boardId = boards[0].id
      await post('/boards/' + boardId + '/labels', { name: 'Test', color: '#FF0' }, token)
      const { data: labels } = await get('/boards/' + boardId + '/labels', token)
      expect(labels.length).toBeGreaterThan(0)
      const labelId = labels[0].id
      const { status, data } = await patch('/cards/' + card.id, { labels: [labelId] }, token)
      expect(status).toBe(200)
      expect(data.labels).toBeDefined()
      expect(data.labels.length).toBe(1)
      expect(data.labels[0].id).toBe(labelId)
    })

    it('supprime une carte et ses commentaires', async () => {
      const { data: card } = await post('/columns/' + colId + '/cards', { title: 'À supprimer' }, token)
      const { status } = await del('/cards/' + card.id, token)
      expect(status).toBe(204)
      const { data: cards } = await get('/columns/' + colId + '/cards', token)
      expect(cards.find(c => c.id === card.id)).toBeUndefined()
    })

    it('déplace une carte vers une autre colonne', async () => {
      const { data: cols } = await get('/boards/1/columns', token)
      const otherColId = cols.find(c => c.id !== colId).id
      const { data: card } = await post('/columns/' + colId + '/cards', { title: 'Mobile' }, token)
      const { status, data } = await post('/cards/' + card.id + '/move', { columnId: otherColId }, token)
      expect(status).toBe(200)
      expect(data.columnId).toBe(otherColId)
    })

    it('réordonne les cartes', async () => {
      const c1 = (await post('/columns/' + colId + '/cards', { title: 'C1' }, token)).data
      const c2 = (await post('/columns/' + colId + '/cards', { title: 'C2' }, token)).data
      const { status, data } = await post('/cards/reorder', [{ id: c1.id, order: 1 }, { id: c2.id, order: 0 }], token)
      expect(status).toBe(200)
      expect(data.find(c => c.id === c1.id).order).toBe(1)
      expect(data.find(c => c.id === c2.id).order).toBe(0)
    })
  })
```

#### Sub-step 1.7: Labels tests

- [ ] **Step 1.7 — Write Labels test category (6 tests)**

```js
  describe('Labels', () => {
    let token, boardId

    beforeEach(async () => {
      await post('/_reset')
      const { data: loginData } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
      token = loginData.token
      const { data: board } = await post('/boards', { title: 'Label Test' }, token)
      boardId = board.id
    })

    it('liste les labels d\'un board', async () => {
      const { status, data } = await get('/boards/' + boardId + '/labels', token)
      expect(status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('crée un label', async () => {
      const { status, data } = await post('/boards/' + boardId + '/labels', { name: 'Bug', color: '#FF0000', description: 'Anomalies' }, token)
      expect(status).toBe(201)
      expect(data.name).toBe('Bug')
      expect(data.color).toBe('#FF0000')
      expect(data.description).toBe('Anomalies')
      expect(data.boardId).toBe(boardId)
    })

    it('exige un nom pour créer un label', async () => {
      const { status, data } = await post('/boards/' + boardId + '/labels', {}, token)
      expect(status).toBe(400)
      expect(data.error).toContain('nom')
    })

    it('met à jour un label', async () => {
      const { data: label } = await post('/boards/' + boardId + '/labels', { name: 'Avant' }, token)
      const { status, data } = await patch('/labels/' + label.id, { name: 'Après', color: '#00FF00', description: 'Modifié' }, token)
      expect(status).toBe(200)
      expect(data.name).toBe('Après')
      expect(data.color).toBe('#00FF00')
      expect(data.description).toBe('Modifié')
    })

    it('retourne 404 sur label inconnu', async () => {
      const { status } = await patch('/labels/999', { name: 'Nope' }, token)
      expect(status).toBe(404)
    })

    it('supprime un label', async () => {
      const { data: label } = await post('/boards/' + boardId + '/labels', { name: 'À supprimer' }, token)
      const { status } = await del('/labels/' + label.id, token)
      expect(status).toBe(204)
      const { data: labels } = await get('/boards/' + boardId + '/labels', token)
      expect(labels.find(l => l.id === label.id)).toBeUndefined()
    })
  })
```

#### Sub-step 1.8: Comments tests

- [ ] **Step 1.8 — Write Commentaires test category (5 tests)**

```js
  describe('Commentaires', () => {
    let token, cardId

    beforeEach(async () => {
      await post('/_reset')
      const { data: loginData } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
      token = loginData.token
      const { data: board } = await post('/boards', { title: 'Comment Test' }, token)
      const { data: cols } = await get('/boards/' + board.id + '/columns', token)
      const { data: card } = await post('/columns/' + cols[0].id + '/cards', { title: 'Test Card' }, token)
      cardId = card.id
    })

    it('liste les commentaires d\'une carte', async () => {
      const { status, data } = await get('/cards/' + cardId + '/comments', token)
      expect(status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('ajoute un commentaire', async () => {
      const { status, data } = await post('/cards/' + cardId + '/comments', { text: 'Mon commentaire' }, token)
      expect(status).toBe(201)
      expect(data.text).toBe('Mon commentaire')
      expect(data.author).toBeDefined()
    })

    it('exige un texte pour ajouter un commentaire', async () => {
      const { status, data } = await post('/cards/' + cardId + '/comments', {}, token)
      expect(status).toBe(400)
      expect(data.error).toContain('texte')
    })

    it('supprime un commentaire', async () => {
      const { data: comment } = await post('/cards/' + cardId + '/comments', { text: 'À supprimer' }, token)
      const { status } = await del('/comments/' + comment.id, token)
      expect(status).toBe(204)
      const { data: comments } = await get('/cards/' + cardId + '/comments', token)
      expect(comments.find(c => c.id === comment.id)).toBeUndefined()
    })

    it('retourne 404 sur commentaire inconnu', async () => {
      const { status } = await del('/comments/999', token)
      expect(status).toBe(404)
    })
  })
```

#### Sub-step 1.9: Invitations tests

- [ ] **Step 1.9 — Write Invitations test category (11 tests)**

```js
  describe('Invitations', () => {
    let token, alexToken, boardId

    beforeEach(async () => {
      await post('/_reset')
      const { data: alex } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
      alexToken = alex.token
      const { data: board } = await post('/boards', { title: 'Invite Test' }, alexToken)
      boardId = board.id
    })

    it('liste les invitations d\'un board', async () => {
      const { status, data } = await get('/boards/' + boardId + '/invitations', alexToken)
      expect(status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('invite un membre existant', async () => {
      const { status, data } = await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      expect(status).toBe(201)
      expect(data.email).toBe('sophie@protask.dev')
      expect(data.status).toBe('pending')
    })

    it('rejette email invalide', async () => {
      const { status, data } = await post('/boards/' + boardId + '/invitations', { email: 'pasmail' }, alexToken)
      expect(status).toBe(400)
      expect(data.error).toContain('Email invalide')
    })

    it('rejette auto-invitation', async () => {
      const { status, data } = await post('/boards/' + boardId + '/invitations', { email: 'alex@protask.dev' }, alexToken)
      expect(status).toBe(400)
      expect(data.error).toContain('pas vous inviter')
    })

    it('rejette utilisateur inexistant', async () => {
      const { status, data } = await post('/boards/' + boardId + '/invitations', { email: 'nobody@test.com' }, alexToken)
      expect(status).toBe(404)
      expect(data.error).toContain('trouvé')
    })

    it('rejette un membre déjà invité', async () => {
      await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      const { status, data } = await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      expect(status).toBe(400)
      expect(data.error).toContain('en attente')
    })

    it('accepte une invitation', async () => {
      await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      const { data: invs } = await get('/boards/' + boardId + '/invitations', alexToken)
      const { data: sophie } = await post('/auth/login', { email: 'sophie@protask.dev', password: 'pass123' })
      const { status, data } = await patch('/invitations/' + invs[0].id, { status: 'accepted' }, sophie.token)
      expect(status).toBe(200)
      expect(data.status).toBe('accepted')
    })

    it('refuse une invitation', async () => {
      await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      const { data: invs } = await get('/boards/' + boardId + '/invitations', alexToken)
      const { data: sophie } = await post('/auth/login', { email: 'sophie@protask.dev', password: 'pass123' })
      const { status, data } = await patch('/invitations/' + invs[0].id, { status: 'declined' }, sophie.token)
      expect(status).toBe(200)
      expect(data.status).toBe('declined')
    })

    it('wrong user ne peut pas répondre', async () => {
      await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      const { data: invs } = await get('/boards/' + boardId + '/invitations', alexToken)
      const { data: marc } = await post('/auth/login', { email: 'marc@protask.dev', password: 'pass123' })
      const { status, data } = await patch('/invitations/' + invs[0].id, { status: 'accepted' }, marc.token)
      expect(status).toBe(403)
      expect(data.error).toContain('pas répondre')
    })

    it('annule une invitation', async () => {
      await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      const { data: invs } = await get('/boards/' + boardId + '/invitations', alexToken)
      const { status } = await del('/invitations/' + invs[0].id, alexToken)
      expect(status).toBe(204)
    })

    it('retire un membre', async () => {
      await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      const { data: invs } = await get('/boards/' + boardId + '/invitations', alexToken)
      const { data: sophie } = await post('/auth/login', { email: 'sophie@protask.dev', password: 'pass123' })
      await patch('/invitations/' + invs[0].id, { status: 'accepted' }, sophie.token)
      const { status } = await del('/boards/' + boardId + '/members/' + sophie.user.id, alexToken)
      expect(status).toBe(204)
    })
  })
}
```

#### Sub-step 1.10: Entry point

- [ ] **Step 1.10 — Write runTests() and abortTests() exports**

```js
export async function runTests(baseUrl) {
  _categories = []
  _abort = false
  _baseUrl = baseUrl.replace(/\/$/, '')

  defineTests()

  const startTime = performance.now()

  for (const category of _categories) {
    for (const test of category.tests) {
      if (_abort) break
      const t0 = performance.now()
      try {
        if (category.beforeEach) await category.beforeEach()
        await test.fn()
        test.status = 'pass'
      } catch (e) {
        test.status = e.name === 'AssertionError' ? 'fail' : 'error'
        test.error = { message: e.message, expected: e.expected || '', actual: e.actual || '' }
      }
      test.duration = Math.round(performance.now() - t0)
      delete test.fn
    }
    if (_abort) break
  }

  const all = _categories.flatMap(c => c.tests)
  return {
    categories: _categories,
    summary: {
      total: all.length,
      passed: all.filter(t => t.status === 'pass').length,
      failed: all.filter(t => t.status === 'fail').length,
      errors: all.filter(t => t.status === 'error').length,
      duration: Math.round(performance.now() - startTime),
    }
  }
}

export function abortTests() {
  _abort = true
}
```

#### Sub-step 1.11: Verify tester.js

- [ ] **Step 1.11 — Verify tester.js syntax and basic execution**

```bash
# Syntax check
node --check protask/api/tester.js

# Start API server, run a quick smoke test
node -e "
import { runTests } from './protask/api/tester.js'
const { serve } = await import('@hono/node-server')
const { default: app } = await import('./protask/api/server.js')
const server = serve({ fetch: app.fetch, port: 3099 })
const result = await runTests('http://localhost:3099/api')
console.log('Total:', result.summary.total)
console.log('Passed:', result.summary.passed)
console.log('Failed:', result.summary.failed)
console.log('Duration:', result.summary.duration + 'ms')
server.close()
"
```

Expected output:
```
Total: 51
Passed: 51
Failed: 0
Duration: <some ms>
```

- [ ] **Step 1.12 — Commit tester.js**

```bash
git add protask/api/tester.js
git commit -m "feat: add browser-compatible API test runner with 51 tests"
```

---

### Task 2: Add tester view to the viewer

**Files:**
- Modify: `index.html` (add button)
- Modify: `viewer.js` (add import + view handler)

**Interfaces:**
- Consumes: `runTests(baseUrl)` from `protask/api/tester.js`
- Produces: tester view in the viewer with URL input, Run button, results display

#### Sub-step 2.1: Add import to viewer.js

- [ ] **Step 2.1 — Add import in viewer.js (after the other imports at top)**

```js
import { runTests } from './protask/api/tester.js'
```

#### Sub-step 2.2: Add button to index.html

- [ ] **Step 2.2 — Add "Testeur" button in index.html after the Guide button**

Find this in `index.html`:
```html
<button class="view-btn" data-view="guide" onclick="window.switchView('guide')">Guide</button>
```

Add after it:
```html
<button class="view-btn" data-view="tester" onclick="window.switchView('tester')">Testeur</button>
```

#### Sub-step 2.3: Add tester view handler

- [ ] **Step 2.3 — Add `view === 'tester'` handler in viewer.js switchView()**

In `viewer.js`, find the `switchView` function. Before the `try/catch` block (around line 210-213 in current file), add a handler for `view === 'tester'` that renders the UI and returns early:

```js
if (view === 'tester') {
  content.style.display = 'block'
  document.getElementById('apiContainer').style.display = 'none'
  const defaultUrl = window.location.origin + '/api'
  content.innerHTML = `
    <div class="tester-container">
      <div class="tester-bar">
        <label>API Base URL</label>
        <input type="text" id="testerUrl" value="${defaultUrl}" class="tester-input" />
        <button class="view-btn" id="testerRunBtn" onclick="window._runTests()">Lancer les tests</button>
        <button class="view-btn" id="testerAbortBtn" style="display:none" onclick="window._abortTests()">Arrêter</button>
      </div>
      <div id="testerProgress" style="display:none;padding:12px 0">
        <div class="tester-progress-bar"><div class="tester-progress-fill" id="testerProgressFill"></div></div>
        <div style="margin-top:6px;font-size:13px;color:var(--text-secondary)" id="testerProgressText">Exécution…</div>
      </div>
      <div id="testerResults"></div>
    </div>
  `
  return
}
```

Then add the global functions after `switchView`:

```js
window._runTests = async function () {
  const url = document.getElementById('testerUrl').value.trim()
  if (!url.startsWith('http')) {
    document.getElementById('testerResults').innerHTML = '<div style="color:#e06c75;padding:12px">URL invalide. L\'URL doit commencer par http:// ou https://</div>'
    return
  }
  const runBtn = document.getElementById('testerRunBtn')
  const abortBtn = document.getElementById('testerAbortBtn')
  const progress = document.getElementById('testerProgress')
  const fill = document.getElementById('testerProgressFill')
  const progressText = document.getElementById('testerProgressText')
  const results = document.getElementById('testerResults')

  runBtn.style.display = 'none'
  abortBtn.style.display = 'inline-block'
  progress.style.display = 'block'
  results.innerHTML = ''

  const t0 = performance.now()
  const result = await runTests(url)
  const elapsed = Math.round(performance.now() - t0)

  runBtn.style.display = 'inline-block'
  abortBtn.style.display = 'none'
  progress.style.display = 'none'

  let html = ''
  for (const cat of result.categories) {
    const passed = cat.tests.filter(t => t.status === 'pass').length
    const total = cat.tests.length
    const allPassed = passed === total
    html += `<details class="tester-category" ${allPassed ? '' : 'open'}>`
    html += `<summary class="tester-category-header ${allPassed ? 'pass' : 'fail'}">`
    html += `<span class="tester-status-icon">${allPassed ? '✅' : '❌'}</span>`
    html += `<span class="tester-category-name">${cat.name}</span>`
    html += `<span class="tester-category-count">${passed}/${total}</span>`
    html += `</summary>`
    html += `<div class="tester-test-list">`
    for (const test of cat.tests) {
      html += `<div class="tester-test ${test.status}">`
      html += `<span class="tester-status-icon">${test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️'}</span>`
      html += `<span class="tester-test-name">${test.name}</span>`
      html += `<span class="tester-test-duration">${test.duration}ms</span>`
      if (test.error) {
        html += `<div class="tester-test-error">${test.error.message}</div>`
      }
      html += `</div>`
    }
    html += `</div>`
    html += `</details>`
  }

  const s = result.summary
  const allPass = s.failed === 0 && s.errors === 0
  html += `
    <div class="tester-summary ${allPass ? 'pass' : 'fail'}">
      <strong>${allPass ? '✅ Tous les tests passent' : '❌ Des tests ont échoué'}</strong><br>
      ${s.passed}/${s.total} réussis
      ${s.failed > 0 ? `, ${s.failed} échec(s)` : ''}
      ${s.errors > 0 ? `, ${s.errors} erreur(s)` : ''}
      — Durée : ${s.duration}ms (${elapsed}ms temps réel)
    </div>
  `

  results.innerHTML = html
}

window._abortTests = function () {
  const { abortTests } = await import('./protask/api/tester.js')
  abortTests()
  document.getElementById('testerAbortBtn').style.display = 'none'
}
```

#### Sub-step 2.4: Add CSS for tester view

- [ ] **Step 2.4 — Add tester CSS styles in index.html**

Add inside the `<style>` block in `index.html`:

```css
.tester-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
  flex-wrap: wrap
}
.tester-bar label {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap
}
.tester-input {
  flex: 1;
  min-width: 200px;
  padding: 7px 12px;
  font-size: 13px;
  font-family: monospace;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--fg);
  outline: none
}
.tester-input:focus {
  border-color: var(--accent)
}
.tester-progress-bar {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden
}
.tester-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  width: 0;
  transition: width .3s
}
.tester-category {
  margin-bottom: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden
}
.tester-category-header {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  user-select: none;
  background: var(--card)
}
.tester-category-header:hover {
  background: var(--card-hover)
}
.tester-category-header.pass {
  color: #22C55E
}
.tester-category-header.fail {
  color: #EF4444
}
.tester-category-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400
}
.tester-test-list {
  border-top: 1px solid var(--border)
}
.tester-test {
  padding: 8px 14px 8px 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px
}
.tester-test.fail {
  background: rgba(239,68,68,.05)
}
.tester-test.error {
  background: rgba(234,179,8,.05)
}
.tester-test-name {
  flex: 1
}
.tester-test-duration {
  color: var(--text-secondary);
  font-size: 11px;
  font-family: monospace
}
.tester-test-error {
  width: 100%;
  margin-top: 4px;
  padding: 6px 10px;
  background: rgba(239,68,68,.1);
  border-radius: 4px;
  color: #e06c75;
  font-size: 12px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all
}
.tester-summary {
  margin-top: 16px;
  padding: 14px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6
}
.tester-summary.pass {
  background: rgba(34,197,94,.08);
  color: #22C55E
}
.tester-summary.fail {
  background: rgba(239,68,68,.08);
  color: #EF4444
}
.tester-status-icon {
  font-size: 14px;
  line-height: 1
}
```

#### Sub-step 2.5: Verify viewer integration

- [ ] **Step 2.5 — Manual verification**

```bash
# Start dev server
pnpm dev
```

1. Open `http://localhost:3080`
2. Select ProTask project
3. Click "Testeur" button in the views toolbar
4. Verify: URL input shows `http://localhost:3080/api`, "Lancer les tests" button visible
5. Click "Lancer les tests"
6. Verify: progress bar appears, tests run, results show 7 categories with 51 tests, all green
7. Click on a failed test (if any): verify error message displays expected vs actual
8. Click "Retour" button → back to preview

#### Sub-step 2.6: Commit viewer changes

- [ ] **Step 2.6 — Commit**

```bash
git add index.html viewer.js
git commit -m "feat: add Testeur view with API test runner UI"
```
