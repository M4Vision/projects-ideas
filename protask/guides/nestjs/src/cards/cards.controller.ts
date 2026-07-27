import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller()
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Get('columns/:columnId/cards')
  async findByColumn(@Param('columnId') columnId: number) {
    return this.cardsService.findByColumn(columnId);
  }

  @Post('columns/:columnId/cards')
  async create(@Param('columnId') columnId: number, @Body() body: any) {
    return this.cardsService.create(columnId, body);
  }

  @Get('cards/:id')
  async findOne(@Param('id') id: number) {
    return this.cardsService.findOne(id);
  }

  @Patch('cards/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    return this.cardsService.update(id, body);
  }

  @Delete('cards/:id')
  @HttpCode(204)
  async delete(@Param('id') id: number) {
    await this.cardsService.delete(id);
  }

  @Post('cards/reorder')
  async reorder(@Body() body: any) {
    return this.cardsService.reorder(body);
  }

  @Post('cards/:id/move')
  async move(@Param('id') id: number, @Body() body: any) {
    return this.cardsService.move(id, body);
  }
}
