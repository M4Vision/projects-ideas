import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from '../entities/label.entity';

@Injectable()
export class LabelsService {
  constructor(@InjectRepository(Label) private labels: Repository<Label>) {}

  async findByBoard(boardId: number): Promise<Label[]> {
    return this.labels.find({ where: { boardId } });
  }

  async create(boardId: number, body: any): Promise<Label> {
    if (!body.name) throw new BadRequestException('Le nom est requis.');
    return this.labels.save({
      name: body.name,
      color: body.color || '#3B82F6',
      boardId,
      description: body.description || '',
    });
  }

  async update(id: number, body: any): Promise<Label> {
    const label = await this.labels.findOne({ where: { id } });
    if (!label) throw new NotFoundException('Label introuvable.');
    if (body.name !== undefined) label.name = body.name;
    if (body.color !== undefined) label.color = body.color;
    if (body.description !== undefined) label.description = body.description;
    return this.labels.save(label);
  }

  async delete(id: number): Promise<void> {
    const label = await this.labels.findOne({ where: { id } });
    if (!label) throw new NotFoundException('Label introuvable.');
    await this.labels.remove(label);
  }
}
