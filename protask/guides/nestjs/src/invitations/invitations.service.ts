import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from '../entities/invitation.entity';
import { Board } from '../entities/board.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation) private invitations: Repository<Invitation>,
    @InjectRepository(Board) private boards: Repository<Board>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async findByBoard(boardId: number): Promise<Invitation[]> {
    return this.invitations.find({ where: { boardId } });
  }

  async create(boardId: number, body: any, userId: number): Promise<Invitation> {
    const board = await this.boards.findOne({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board introuvable.');
    if (!body.email || !body.email.includes('@')) throw new BadRequestException('Email invalide.');

    const existing = await this.invitations.findOne({ where: { boardId, email: body.email } });
    if (existing) throw new BadRequestException('Une invitation existe déjà pour cet email.');

    return this.invitations.save({
      boardId,
      email: body.email,
      invitedById: userId,
      status: 'pending',
    });
  }

  async update(id: number, body: any, userId: number): Promise<any> {
    const invitation = await this.invitations.findOne({ where: { id } });
    if (!invitation) throw new NotFoundException('Invitation introuvable.');

    const board = await this.boards.findOne({ where: { id: invitation.boardId } });
    if (!board) throw new NotFoundException('Board introuvable.');

    if (body.status === 'accepted') {
      const memberIds = board.memberIds || [];
      if (!memberIds.includes(userId)) {
        memberIds.push(userId);
        board.memberIds = memberIds;
        await this.boards.save(board);
      }
      invitation.status = 'accepted';
    } else if (body.status) {
      invitation.status = body.status;
    }

    return this.invitations.save(invitation);
  }

  async delete(id: number): Promise<void> {
    const invitation = await this.invitations.findOne({ where: { id } });
    if (!invitation) throw new NotFoundException('Invitation introuvable.');
    await this.invitations.remove(invitation);
  }

  async removeMember(boardId: number, memberId: number, userId: number): Promise<void> {
    const board = await this.boards.findOne({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board introuvable.');
    if (board.ownerId !== userId) throw new ForbiddenException('Seul le propriétaire peut retirer un membre.');
    board.memberIds = (board.memberIds || []).filter((id: number) => id !== memberId);
    await this.boards.save(board);
  }
}
