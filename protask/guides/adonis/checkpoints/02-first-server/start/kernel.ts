import server from '@adonisjs/core/services/server'

server.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
])

// Le MockAuthMiddleware est appliqué uniquement au groupe de routes
// protégé dans start/routes.ts.
