import { HttpContext } from '@adonisjs/core/http'
import Card from '../models/Card.js'
import ProjectColumn from '../models/ProjectColumn.js'

async function formatCard(card: Card): Promise<any> {
  await card.load((loader) => {
    loader.load('assignee').load('comments', (commentsLoader) => {
      commentsLoader.preload('author')
    })
  })

  const labels = card.labelIds?.length
    ? await (await import('../models/Label.js')).default.query().whereIn('id', card.labelIds)
    : []

  return {
    ...card.toJSON(),
    order: card.orderColumn,
    labels,
    assignee: card.assignee?.toResponse?.() ?? card.assignee,
    comments: card.comments?.map((c: any) => ({
      ...c.toJSON(),
      author: c.author?.toResponse?.() ?? c.author,
    })),
  }
}

export default class CardsController {
  async index(ctx: HttpContext) {
    const columnId = ctx.request.param('columnId')
    const cards = await Card.query()
      .where('columnId', columnId)
      .orderBy('orderColumn', 'asc')

    return ctx.response.status(200).json(await Promise.all(cards.map(formatCard)))
  }

  async store(ctx: HttpContext) {
    const columnId = ctx.request.param('columnId')
    const body = ctx.request.body() as any

    const col = await ProjectColumn.find(columnId)
    if (!col) {
      return ctx.response.status(404).json({ error: 'Colonne introuvable.', statusCode: 404 })
    }
    if (!body.title) {
      return ctx.response.status(400).json({ error: 'Le titre est requis.', statusCode: 400 })
    }

    const max = await Card.query()
      .where('columnId', columnId)
      .orderBy('orderColumn', 'desc')
      .first()

    const order = (max?.orderColumn ?? -1) + 1

    const card = await Card.create({
      title: body.title,
      description: body.description || '',
      orderColumn: order,
      columnId: Number(columnId),
      dueDate: body.dueDate || null,
      assigneeId: body.assigneeId || null,
      labelIds: body.labelIds || [],
    })

    return ctx.response.status(201).json(await formatCard(card))
  }

  async show(ctx: HttpContext) {
    const card = await Card.find(ctx.request.param('id'))
    if (!card) {
      return ctx.response.status(404).json({ error: 'Carte introuvable.', statusCode: 404 })
    }
    return ctx.response.status(200).json(await formatCard(card))
  }

  async update(ctx: HttpContext) {
    const card = await Card.find(ctx.request.param('id'))
    if (!card) {
      return ctx.response.status(404).json({ error: 'Carte introuvable.', statusCode: 404 })
    }

    const body = ctx.request.body() as any
    if (body.title !== undefined) card.title = body.title
    if (body.description !== undefined) card.description = body.description
    if (body.dueDate !== undefined) card.dueDate = body.dueDate
    if (body.assigneeId !== undefined) card.assigneeId = body.assigneeId
    if (body.labels !== undefined) card.labelIds = body.labels
    else if (body.labelIds !== undefined) card.labelIds = body.labelIds
    await card.save()

    return ctx.response.status(200).json(await formatCard(card))
  }

  async destroy(ctx: HttpContext) {
    const card = await Card.find(ctx.request.param('id'))
    if (!card) {
      return ctx.response.status(404).json({ error: 'Carte introuvable.', statusCode: 404 })
    }
    await card.delete()
    return ctx.response.status(204)
  }

  async reorder(ctx: HttpContext) {
    const items = ctx.request.body() as { id: number; order: number }[]
    for (const item of items) {
      await Card.query().where('id', item.id).update({ orderColumn: item.order })
    }
    const ids = items.map((b) => b.id)
    const cards = await Card.query().whereIn('id', ids)
    return ctx.response.status(200).json(await Promise.all(cards.map(formatCard)))
  }

  async move(ctx: HttpContext) {
    const card = await Card.find(ctx.request.param('id'))
    if (!card) {
      return ctx.response.status(404).json({ error: 'Carte introuvable.', statusCode: 404 })
    }

    const body = ctx.request.body() as any
    if (body.columnId !== undefined) card.columnId = body.columnId
    if (body.order !== undefined) card.orderColumn = body.order
    await card.save()

    return ctx.response.status(200).json(await formatCard(card))
  }
}
