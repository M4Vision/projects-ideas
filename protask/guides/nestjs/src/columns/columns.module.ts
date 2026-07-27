import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { ProjectColumn } from '../entities/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectColumn])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
