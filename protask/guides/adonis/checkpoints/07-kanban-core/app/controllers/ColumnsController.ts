import { HttpContext } from '@adonisjs/core/http'
import ProjectColumn from '../models/ProjectColumn.js'

function formatColumn(col: ProjectColumn): any {
  return {
    ...col.toJSON(),
    order: col.orderColumn,
    boardId: col.boardId,
  }
}

export default class ColumnsController {
  async index(ctx: HttpContext) {
    const boardId = ctx.request.param('boardId')
    const columns = await ProjectColumn.query()
      .where('boardId', boardId)
      .orderBy('orderColumn', 'asc')
    return ctx.response.status(200).json(columns.map(formatColumn))
  }

  async store(ctx: HttpContext) {
    const boardId = ctx.request.param('boardId')
    const body = ctx.request.body() as any

    const max = await ProjectColumn.query()
      .where('boardId', boardId)
      .orderBy('orderColumn', 'desc')
      .first()

    const order = (max?.orderColumn ?? -1) + 1

    const col = await ProjectColumn.create({
      title: body.title,
      orderColumn: order,
      boardId: Number(boardId),
      color: body.color || null,
      description: body.description || null,
    })

    return ctx.response.status(201).json(formatColumn(col))
  }

  async update(ctx: HttpContext) {
    const col = await ProjectColumn.find(ctx.request.param('id'))
    if (!col) {
      return ctx.response.status(404).json({ error: 'Colonne introuvable.', statusCode: 404 })
    }

    const body = ctx.request.body() as any
    if (body.title !== undefined) col.title = body.title
    if (body.order !== undefined) col.orderColumn = body.order
    if (body.color !== undefined) col.color = body.color
    if (body.description !== undefined) col.description = body.description
    await col.save()

    return ctx.response.status(200).json(formatColumn(col))
  }

  async destroy(ctx: HttpContext) {
    const col = await ProjectColumn.find(ctx.request.param('id'))
    if (!col) {
      return ctx.response.status(404).json({ error: 'Colonne introuvable.', statusCode: 404 })
    }
    await col.delete()
    return ctx.response.status(204)
  }

  async reorder(ctx: HttpContext) {
    const body = ctx.request.body() as { id: number; order: number }[]
    for (const item of body) {
      await ProjectColumn.query().where('id', item.id).update({ orderColumn: item.order })
    }
    const cols = await ProjectColumn.query().orderBy('orderColumn', 'asc')
    return ctx.response.status(200).json(cols.map(formatColumn))
  }
}
