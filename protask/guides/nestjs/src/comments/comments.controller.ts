import { Controller, Get, Post, Delete, Param, Body, Req, HttpCode } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('cards/:cardId/comments')
  async findByCard(@Param('cardId') cardId: number) {
    return this.commentsService.findByCard(cardId);
  }

  @Post('cards/:cardId/comments')
  async create(@Param('cardId') cardId: number, @Body() body: any, @Req() req: any) {
    return this.commentsService.create(cardId, body, req.userId);
  }

  @Delete('comments/:id')
  @HttpCode(204)
  async delete(@Param('id') id: number) {
    await this.commentsService.delete(id);
  }
}
