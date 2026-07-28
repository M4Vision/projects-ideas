import { HttpContext } from '@adonisjs/core/http'
import Board from '../models/Board.js'
import Card from '../models/Card.js'
import ProjectColumn from '../models/ProjectColumn.js'

export default class BoardsController {
  async index(ctx: HttpContext) {
    const userId = (ctx.request as any).userId
    const boards = await Board.all()

    const filtered = boards.filter(
      (b) => b.ownerId === userId || (b.memberIds || []).includes(userId),
    )

    const result = await Promise.all(
      filtered.map(async (b) => {
        const cols = await ProjectColumn.query().where('boardId', b.id)
        const colIds = cols.map((c) => c.id)
        const cardCount = colIds.length
          ? (await Card.query().whereIn('columnId', colIds).count('* as total'))[0].$extras.total
          : 0
        return {
          ...b.toJSON(),
          order: b.toJSON().orderColumn,
          cardCount: Number(cardCount),
          members: await b.getMembers(),
        }
      }),
    )

    return ctx.response.status(200).json(result)
  }

  async store(ctx: HttpContext) {
    const userId = (ctx.request as any).userId
    const body = ctx.request.body() as any

    const board = await Board.create({
      title: body.title,
      ownerId: userId,
      description: body.description || '',
      color: body.color || '#1976D2',
      categories: body.categories || [],
    })

    await ProjectColumn.createMany([
      { title: 'Backlog', orderColumn: 0, boardId: board.id },
      { title: 'En cours', orderColumn: 1, boardId: board.id },
      { title: 'Terminé', orderColumn: 2, boardId: board.id },
    ])

    await board.load('columns')
    const data = { ...board.toJSON(), members: await board.getMembers() }
    return ctx.response.status(201).json(data)
  }

  async show(ctx: HttpContext) {
    const board = await Board.find(ctx.request.param('id'))
    if (!board) {
      return ctx.response.status(404).json({ error: 'Tableau introuvable.', statusCode: 404 })
    }

    await board.load('columns')
    const data = { ...board.toJSON(), members: await board.getMembers() }
    return ctx.response.status(200).json(data)
  }

  async update(ctx: HttpContext) {
    const board = await Board.find(ctx.request.param('id'))
    if (!board) {
      return ctx.response.status(404).json({ error: 'Tableau introuvable.', statusCode: 404 })
    }

    const body = ctx.request.body() as any
    if (body.title !== undefined) board.title = body.title
    if (body.description !== undefined) board.description = body.description
    if (body.color !== undefined) board.color = body.color
    if (body.categories !== undefined) board.categories = body.categories
    await board.save()

    await board.load('columns')
    const data = { ...board.toJSON(), members: await board.getMembers() }
    return ctx.response.status(200).json(data)
  }

  async destroy(ctx: HttpContext) {
    const userId = (ctx.request as any).userId
    const board = await Board.find(ctx.request.param('id'))
    if (!board) {
      return ctx.response.status(404).json({ error: 'Tableau introuvable.', statusCode: 404 })
    }
    if (board.ownerId !== userId) {
      return ctx.response.status(403).json({ error: 'Seul le propriétaire peut supprimer.', statusCode: 403 })
    }

    await board.delete()
    return ctx.response.status(204)
  }
}
