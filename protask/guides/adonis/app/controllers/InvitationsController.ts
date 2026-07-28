import { HttpContext } from '@adonisjs/core/http'
import Invitation from '../models/Invitation.js'
import User from '../models/User.js'
import Board from '../models/Board.js'

export default class InvitationsController {
  async index(ctx: HttpContext) {
    const boardId = ctx.request.param('boardId')
    const invitations = await Invitation.query()
      .where('boardId', boardId)
      .preload('user')

    return ctx.response.status(200).json(
      invitations.map((i) => ({
        ...i.toJSON(),
        user: i.user?.toResponse?.() ?? i.user,
      })),
    )
  }

  async store(ctx: HttpContext) {
    const boardId = ctx.request.param('boardId')
    const userId = (ctx.request as any).userId
    const body = ctx.request.body() as any

    const board = await Board.find(boardId)
    if (!board) {
      return ctx.response.status(404).json({ error: 'Tableau introuvable.', statusCode: 404 })
    }

    if (!body.email || !body.email.includes('@')) {
      return ctx.response.status(400).json({ error: 'Email invalide.', statusCode: 400 })
    }

    const targetUser = await User.findBy('email', body.email)
    if (!targetUser) {
      return ctx.response.status(404).json({ error: 'Utilisateur non trouvé.', statusCode: 404 })
    }

    if (targetUser.id === userId) {
      return ctx.response.status(400).json({ error: 'Vous ne pouvez pas vous inviter vous-même.', statusCode: 400 })
    }

    const existing = await Invitation.query()
      .where('boardId', boardId)
      .where('userId', targetUser.id)
      .first()

    if (existing) {
      return ctx.response.status(400).json({ error: 'Invitation déjà en attente.', statusCode: 400 })
    }

    const invitation = await Invitation.create({
      boardId: Number(boardId),
      userId: targetUser.id,
      status: 'pending',
    })

    await invitation.load('user')

    return ctx.response.status(201).json({
      ...invitation.toJSON(),
      email: invitation.user?.email ?? targetUser.email,
      user: invitation.user?.toResponse?.() ?? invitation.user,
    })
  }

  async update(ctx: HttpContext) {
    const userId = (ctx.request as any).userId
    const invitation = await Invitation.find(ctx.request.param('id'))
    if (!invitation) {
      return ctx.response.status(404).json({ error: 'Invitation introuvable.', statusCode: 404 })
    }

    if (invitation.userId !== userId) {
      return ctx.response.status(403).json({ error: 'Vous ne pouvez pas répondre à cette invitation.', statusCode: 403 })
    }

    const body = ctx.request.body() as any
    if (body.status === 'accepted') {
      invitation.status = 'accepted'
      await invitation.save()

      const board = await Board.find(invitation.boardId)
      if (board) {
        const members = board.memberIds || []
        if (!members.includes(userId)) {
          members.push(userId)
          board.memberIds = members
          await board.save()
        }
      }
    } else if (body.status === 'declined') {
      invitation.status = 'declined'
      await invitation.save()
    }

    await invitation.load('user')
    return ctx.response.status(200).json({
      ...invitation.toJSON(),
      user: invitation.user?.toResponse?.() ?? invitation.user,
    })
  }

  async destroy(ctx: HttpContext) {
    const invitation = await Invitation.find(ctx.request.param('id'))
    if (!invitation) {
      return ctx.response.status(404).json({ error: 'Invitation introuvable.', statusCode: 404 })
    }
    await invitation.delete()
    return ctx.response.status(204)
  }

  async removeMember(ctx: HttpContext) {
    const boardId = ctx.request.param('boardId')
    const memberId = ctx.request.param('memberId')
    const userId = (ctx.request as any).userId

    const board = await Board.find(boardId)
    if (!board) {
      return ctx.response.status(404).json({ error: 'Tableau introuvable.', statusCode: 404 })
    }

    if (board.ownerId !== userId) {
      return ctx.response.status(403).json({ error: 'Seul le propriétaire peut retirer un membre.', statusCode: 403 })
    }

    board.memberIds = (board.memberIds || []).filter((id: number) => id !== Number(memberId))
    await board.save()

    return ctx.response.status(204)
  }
}
