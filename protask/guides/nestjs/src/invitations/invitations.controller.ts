import { Controller, Get, Post, Patch, Delete, Param, Body, Req, HttpCode } from '@nestjs/common';
import { InvitationsService } from './invitations.service';

@Controller()
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Get('boards/:boardId/invitations')
  async findByBoard(@Param('boardId') boardId: number) {
    return this.invitationsService.findByBoard(boardId);
  }

  @Post('boards/:boardId/invitations')
  async create(@Param('boardId') boardId: number, @Body() body: any, @Req() req: any) {
    return this.invitationsService.create(boardId, body, req.userId);
  }

  @Patch('invitations/:id')
  async update(@Param('id') id: number, @Body() body: any, @Req() req: any) {
    return this.invitationsService.update(id, body, req.userId);
  }

  @Delete('invitations/:id')
  @HttpCode(204)
  async delete(@Param('id') id: number) {
    await this.invitationsService.delete(id);
  }

  @Delete('boards/:boardId/members/:memberId')
  @HttpCode(204)
  async removeMember(@Param('boardId') boardId: number, @Param('memberId') memberId: number, @Req() req: any) {
    await this.invitationsService.removeMember(boardId, memberId, req.userId);
  }
}
