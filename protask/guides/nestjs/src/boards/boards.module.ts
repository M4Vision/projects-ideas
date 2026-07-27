import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Board } from '../entities/board.entity';
import { ProjectColumn } from '../entities/column.entity';
import { Card } from '../entities/card.entity';
import { User } from '../entities/user.entity';
import { Label } from '../entities/label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, ProjectColumn, Card, User, Label])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
