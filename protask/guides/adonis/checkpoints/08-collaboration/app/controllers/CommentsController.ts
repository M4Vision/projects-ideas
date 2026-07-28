import { HttpContext } from '@adonisjs/core/http'
import Comment from '../models/Comment.js'
import Card from '../models/Card.js'

export default class CommentsController {
  async index(ctx: HttpContext) {
    const cardId = ctx.request.param('cardId')
    const comments = await Comment.query()
      .where('cardId', cardId)
      .preload('author')

    return ctx.response.status(200).json(
      comments.map((c) => ({
        ...c.toJSON(),
        author: c.author?.toResponse?.() ?? c.author,
      })),
    )
  }

  async store(ctx: HttpContext) {
    const cardId = ctx.request.param('cardId')
    const userId = (ctx.request as any).userId
    const body = ctx.request.body() as any

    const card = await Card.find(cardId)
    if (!card) {
      return ctx.response.status(404).json({ error: 'Carte introuvable.', statusCode: 404 })
    }

    if (!body.text) {
      return ctx.response.status(400).json({ error: 'Le texte est requis.', statusCode: 400 })
    }

    const comment = await Comment.create({
      text: body.text,
      authorId: userId,
      cardId: Number(cardId),
    })

    await comment.load('author')

    return ctx.response.status(201).json({
      ...comment.toJSON(),
      author: comment.author?.toResponse?.() ?? comment.author,
    })
  }

  async destroy(ctx: HttpContext) {
    const comment = await Comment.find(ctx.request.param('id'))
    if (!comment) {
      return ctx.response.status(404).json({ error: 'Commentaire introuvable.', statusCode: 404 })
    }
    await comment.delete()
    return ctx.response.status(204)
  }
}
