import { Controller, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SeedService } from '../seed/seed.service';
import { Public } from '../auth/public.decorator';

@Controller()
export class ResetController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private seedService: SeedService,
  ) {}

  @Public()
  @Post('_reset')
  async reset() {
    await this.dataSource.query('PRAGMA foreign_keys = OFF');
    await this.dataSource.query('DELETE FROM comment');
    await this.dataSource.query('DELETE FROM card');
    await this.dataSource.query('DELETE FROM label');
    await this.dataSource.query('DELETE FROM invitation');
    await this.dataSource.query('DELETE FROM project_columns');
    await this.dataSource.query('DELETE FROM board');
    await this.dataSource.query('DELETE FROM user');
    await this.dataSource.query('PRAGMA foreign_keys = ON');
    await this.dataSource.query("DELETE FROM sqlite_sequence");

    await this.seedService.seed();
    return { success: true };
  }
}
