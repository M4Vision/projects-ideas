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

const app = new Hono()

app.use('/api/*', cors())

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

export default app
