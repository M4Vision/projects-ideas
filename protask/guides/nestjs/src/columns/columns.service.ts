import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProjectColumn } from '../entities/column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ProjectColumn) private columns: Repository<ProjectColumn>,
  ) {}

  async findByBoard(boardId: number): Promise<ProjectColumn[]> {
    return this.columns.find({
      where: { boardId },
      order: { orderColumn: 'ASC' },
    });
  }

  async create(boardId: number, body: any): Promise<ProjectColumn> {
    const max = await this.columns.findOne({
      where: { boardId },
      order: { orderColumn: 'DESC' },
    });
    const order = (max?.orderColumn ?? -1) + 1;
    return this.columns.save({
      title: body.title || '',
      boardId,
      orderColumn: order,
      color: body.color || '#6B7280',
    });
  }

  async reorder(body: { id: number; order: number }[]): Promise<ProjectColumn[]> {
    const ids = body.map(b => b.id);
    const cols = await this.columns.find({ where: { id: In(ids) } });
    for (const col of cols) {
      const found = body.find(b => b.id === col.id);
      if (found) col.orderColumn = found.order;
    }
    return this.columns.save(cols);
  }

  async update(id: number, body: any): Promise<ProjectColumn> {
    const col = await this.columns.findOne({ where: { id } });
    if (!col) throw new NotFoundException('Colonne introuvable.');
    if (body.title !== undefined) col.title = body.title;
    if (body.color !== undefined) col.color = body.color;
    if (body.description !== undefined) col.description = body.description;
    return this.columns.save(col);
  }

  async delete(id: number): Promise<void> {
    const col = await this.columns.findOne({ where: { id } });
    if (!col) throw new NotFoundException('Colonne introuvable.');
    await this.columns.remove(col);
  }
}
