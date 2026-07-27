import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../entities/user.entity';
import { Board } from '../entities/board.entity';
import { ProjectColumn } from '../entities/column.entity';
import { Card } from '../entities/card.entity';
import { Label } from '../entities/label.entity';
import { Comment } from '../entities/comment.entity';
import { Invitation } from '../entities/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Board, ProjectColumn, Card, Label, Comment, Invitation])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
