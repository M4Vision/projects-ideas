import { HttpContext } from '@adonisjs/core/http'
import User from '../models/User.js'

export default class AuthController {
  async register(ctx: HttpContext) {
    const body = ctx.request.body() as any

    if (!body.name || !body.email || !body.password) {
      return ctx.response.status(400).json({ error: 'Champs requis.', statusCode: 400 })
    }

    const existing = await User.findBy('email', body.email)
    if (existing) {
      return ctx.response.status(400).json({ error: 'Email déjà utilisé.', statusCode: 400 })
    }

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
      avatar: body.avatar || '',
    })

    return ctx.response.status(201).json({
      user: user.toResponse(),
      token: 'token-' + user.id,
    })
  }

  async login(ctx: HttpContext) {
    const body = ctx.request.body() as any

    if (!body.email || !body.password) {
      return ctx.response.status(400).json({ error: 'Email et mot de passe requis.', statusCode: 400 })
    }

    const user = await User.findBy('email', body.email)
    if (!user || user.password !== body.password) {
      return ctx.response.status(401).json({ error: 'Email ou mot de passe incorrect.', statusCode: 401 })
    }

    return ctx.response.status(200).json({
      user: user.toResponse(),
      token: 'token-' + user.id,
    })
  }

  async logout(ctx: HttpContext) {
    return ctx.response.status(200).json({ success: true })
  }
}
