import { Controller, Get, Post, Put, Delete, Param, Body, Req, HttpCode } from '@nestjs/common';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  async index(@Req() req: any) {
    return this.boardsService.findAll(req.userId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.boardsService.create(req.userId, body);
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    return this.boardsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: any) {
    return this.boardsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async destroy(@Param('id') id: number, @Req() req: any) {
    await this.boardsService.delete(id, req.userId);
  }
}
