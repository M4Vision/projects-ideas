import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Invitation } from '../entities/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation])],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
