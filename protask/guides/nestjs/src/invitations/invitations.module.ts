import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Invitation } from '../entities/invitation.entity';
import { Board } from '../entities/board.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, Board, User])],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
