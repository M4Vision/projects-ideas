import { HttpContext } from '@adonisjs/core/http'
import Label from '../models/Label.js'

export default class LabelsController {
  async index(ctx: HttpContext) {
    const labels = await Label.query().where('boardId', ctx.request.param('boardId'))
    return ctx.response.status(200).json(labels.map((l) => l.toJSON()))
  }

  async store(ctx: HttpContext) {
    const body = ctx.request.body() as any
    if (!body.name) {
      return ctx.response.status(400).json({ error: 'Le nom est requis.', statusCode: 400 })
    }

    const label = await Label.create({
      name: body.name,
      color: body.color || '#1976D2',
      description: body.description || null,
      boardId: Number(ctx.request.param('boardId')),
    })

    return ctx.response.status(201).json(label.toJSON())
  }

  async update(ctx: HttpContext) {
    const label = await Label.find(ctx.request.param('id'))
    if (!label) {
      return ctx.response.status(404).json({ error: 'Label introuvable.', statusCode: 404 })
    }

    const body = ctx.request.body() as any
    if (body.name !== undefined) label.name = body.name
    if (body.color !== undefined) label.color = body.color
    if (body.description !== undefined) label.description = body.description
    await label.save()

    return ctx.response.status(200).json(label.toJSON())
  }

  async destroy(ctx: HttpContext) {
    const label = await Label.find(ctx.request.param('id'))
    if (!label) {
      return ctx.response.status(404).json({ error: 'Label introuvable.', statusCode: 404 })
    }
    await label.delete()
    return ctx.response.status(204)
  }
}
