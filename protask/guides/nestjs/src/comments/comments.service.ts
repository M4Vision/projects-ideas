import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private comments: Repository<Comment>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async findByCard(cardId: number): Promise<any[]> {
    const comments = await this.comments.find({
      where: { cardId },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
    return comments.map(c => ({
      ...c,
      author: c.author?.toResponse?.() ?? c.author,
    }));
  }

  async create(cardId: number, body: any, userId: number): Promise<any> {
    if (!body.text) throw new BadRequestException('Le texte est requis.');
    const comment = await this.comments.save({
      text: body.text,
      authorId: userId,
      cardId,
    });
    const created = await this.comments.findOne({
      where: { id: comment.id },
      relations: { author: true },
    });
    return { ...created, author: created?.author?.toResponse?.() ?? created?.author };
  }

  async delete(id: number): Promise<void> {
    const comment = await this.comments.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Commentaire introuvable.');
    await this.comments.remove(comment);
  }
}
