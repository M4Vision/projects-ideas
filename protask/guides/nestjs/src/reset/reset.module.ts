import { Module } from '@nestjs/common';
import { ResetController } from './reset.controller';
import { SeedModule } from '../seed/seed.module';

@Module({
  imports: [SeedModule],
  controllers: [ResetController],
})
export class ResetModule {}
