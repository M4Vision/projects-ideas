import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, ParseIntPipe } from '@nestjs/common';
import { ColumnsService } from './columns.service';

@Controller()
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Get('boards/:boardId/columns')
  async index(@Param('boardId', ParseIntPipe) boardId: number) {
    return this.columnsService.findByBoard(boardId);
  }

  @Post('boards/:boardId/columns')
  async create(@Param('boardId', ParseIntPipe) boardId: number, @Body() body: any) {
    return this.columnsService.create(boardId, body);
  }

  @Put('columns/reorder')
  async reorder(@Body() body: { id: number; order: number }[]) {
    return this.columnsService.reorder(body);
  }

  @Put('columns/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.columnsService.update(id, body);
  }

  @Delete('columns/:id')
  @HttpCode(204)
  async destroy(@Param('id', ParseIntPipe) id: number) {
    await this.columnsService.delete(id);
  }
}
