import { HttpContext } from '@adonisjs/core/http'

export default class MockAuthMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const auth = ctx.request.header('Authorization') || ''

    if (!auth.startsWith('Bearer token-')) {
      return ctx.response.status(401).json({
        error: 'Token manquant ou invalide.',
        statusCode: 401,
      })
    }

    const userId = parseInt(auth.slice('Bearer token-'.length), 10)

    if (isNaN(userId) || userId <= 0) {
      return ctx.response.status(401).json({
        error: 'Token invalide.',
        statusCode: 401,
      })
    }

    ctx.request.userId = userId
    await next()
  }
}
