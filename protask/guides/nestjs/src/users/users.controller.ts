import { Controller, Get, Put, Body, Param, NotFoundException, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user.toResponse();
  }

  @Put('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    return this.usersService.update(req.userId, body);
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user.toResponse();
  }
}
