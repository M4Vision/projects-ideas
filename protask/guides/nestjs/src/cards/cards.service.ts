import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Card } from '../entities/card.entity';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { ProjectColumn } from '../entities/column.entity';
import { Label } from '../entities/label.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private cards: Repository<Card>,
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(ProjectColumn) private columns: Repository<ProjectColumn>,
    @InjectRepository(Label) private labels: Repository<Label>,
  ) {}

  async findByColumn(columnId: number): Promise<any[]> {
    const cards = await this.cards.find({
      where: { columnId },
      order: { orderColumn: 'ASC' },
      relations: { comments: { author: true }, assignee: true },
    });
    return Promise.all(cards.map(c => this.formatCard(c)));
  }

  async create(columnId: number, body: any): Promise<any> {
    const col = await this.columns.findOne({ where: { id: columnId } });
    if (!col) throw new NotFoundException('Colonne introuvable.');
    if (!body.title) throw new BadRequestException('Le titre est requis.');

    const max = await this.cards.findOne({
      where: { columnId },
      order: { orderColumn: 'DESC' },
    });
    const order = (max?.orderColumn ?? -1) + 1;

    const card = await this.cards.save({
      title: body.title,
      description: body.description || '',
      orderColumn: order,
      columnId,
      dueDate: body.dueDate || null,
      assigneeId: body.assigneeId || null,
      labelIds: body.labelIds || [],
    });
    return this.findOne(card.id);
  }

  async findOne(id: number): Promise<any> {
    const card = await this.cards.findOne({
      where: { id },
      relations: { comments: { author: true }, assignee: true },
    });
    if (!card) throw new NotFoundException('Carte introuvable.');
    return await this.formatCard(card);
  }

  async update(id: number, body: any): Promise<any> {
    const card = await this.cards.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Carte introuvable.');
    if (body.title !== undefined) card.title = body.title;
    if (body.description !== undefined) card.description = body.description;
    if (body.dueDate !== undefined) card.dueDate = body.dueDate;
    if (body.assigneeId !== undefined) card.assigneeId = body.assigneeId;
    if (body.labels !== undefined) card.labelIds = body.labels;
    else if (body.labelIds !== undefined) card.labelIds = body.labelIds;
    await this.cards.save(card);
    return this.formatCard(await this.cards.findOne({ where: { id }, relations: { comments: { author: true }, assignee: true } }));
  }

  async delete(id: number): Promise<void> {
    const card = await this.cards.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Carte introuvable.');
    await this.cards.remove(card);
  }

  async reorder(body: { id: number; order: number }[]): Promise<any[]> {
    const ids = body.map(b => b.id);
    const cards = await this.cards.find({ where: { id: In(ids) } });
    for (const card of cards) {
      const found = body.find(b => b.id === card.id);
      if (found) card.orderColumn = found.order;
    }
    await this.cards.save(cards);
    return Promise.all(cards.map(c => this.formatCard(c)));
  }

  async move(id: number, body: any): Promise<any> {
    const card = await this.cards.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Carte introuvable.');
    if (body.columnId !== undefined) card.columnId = body.columnId;
    if (body.order !== undefined) card.orderColumn = body.order;
    await this.cards.save(card);
    return await this.findOne(id);
  }

  private async formatCard(card: any): Promise<any> {
    const data: any = { ...card };
    if (data.assignee) data.assignee = data.assignee.toResponse();
    if (data.comments) {
      data.comments = data.comments.map((c: any) => ({
        ...c,
        author: c.author?.toResponse?.() ?? c.author,
      }));
    }
    if (data.labelIds && data.labelIds.length > 0) {
      data.labels = await this.labels.find({ where: { id: In(data.labelIds) } });
    } else {
      data.labels = [];
    }
    data.order = data.orderColumn;
    delete data.orderColumn;
    return data;
  }
}
