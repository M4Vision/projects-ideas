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
      if (actual === undefined) {
        throw new AssertionError(
          `Expected value to be defined but got ${String(actual)}`,
          'defined',
          String(actual)
        )
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be truthy`,
          'truthy',
          JSON.stringify(actual)
        )
      }
    },
    toBeGreaterThan(n) {
      if (actual <= n) {
        throw new AssertionError(`Expected ${actual} > ${n}`, `> ${n}`, String(actual))
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

let _baseUrl = ''

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function get(path, token) {
  const headers = {}
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { headers, signal: AbortSignal.timeout(10000) })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function put(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { method: 'PUT', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function patch(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { method: 'PATCH', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function del(path, token) {
  const headers = {}
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, { method: 'DELETE', headers, signal: AbortSignal.timeout(10000) })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

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

    it('inscrit les utilisateurs de démo au démarrage', async () => {
      const { data } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
      expect(data.user.name).toBe('Alexandre')
    })
  })

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

    it('retourne 403 si non-propriétaire retire un membre', async () => {
      await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      const { data: invs } = await get('/boards/' + boardId + '/invitations', alexToken)
      const { data: sophie } = await post('/auth/login', { email: 'sophie@protask.dev', password: 'pass123' })
      await patch('/invitations/' + invs[0].id, { status: 'accepted' }, sophie.token)
      const { data: marc } = await post('/auth/login', { email: 'marc@protask.dev', password: 'pass123' })
      const { status } = await del('/boards/' + boardId + '/members/' + sophie.user.id, marc.token)
      expect(status).toBe(403)
    })
  })
}

export async function runTests(baseUrl, allowedCategories) {
  _categories = []
  _abort = false
  _baseUrl = baseUrl.replace(/\/$/, '')

  defineTests()

  if (Array.isArray(allowedCategories)) {
    _categories = _categories.filter(category => allowedCategories.includes(category.name))
  }

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
