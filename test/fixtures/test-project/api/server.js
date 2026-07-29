import { Hono } from 'hono'
import { cors } from 'hono/cors'

const mockData = {
  users: [
    { id: 1, name: 'Alice', email: 'alice@test.dev', password: 'pass123', createdAt: '2026-01-15T08:00:00Z' },
    { id: 2, name: 'Bob', email: 'bob@test.dev', password: 'pass123', createdAt: '2026-02-01T10:00:00Z' },
  ],
  todos: [
    { id: 1, title: 'Apprendre AdonisJS', completed: false, userId: 1, createdAt: '2026-07-01T09:00:00Z' },
    { id: 2, title: 'Écrire les tests', completed: true, userId: 1, createdAt: '2026-07-02T14:00:00Z' },
    { id: 3, title: 'Déployer en production', completed: false, userId: 2, createdAt: '2026-07-03T11:00:00Z' },
  ],
  nextId: { todo: 4 },
}

const initialData = JSON.parse(JSON.stringify(mockData))

function resetData() {
  Object.assign(mockData, JSON.parse(JSON.stringify(initialData)))
}

function sanitizeUser(user) {
  const { password, ...safe } = user
  return safe
}

function authenticate(c) {
  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const match = token.match(/^token-(\d+)$/)
  return match ? parseInt(match[1]) : null
}

function requireAuth(c) {
  const userId = authenticate(c)
  if (!userId) {
    c.status(401)
    return c.json({ error: 'Non authentifié.' })
  }
  return userId
}

const app = new Hono()
app.use('/api/*', cors())

app.post('/api/_reset', (c) => {
  resetData()
  return c.json({ ok: true })
})

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) {
    c.status(400)
    return c.json({ error: 'Email et mot de passe requis.' })
  }
  const user = mockData.users.find(u => u.email === email && u.password === password)
  if (!user) {
    c.status(401)
    return c.json({ error: 'Email ou mot de passe incorrect.' })
  }
  return c.json({ token: `token-${user.id}`, user: sanitizeUser(user) })
})

app.get('/api/auth/me', (c) => {
  const userId = requireAuth(c)
  if (typeof userId === 'object') return
  const user = mockData.users.find(u => u.id === userId)
  return c.json(sanitizeUser(user))
})

app.get('/api/todos', (c) => {
  const userId = requireAuth(c)
  if (typeof userId === 'object') return
  const todos = mockData.todos.filter(t => t.userId === userId)
  return c.json(todos)
})

app.post('/api/todos', async (c) => {
  const userId = requireAuth(c)
  if (typeof userId === 'object') return
  const { title } = await c.req.json()
  if (!title || !title.trim()) {
    c.status(400)
    return c.json({ error: 'Le titre est requis.' })
  }
  const todo = {
    id: mockData.nextId.todo++,
    title: title.trim(),
    completed: false,
    userId,
    createdAt: new Date().toISOString(),
  }
  mockData.todos.push(todo)
  c.status(201)
  return c.json(todo)
})

app.put('/api/todos/:id', async (c) => {
  const userId = requireAuth(c)
  if (typeof userId === 'object') return
  const id = parseInt(c.req.param('id'))
  const todo = mockData.todos.find(t => t.id === id)
  if (!todo || todo.userId !== userId) {
    c.status(404)
    return c.json({ error: 'Todo introuvable.' })
  }
  const { title, completed } = await c.req.json()
  if (title !== undefined) todo.title = title.trim()
  if (completed !== undefined) todo.completed = completed
  return c.json(todo)
})

app.delete('/api/todos/:id', (c) => {
  const userId = requireAuth(c)
  if (typeof userId === 'object') return
  const id = parseInt(c.req.param('id'))
  const index = mockData.todos.findIndex(t => t.id === id && t.userId === userId)
  if (index === -1) {
    c.status(404)
    return c.json({ error: 'Todo introuvable.' })
  }
  mockData.todos.splice(index, 1)
  c.status(204)
  return c.body(null)
})

export default app
