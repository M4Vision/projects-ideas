import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { Label } from '../entities/label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Label])],
  controllers: [LabelsController],
  providers: [LabelsService],
})
export class LabelsModule {}
