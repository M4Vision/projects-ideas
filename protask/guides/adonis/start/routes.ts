import router from '@adonisjs/core/services/router'

const AuthController = () => import('../app/controllers/AuthController.js')
const UsersController = () => import('../app/controllers/UsersController.js')
const BoardsController = () => import('../app/controllers/BoardsController.js')
const ColumnsController = () => import('../app/controllers/ColumnsController.js')
const CardsController = () => import('../app/controllers/CardsController.js')
const LabelsController = () => import('../app/controllers/LabelsController.js')
const CommentsController = () => import('../app/controllers/CommentsController.js')
const InvitationsController = () => import('../app/controllers/InvitationsController.js')
const ResetController = () => import('../app/controllers/ResetController.js')

// Routes publiques
router.post('/api/auth/register', [AuthController, 'register'])
router.post('/api/auth/login', [AuthController, 'login'])
router.post('/api/auth/logout', [AuthController, 'logout'])
router.post('/api/_reset', [ResetController, 'reset'])

// Routes protégées
router.group(() => {
  // Users
  router.get('/api/users/me', [UsersController, 'me'])
  router.put('/api/users/me', [UsersController, 'updateMe'])
  router.get('/api/users/:id', [UsersController, 'show'])

  // Boards
  router.get('/api/boards', [BoardsController, 'index'])
  router.post('/api/boards', [BoardsController, 'store'])
  router.get('/api/boards/:id', [BoardsController, 'show'])
  router.put('/api/boards/:id', [BoardsController, 'update'])
  router.delete('/api/boards/:id', [BoardsController, 'destroy'])

  // Columns — reorder DOIT être avant :id
  router.put('/api/columns/reorder', [ColumnsController, 'reorder'])
  router.get('/api/boards/:boardId/columns', [ColumnsController, 'index'])
  router.post('/api/boards/:boardId/columns', [ColumnsController, 'store'])
  router.put('/api/columns/:id', [ColumnsController, 'update'])
  router.delete('/api/columns/:id', [ColumnsController, 'destroy'])

  // Cards — reorder et move avant :id
  router.post('/api/cards/reorder', [CardsController, 'reorder'])
  router.post('/api/cards/:id/move', [CardsController, 'move'])
  router.get('/api/columns/:columnId/cards', [CardsController, 'index'])
  router.post('/api/columns/:columnId/cards', [CardsController, 'store'])
  router.get('/api/cards/:id', [CardsController, 'show'])
  router.patch('/api/cards/:id', [CardsController, 'update'])
  router.delete('/api/cards/:id', [CardsController, 'destroy'])

  // Labels
  router.get('/api/boards/:boardId/labels', [LabelsController, 'index'])
  router.post('/api/boards/:boardId/labels', [LabelsController, 'store'])
  router.patch('/api/labels/:id', [LabelsController, 'update'])
  router.delete('/api/labels/:id', [LabelsController, 'destroy'])

  // Comments
  router.get('/api/cards/:cardId/comments', [CommentsController, 'index'])
  router.post('/api/cards/:cardId/comments', [CommentsController, 'store'])
  router.delete('/api/comments/:id', [CommentsController, 'destroy'])

  // Invitations
  router.get('/api/boards/:boardId/invitations', [InvitationsController, 'index'])
  router.post('/api/boards/:boardId/invitations', [InvitationsController, 'store'])
  router.patch('/api/invitations/:id', [InvitationsController, 'update'])
  router.delete('/api/invitations/:id', [InvitationsController, 'destroy'])
  router.delete('/api/boards/:boardId/members/:memberId', [InvitationsController, 'removeMember'])
}).use([async (ctx, next) => {
  const { default: Middleware } = await import('../app/middleware/MockAuthMiddleware.js')
  return new Middleware().handle(ctx, next)
}])
