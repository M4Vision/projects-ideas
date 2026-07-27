import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Board } from '../entities/board.entity';
import { ProjectColumn } from '../entities/column.entity';
import { Card } from '../entities/card.entity';
import { User } from '../entities/user.entity';
import { Label } from '../entities/label.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boards: Repository<Board>,
    @InjectRepository(ProjectColumn) private columns: Repository<ProjectColumn>,
    @InjectRepository(Card) private cards: Repository<Card>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Label) private labels: Repository<Label>,
  ) {}

  async findAll(userId: number): Promise<any[]> {
    const allBoards = await this.boards.find({ relations: { columns: { cards: true } } });
    return allBoards
      .filter(b => b.ownerId === userId || (b.memberIds || []).includes(userId))
      .map(b => this.formatBoard(b));
  }

  async create(userId: number, body: any): Promise<any> {
    const board = await this.boards.save({
      title: body.title || '',
      ownerId: userId,
      description: body.description || '',
      color: body.color || '#3B82F6',
      categories: body.categories || [],
      memberIds: [],
    });
    const defaultColumns = [
      { title: 'Backlog', orderColumn: 0, boardId: board.id, color: '#6B7280' },
      { title: 'En cours', orderColumn: 1, boardId: board.id, color: '#3B82F6' },
      { title: 'Terminé', orderColumn: 2, boardId: board.id, color: '#10B981' },
    ];
    for (const col of defaultColumns) {
      await this.columns.save(col);
    }
    const created = await this.boards.findOne({ where: { id: board.id }, relations: { columns: true } });
    return this.formatBoard(created!);
  }

  async findOne(id: number): Promise<any> {
    const board = await this.boards.findOne({
      where: { id },
      relations: { columns: { cards: { comments: true } } },
    });
    if (!board) throw new NotFoundException('Board introuvable.');
    return this.formatBoardWithDetails(board);
  }

  async update(id: number, body: any): Promise<any> {
    const board = await this.boards.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Board introuvable.');
    if (body.title !== undefined) board.title = body.title;
    if (body.description !== undefined) board.description = body.description;
    if (body.color !== undefined) board.color = body.color;
    if (body.categories !== undefined) board.categories = body.categories;
    await this.boards.save(board);
    return this.formatBoard(board);
  }

  async delete(id: number, userId: number): Promise<void> {
    const board = await this.boards.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Board introuvable.');
    if (board.ownerId !== userId) throw new ForbiddenException('Seul le propriétaire peut supprimer ce board.');
    await this.boards.remove(board);
  }

  private formatBoard(board: Board): any {
    const data: any = { ...board };
    data.cardCount = (board as any).columns?.reduce((sum: number, c: any) => sum + (c.cards?.length || 0), 0) || 0;
    return data;
  }

  private async formatBoardWithDetails(board: Board): Promise<any> {
    const data: any = { ...board };
    const owner = await this.users.findOne({ where: { id: board.ownerId } });
    const members: any[] = [];
    if (owner) members.push({ user: owner.toResponse(), role: 'owner' });
    for (const id of board.memberIds || []) {
      const u = await this.users.findOne({ where: { id } });
      if (u) members.push({ user: u.toResponse(), role: 'member' });
    }
    data.members = members;
    data.columns = (board as any).columns?.sort((a: any, b: any) => a.orderColumn - b.orderColumn) || [];
    return data;
  }
}
