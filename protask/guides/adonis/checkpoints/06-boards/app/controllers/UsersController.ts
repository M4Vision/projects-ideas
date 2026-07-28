import { HttpContext } from '@adonisjs/core/http'
import User from '../models/User.js'

export default class UsersController {
  async me(ctx: HttpContext) {
    const userId = (ctx.request as any).userId
    const user = await User.find(userId)
    if (!user) {
      return ctx.response.status(404).json({ error: 'Utilisateur introuvable.', statusCode: 404 })
    }
    return ctx.response.status(200).json(user.toResponse())
  }

  async updateMe(ctx: HttpContext) {
    const userId = (ctx.request as any).userId
    const user = await User.find(userId)
    if (!user) {
      return ctx.response.status(404).json({ error: 'Utilisateur introuvable.', statusCode: 404 })
    }

    const body = ctx.request.body() as any
    if (body.name !== undefined) user.name = body.name
    if (body.avatar !== undefined) user.avatar = body.avatar
    await user.save()

    return ctx.response.status(200).json(user.toResponse())
  }

  async show(ctx: HttpContext) {
    const user = await User.find(ctx.request.param('id'))
    if (!user) {
      return ctx.response.status(404).json({ error: 'Utilisateur introuvable.', statusCode: 404 })
    }
    return ctx.response.status(200).json(user.toResponse())
  }
}
