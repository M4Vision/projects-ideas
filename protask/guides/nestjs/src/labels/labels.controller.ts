import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { LabelsService } from './labels.service';

@Controller()
export class LabelsController {
  constructor(private labelsService: LabelsService) {}

  @Get('boards/:boardId/labels')
  async findByBoard(@Param('boardId') boardId: number) {
    return this.labelsService.findByBoard(boardId);
  }

  @Post('boards/:boardId/labels')
  async create(@Param('boardId') boardId: number, @Body() body: any) {
    return this.labelsService.create(boardId, body);
  }

  @Patch('labels/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    return this.labelsService.update(id, body);
  }

  @Delete('labels/:id')
  @HttpCode(204)
  async delete(@Param('id') id: number) {
    await this.labelsService.delete(id);
  }
}
