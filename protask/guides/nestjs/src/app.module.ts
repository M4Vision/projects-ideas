import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { MockAuthGuard } from './auth/mock-auth.guard';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';
import { LabelsModule } from './labels/labels.module';
import { CommentsModule } from './comments/comments.module';
import { InvitationsModule } from './invitations/invitations.module';
import { ResetModule } from './reset/reset.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data.db',
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    SeedModule,
    AuthModule,
    UsersModule,
    BoardsModule,
    ColumnsModule,
    CardsModule,
    LabelsModule,
    CommentsModule,
    InvitationsModule,
    ResetModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: MockAuthGuard },
  ],
})
export class AppModule {}
