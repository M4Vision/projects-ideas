import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card } from '../entities/card.entity';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { ProjectColumn } from '../entities/column.entity';
import { Label } from '../entities/label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Comment, User, ProjectColumn, Label])],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
