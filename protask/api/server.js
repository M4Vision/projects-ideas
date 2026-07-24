import { Hono } from 'hono'
import { cors } from 'hono/cors'

const mockData = {
  users: [
    { id: 1, name: 'Alexandre', email: 'alex@protask.dev', avatar: '', password: 'pass123', createdAt: '2025-01-15T08:00:00Z' },
    { id: 2, name: 'Sophie', email: 'sophie@protask.dev', avatar: '', password: 'pass123', createdAt: '2025-02-20T10:30:00Z' },
    { id: 3, name: 'Marc', email: 'marc@protask.dev', avatar: '', password: 'pass123', createdAt: '2025-03-10T14:00:00Z' },
  ],
  boards: [
    { id: 1, title: 'Design System', ownerId: 1, description: 'Design system de l\'application', color: '#8B5CF6', categories: ['Design', 'UI/UX'], createdAt: '2025-03-01T09:00:00Z' },
    { id: 2, title: 'Refonte App Mobile', ownerId: 1, description: 'Refonte complète de l\'application mobile', color: '#3B82F6', categories: ['Mobile'], createdAt: '2025-03-10T14:00:00Z' },
    { id: 3, title: 'Marketing Q2', ownerId: 2, description: 'Stratégie marketing pour le Q2', color: '#EF4444', categories: ['Marketing'], createdAt: '2025-04-01T11:00:00Z' },
  ],
  columns: [
    { id: 1, title: 'Backlog', order: 0, boardId: 1, color: '#6B7280', description: 'Tâches en attente de traitement' },
    { id: 2, title: 'En cours', order: 1, boardId: 1, color: '#3B82F6', description: 'Tâches en cours de développement' },
    { id: 3, title: 'Terminé', order: 2, boardId: 1, color: '#10B981', description: 'Tâches terminées et validées' },
    { id: 4, title: 'À faire', order: 0, boardId: 2, color: '#F59E0B', description: 'Tâches planifiées' },
    { id: 5, title: 'En cours', order: 1, boardId: 2, color: '#3B82F6', description: '' },
    { id: 6, title: 'Terminé', order: 2, boardId: 2, color: '#10B981', description: '' },
    { id: 7, title: 'Idées', order: 0, boardId: 3, color: '#8B5CF6', description: 'Idées à explorer' },
    { id: 8, title: 'En production', order: 1, boardId: 3, color: '#EF4444', description: 'Campagnes en cours' },
  ],
  cards: [
    { id: 1, title: 'Définir la palette', description: 'Choisir les couleurs primaires et secondaires du design system.', order: 0, columnId: 1, dueDate: '2025-04-15', assigneeId: 1, labels: [1] },
    { id: 2, title: 'Composants UI', description: 'Créer les composations Button, Input, Card, Modal.', order: 1, columnId: 1, dueDate: '2025-04-20', assigneeId: 2, labels: [1, 2] },
    { id: 3, title: 'Page accueil responsive', description: 'Terminer la mise en page responsive de la page d\'accueil.', order: 0, columnId: 2, dueDate: '2025-04-10', assigneeId: 1, labels: [2] },
    { id: 4, title: 'Documentation', description: 'Écrire la documentation du design system.', order: 1, columnId: 3, dueDate: '2025-04-05', assigneeId: 2, labels: [3] },
    { id: 5, title: 'Wireframes', description: 'Wireframes validés par le client.', order: 0, columnId: 4, dueDate: '2025-04-08', assigneeId: 1, labels: [2] },
    { id: 6, title: 'Maquette Figma', description: 'Maquette haute fidélité de l\'écran principal.', order: 0, columnId: 5, dueDate: '2025-04-18', assigneeId: 1, labels: [1] },
    { id: 7, title: 'Tests utilisateurs', description: 'Sessions de test avec 5 utilisateurs.', order: 0, columnId: 6, dueDate: '2025-04-12', assigneeId: 2, labels: [3] },
    { id: 8, title: 'Analyse concurrents', description: 'Benchmark des 3 principaux concurrents.', order: 0, columnId: 7, dueDate: '2025-04-14', assigneeId: 1, labels: [2] },
    { id: 9, title: 'Stratégie contenu', description: 'Définir le calendrier éditorial Q2.', order: 1, columnId: 7, dueDate: '2025-04-22', assigneeId: 2, labels: [1, 4] },
    { id: 10, title: 'Campagne emailing', description: 'Préparer la séquence d\'emails pour le lancement.', order: 0, columnId: 8, dueDate: '2025-04-25', assigneeId: 1, labels: [4] },
  ],
  labels: [
    { id: 1, name: 'Design', color: '#8B5CF6', boardId: 1, description: 'Tâches de design et maquettage' },
    { id: 2, name: 'Dev', color: '#3B82F6', boardId: 1, description: 'Tâches de développement' },
    { id: 3, name: 'Documentation', color: '#10B981', boardId: 1, description: 'Documentation technique' },
    { id: 4, name: 'Urgent', color: '#EF4444', boardId: 1, description: 'Tâches à priorité haute' },
  ],
  comments: [
    { id: 1, text: 'J\'ai commencé la palette, je propose du violet comme couleur principale.', authorId: 1, cardId: 1, createdAt: '2025-04-01T10:00:00Z' },
    { id: 2, text: 'Bonne idée ! Je valide le violet.', authorId: 2, cardId: 1, createdAt: '2025-04-01T11:30:00Z' },
    { id: 3, text: 'PR créé sur GitHub.', authorId: 1, cardId: 3, createdAt: '2025-04-02T09:00:00Z' },
    { id: 4, text: 'J\'ai ajouté les variantes disabled et loading.', authorId: 2, cardId: 2, createdAt: '2025-04-02T14:00:00Z' },
    { id: 5, text: 'Review faite, quelques suggestions.', authorId: 1, cardId: 2, createdAt: '2025-04-03T10:00:00Z' },
  ],
  invitations: [
    { id: 1, boardId: 1, email: 'marc@protask.dev', invitedById: 1, status: 'accepted', createdAt: '2025-03-15T08:00:00Z' },
    { id: 2, boardId: 1, email: 'julie@test.com', invitedById: 1, status: 'pending', createdAt: '2025-04-01T08:00:00Z' },
  ],
  boardMembers: { 1: [2, 3], 2: [], 3: [1] },
}

const initialData = JSON.parse(JSON.stringify(mockData))

function resetData() {
  Object.assign(mockData, JSON.parse(JSON.stringify(initialData)))
}

function sanitizeUser(user) {
  const { password, ...safe } = user
  return safe
}

function findBoard(id) {
  const b = mockData.boards.find(x => x.id === id)
  if (!b) throw new Error('Board introuvable.')
  return b
}

function findColumn(id) {
  const c = mockData.columns.find(x => x.id === id)
  if (!c) throw new Error('Colonne introuvable.')
  return c
}

function findCard(id) {
  const c = mockData.cards.find(x => x.id === id)
  if (!c) throw new Error('Carte introuvable.')
  return c
}

function findUser(id) {
  return mockData.users.find(x => x.id === id)
}

function findLabel(id) {
  return mockData.labels.find(x => x.id === id)
}

function resolveCard(card, includeComments = false) {
  const assignee = card.assigneeId ? findUser(card.assigneeId) : null
  const resolvedLabels = (card.labels || []).map(id => mockData.labels.find(l => l.id === id)).filter(Boolean)
  const result = { ...card, labels: resolvedLabels, assignee: assignee ? sanitizeUser(assignee) : null }
  if (includeComments) {
    result.comments = mockData.comments.filter(c => c.cardId === card.id).map(c => ({
      ...c, author: sanitizeUser(findUser(c.authorId))
    }))
  }
  return result
}

const app = new Hono()

app.use('/api/*', cors())

app.use('/api/*', async (c, next) => {
  if (c.req.path.startsWith('/api/auth/') || c.req.path === '/api/_reset') return next()
  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer token-')) return c.json({ error: 'Non authentifié.' }, 401)
  const userId = parseInt(auth.slice('Bearer token-'.length))
  const user = mockData.users.find(u => u.id === userId)
  if (!user) return c.json({ error: 'Token invalide.' }, 401)
  c.set('userId', userId)
  c.set('currentUser', user)
  return next()
})

app.post('/api/_reset', (c) => {
  resetData()
  return c.json({ success: true })
})

app.post('/api/auth/register', async (c) => {
  const { name, email, password } = await c.req.json()
  if (!name || !email || !password) return c.json({ error: 'Champs obligatoires : name, email, password' }, 400)
  if (mockData.users.find(u => u.email === email)) return c.json({ error: 'Cet email est déjà utilisé.' }, 400)
  const user = { id: mockData.users.length + 1, name, email, avatar: '', password, createdAt: new Date().toISOString() }
  mockData.users.push(user)
  return c.json({ user: sanitizeUser(user), token: 'token-' + user.id }, 201)
})

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = mockData.users.find(u => u.email === email)
  if (!user || user.password !== password) return c.json({ error: 'Email ou mot de passe incorrect.' }, 401)
  return c.json({ user: sanitizeUser(user), token: 'token-' + user.id })
})

app.post('/api/auth/logout', (c) => {
  return c.json({ success: true })
})

// Boards
app.get('/api/boards', (c) => {
  const user = c.get('currentUser')
  return c.json(mockData.boards
    .filter(b => b.ownerId === user.id || (mockData.boardMembers[b.id] || []).includes(user.id))
    .map(b => ({
      ...b,
      members: [mockData.users.find(u => u.id === b.ownerId), ...(mockData.boardMembers[b.id] || []).map(id => findUser(id))].filter(Boolean).map(m => sanitizeUser(m)),
      cardCount: mockData.cards.filter(card => mockData.columns.filter(col => col.boardId === b.id).some(col => col.id === card.columnId)).length,
    })))
})

app.post('/api/boards', async (c) => {
  const user = c.get('currentUser')
  const { title, color, categories, description } = await c.req.json()
  if (!title) return c.json({ error: 'Le titre est obligatoire.' }, 400)
  const board = { id: mockData.boards.length + 1, title, ownerId: user.id, description: description || '', color: color || '#000000', categories: categories || [], createdAt: new Date().toISOString() }
  mockData.boards.push(board)
  mockData.boardMembers[board.id] = []
  ;['À faire', 'En cours', 'Terminé'].forEach((title, i) => {
    mockData.columns.push({ id: mockData.columns.length + 1, title, order: i, boardId: board.id, color: '#6B7280', description: '' })
  })
  return c.json(board, 201)
})

app.get('/api/boards/:id', (c) => {
  try {
    const board = findBoard(parseInt(c.req.param('id')))
    const cols = mockData.columns.filter(col => col.boardId === board.id).sort((a, b) => a.order - b.order)
    const members = [mockData.users.find(u => u.id === board.ownerId), ...(mockData.boardMembers[board.id] || []).map(id => findUser(id))].filter(Boolean)
    return c.json({ ...board, columns: cols, members: members.map(m => sanitizeUser(m)) })
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.put('/api/boards/:id', async (c) => {
  try {
    const board = findBoard(parseInt(c.req.param('id')))
    const data = await c.req.json()
    Object.assign(board, data)
    return c.json(board)
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.delete('/api/boards/:id', (c) => {
  try {
    const user = c.get('currentUser')
    const board = findBoard(parseInt(c.req.param('id')))
    if (board.ownerId !== user.id) return c.json({ error: 'Seul le propriétaire peut supprimer ce board.' }, 403)
    const colIds = mockData.columns.filter(col => col.boardId === board.id).map(col => col.id)
    mockData.cards = mockData.cards.filter(card => !colIds.includes(card.columnId))
    mockData.columns = mockData.columns.filter(col => col.boardId !== board.id)
    mockData.boards = mockData.boards.filter(b => b.id !== board.id)
    return c.body(null, 204)
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

// Columns
app.get('/api/boards/:id/columns', (c) => {
  try {
    const board = findBoard(parseInt(c.req.param('id')))
    return c.json(mockData.columns.filter(col => col.boardId === board.id).sort((a, b) => a.order - b.order))
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.post('/api/boards/:id/columns', async (c) => {
  try {
    const board = findBoard(parseInt(c.req.param('id')))
    const { title, color, description } = await c.req.json()
    if (!title) return c.json({ error: 'Le titre est obligatoire.' }, 400)
    const cols = mockData.columns.filter(col => col.boardId === board.id)
    const col = { id: mockData.columns.length + 1, title, order: cols.length, boardId: board.id, color: color || '#6B7280', description: description || '' }
    mockData.columns.push(col)
    return c.json(col, 201)
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.put('/api/columns/reorder', async (c) => {
  const items = await c.req.json()
  items.forEach(({ id, order }) => {
    const col = mockData.columns.find(x => x.id === id)
    if (col) col.order = order
  })
  return c.json(mockData.columns.sort((a, b) => a.order - b.order))
})

app.put('/api/columns/:id', async (c) => {
  try {
    const col = findColumn(parseInt(c.req.param('id')))
    const data = await c.req.json()
    Object.assign(col, data)
    return c.json(col)
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.delete('/api/columns/:id', (c) => {
  try {
    const col = findColumn(parseInt(c.req.param('id')))
    mockData.cards = mockData.cards.filter(card => card.columnId !== col.id)
    mockData.columns = mockData.columns.filter(x => x.id !== col.id)
    return c.body(null, 204)
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

// Cards
app.get('/api/columns/:id/cards', (c) => {
  try {
    findColumn(parseInt(c.req.param('id')))
    const cards = mockData.cards.filter(card => card.columnId === parseInt(c.req.param('id'))).sort((a, b) => a.order - b.order)
    return c.json(cards.map(card => resolveCard(card)))
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.post('/api/columns/:id/cards', async (c) => {
  try {
    const colId = parseInt(c.req.param('id'))
    findColumn(colId)
    const { title, description, dueDate, assigneeId, labels } = await c.req.json()
    if (!title) return c.json({ error: 'Le titre est obligatoire.' }, 400)
    const colCards = mockData.cards.filter(card => card.columnId === colId)
    const card = { id: mockData.cards.length + 1, title, description: description || '', order: colCards.length, columnId: colId, dueDate: dueDate || null, assigneeId: assigneeId || null, labels: labels || [] }
    mockData.cards.push(card)
    return c.json(resolveCard(card), 201)
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.get('/api/cards/:id', (c) => {
  try {
    return c.json(resolveCard(findCard(parseInt(c.req.param('id'))), true))
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.patch('/api/cards/:id', async (c) => {
  try {
    const card = findCard(parseInt(c.req.param('id')))
    const data = await c.req.json()
    const allowed = ['title', 'description', 'dueDate', 'assigneeId', 'labels', 'order']
    for (const key of allowed) {
      if (key in data) card[key] = data[key]
    }
    return c.json(resolveCard(card))
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.delete('/api/cards/:id', (c) => {
  try {
    findCard(parseInt(c.req.param('id')))
    const id = parseInt(c.req.param('id'))
    mockData.comments = mockData.comments.filter(cm => cm.cardId !== id)
    mockData.cards = mockData.cards.filter(card => card.id !== id)
    return c.body(null, 204)
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.post('/api/cards/reorder', async (c) => {
  const items = await c.req.json()
  items.forEach(({ id, order }) => {
    const card = mockData.cards.find(x => x.id === id)
    if (card) card.order = order
  })
  return c.json(mockData.cards.sort((a, b) => a.order - b.order).map(card => resolveCard(card)))
})

app.post('/api/cards/:id/move', async (c) => {
  try {
    const card = findCard(parseInt(c.req.param('id')))
    const { columnId, order } = await c.req.json()
    findColumn(columnId)
    card.columnId = columnId
    if (typeof order === 'number') card.order = order
    return c.json(resolveCard(card))
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

// Labels
app.get('/api/boards/:id/labels', (c) => {
  const boardId = parseInt(c.req.param('id'))
  return c.json(mockData.labels.filter(l => l.boardId === boardId))
})

app.post('/api/boards/:id/labels', async (c) => {
  const boardId = parseInt(c.req.param('id'))
  const { name, color, description } = await c.req.json()
  if (!name) return c.json({ error: 'Le nom est obligatoire.' }, 400)
  const label = { id: mockData.labels.length + 1, name, color: color || '#6B7280', boardId, description: description || '' }
  mockData.labels.push(label)
  return c.json(label, 201)
})

app.patch('/api/labels/:id', async (c) => {
  const label = findLabel(parseInt(c.req.param('id')))
  if (!label) return c.json({ error: 'Label introuvable.' }, 404)
  const data = await c.req.json()
  const allowed = ['name', 'color', 'description']
  for (const key of allowed) {
    if (key in data) label[key] = data[key]
  }
  return c.json(label)
})

app.delete('/api/labels/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const label = findLabel(id)
  if (!label) return c.json({ error: 'Label introuvable.' }, 404)
  mockData.labels = mockData.labels.filter(l => l.id !== id)
  mockData.cards.forEach(card => {
    card.labels = card.labels.filter(l => l !== id)
  })
  return c.body(null, 204)
})

// Comments
app.get('/api/cards/:id/comments', (c) => {
  try {
    findCard(parseInt(c.req.param('id')))
    const id = parseInt(c.req.param('id'))
    return c.json(mockData.comments.filter(cm => cm.cardId === id).map(cm => ({
      ...cm, author: sanitizeUser(findUser(cm.authorId))
    })))
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.post('/api/cards/:id/comments', async (c) => {
  try {
    const card = findCard(parseInt(c.req.param('id')))
    const { text } = await c.req.json()
    if (!text) return c.json({ error: 'Le texte est obligatoire.' }, 400)
    const user = c.get('currentUser')
    const comment = { id: mockData.comments.length + 1, text, authorId: user.id, cardId: card.id, createdAt: new Date().toISOString() }
    mockData.comments.push(comment)
    return c.json({ ...comment, author: sanitizeUser(user) }, 201)
  } catch (e) {
    return c.json({ error: e.message }, 404)
  }
})

app.delete('/api/comments/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const comment = mockData.comments.find(cm => cm.id === id)
  if (!comment) return c.json({ error: 'Commentaire introuvable.' }, 404)
  mockData.comments = mockData.comments.filter(cm => cm.id !== id)
  return c.body(null, 204)
})

export default app