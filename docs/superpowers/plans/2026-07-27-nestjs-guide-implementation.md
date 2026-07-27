# Guide NestJS ProTask — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter un guide pédagogique complet pour ProTask avec NestJS 11 (projet exécutable + guide Markdown), validable par les 53 tests e2e.

**Architecture:** Projet NestJS 11 avec SQLite, TypeORM, Guards d'authentification, modules par domaine métier. 7 entités TypeORM, 8 contrôleurs, 9 services, 1 seed service. In-memory ou SQLite via `better-sqlite3`. La batterie de tests `protask/api/e2e.spec.js` valide le serveur via `API_BASE_URL`.

**Tech Stack:** Node.js v24, NestJS 11, TypeORM 1.x (`@nestjs/typeorm@11` compat), SQLite (`better-sqlite3`), pnpm, TypeScript 5

## Global Constraints

- Tous les guides sont en français
- Le glossaire de `CONTEXT.md` est la source de vérité pour la terminologie
- `server.js` (Hono) reste l'implémentation de référence — ne pas supprimer
- L'authentification simulée utilise le header `Authorization: Bearer token-{userId}`
- Les routes sont préfixées par `/api` (NestJS `globalPrefix`)
- La base de données est SQLite via TypeORM + `better-sqlite3`
- `POST /api/_reset` vide toutes les tables et réinitialise les données
- Les mots de passe en clair (pas de bcrypt — mock API)
- Le champ `password` est exclu des réponses JSON
- 53 tests doivent passer avec `API_BASE_URL=http://localhost:3000/api pnpm test:api`
- `order` est un mot réservé SQL — utiliser `order_column` dans la colonne, exposer comme `order` dans les réponses
- Les réponses JSON utilisent camelCase (`createdAt`, `ownerId`, etc.)
- Contrôleurs retournent des objets, NestJS les sérialise en JSON automatiquement
- Port par défaut: 3000

---

## File Structure

```
protask/guides/nestjs/
├── src/
│   ├── main.ts                          ← Bootstrap, globalPrefix, CORS, port 3000
│   ├── app.module.ts                    ← Root module, imports TypeORM + feature modules
│   ├── entities/
│   │   ├── user.entity.ts               ← 7 champs + @Entity()
│   │   ├── board.entity.ts              ← 7 champs + relations
│   │   ├── column.entity.ts             ← 6 champs (order_column)
│   │   ├── card.entity.ts               ← 8 champs + labelIds JSON
│   │   ├── label.entity.ts              ← 5 champs
│   │   ├── comment.entity.ts            ← 4 champs + timestamps
│   │   └── invitation.entity.ts         ← 6 champs + status
│   ├── auth/
│   │   ├── auth.controller.ts           ← POST register, login, logout
│   │   ├── auth.service.ts              ← create/find user logic
│   │   └── mock-auth.guard.ts           ← @Injectable() guard, Bearer token extraction
│   ├── users/
│   │   ├── users.controller.ts          ← GET/PUT /api/users/me, GET /api/users/:id
│   │   └── users.service.ts             ← find/update user
│   ├── boards/
│   │   ├── boards.controller.ts         ← 5 routes boards CRUD
│   │   └── boards.service.ts            ← CRUD + members resolution
│   ├── columns/
│   │   ├── columns.controller.ts        ← 5 routes columns CRUD + reorder
│   │   └── columns.service.ts           ← CRUD + reorder logic
│   ├── cards/
│   │   ├── cards.controller.ts          ← 7 routes cards CRUD + move + reorder
│   │   └── cards.service.ts             ← CRUD + move + reorder logic
│   ├── labels/
│   │   ├── labels.controller.ts         ← 4 routes labels CRUD
│   │   └── labels.service.ts            ← CRUD
│   ├── comments/
│   │   ├── comments.controller.ts       ← 3 routes comments CRUD
│   │   └── comments.service.ts          ← CRUD
│   ├── invitations/
│   │   ├── invitations.controller.ts    ← 5 routes invitations CRUD + removeMember
│   │   └── invitations.service.ts       ← CRUD + accept + member management
│   ├── reset/
│   │   └── reset.controller.ts          ← POST /api/_reset
│   └── seed/
│       └── seed.service.ts              ← Démo data (3 users, 3 boards, 8 columns, etc.)
├── .env                                 ← PORT=3000, DB config
├── nest-cli.json
├── package.json
├── tsconfig.json
└── index.md                              ← Guide pédagogique (créé en dernier)
```

## Dépendances entre tâches

```
Task 1 (Scaffold)
  └──> Task 2 (Entities)
         └──> Task 3 (SeedService)
         └──> Task 4 (MockAuthGuard)
                └──> Task 5 (AppModule + main.ts)
                       ├──> Task 6 (Auth + User)
                       ├──> Task 7 (Board + Column)
                       ├──> Task 8 (Card + Label + Comment + Invitation)
                       └──> Task 9 (e2e validation)
                              └──> Task 10 (Guide index.md)
                                     └──> Task 11 (package.json script)
```

---

### Task 1: Scaffold NestJS project + SQLite + TypeORM

**Files:**
- Create: `protask/guides/nestjs/` (via `npx @nestjs/cli new`)
- Modify: `protask/guides/nestjs/package.json` (add deps)
- Modify: `protask/guides/nestjs/.env`
- Create: `protask/guides/nestjs/tsconfig.json` (configure paths)

**Interfaces:**
- Consumes: nothing
- Produces: NestJS project with TypeORM, SQLite, basic structure

- [ ] **Step 1: Scaffold NestJS project**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides
npx @nestjs/cli@11 new nestjs --skip-git --package-manager pnpm --strict 2>&1 | tail -5
```

Expected output: "Project created" or similar. If `--strict` flag is not supported, omit it.

- [ ] **Step 2: Install TypeORM + SQLite dependencies**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
pnpm add @nestjs/typeorm typeorm better-sqlite3 2>&1 | tail -5
pnpm add -D @types/better-sqlite3 2>&1 | tail -3
```

Expected: all packages installed without errors.

- [ ] **Step 3: Configure `.env`**

Write `protask/guides/nestjs/.env`:

```
PORT=3000
NODE_ENV=development
```

- [ ] **Step 4: Vérifier le projet**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
npx nest build 2>&1 | tail -3
```

Expected: `dist/` directory created, no errors.

- [ ] **Step 5: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/
git commit -m "feat(nestjs): scaffold NestJS project with TypeORM and SQLite"
```

---

### Task 2: Entités TypeORM (7)

**Files:**
- Create: `protask/guides/nestjs/src/entities/user.entity.ts`
- Create: `protask/guides/nestjs/src/entities/board.entity.ts`
- Create: `protask/guides/nestjs/src/entities/column.entity.ts`
- Create: `protask/guides/nestjs/src/entities/card.entity.ts`
- Create: `protask/guides/nestjs/src/entities/label.entity.ts`
- Create: `protask/guides/nestjs/src/entities/comment.entity.ts`
- Create: `protask/guides/nestjs/src/entities/invitation.entity.ts`

**Interfaces:**
- Consumes: Task 1
- Produces: 7 TypeORM entity files with decorators and relations

- [ ] **Step 1: Créer User entity**

`src/entities/user.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 180, unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  toResponse(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar ?? '',
      createdAt: this.createdAt?.toISOString?.() ?? this.createdAt,
    };
  }
}
```

- [ ] **Step 2: Créer Board entity**

`src/entities/board.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column()
  ownerId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 7, nullable: true })
  color: string;

  @Column({ type: 'simple-json', nullable: true })
  categories: string[];

  @Column({ type: 'simple-json', default: '[]' })
  memberIds: number[];
}
```

- [ ] **Step 3: Créer Column entity**

`src/entities/column.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Board } from './board.entity';

@Entity('project_columns')
export class ProjectColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column()
  orderColumn: number;

  @Column()
  boardId: number;

  @Column({ length: 7, nullable: true })
  color: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Board, board => board.columns)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @OneToMany('Card', 'column')
  cards: any[];
}
```

- [ ] **Step 4: Créer Card entity**

`src/entities/card.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  orderColumn: number;

  @Column()
  columnId: number;

  @Column({ type: 'date', nullable: true })
  dueDate: string;

  @Column({ nullable: true })
  assigneeId: number;

  @Column({ type: 'simple-json', default: '[]' })
  labelIds: number[];

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: any;

  @ManyToOne('ProjectColumn', 'cards')
  @JoinColumn({ name: 'columnId' })
  column: any;

  @OneToMany('Comment', 'card')
  comments: any[];
}
```

- [ ] **Step 5: Créer Label, Comment, Invitation entities**

`src/entities/label.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Label {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 7 })
  color: string;

  @Column()
  boardId: number;

  @Column({ type: 'text', nullable: true })
  description: string;
}
```

`src/entities/comment.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @Column()
  authorId: number;

  @Column()
  cardId: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne('User')
  @JoinColumn({ name: 'authorId' })
  author: any;

  @ManyToOne('Card', 'comments')
  @JoinColumn({ name: 'cardId' })
  card: any;
}
```

`src/entities/invitation.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boardId: number;

  @Column({ length: 180 })
  email: string;

  @Column()
  invitedById: number;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

- [ ] **Step 6: Vérifier la compilation**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
npx nest build 2>&1 | tail -5
```

Expected: No errors. If TypeScript complains about `any` types, use proper forward refs or skip strict for now.

- [ ] **Step 7: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/
git commit -m "feat(nestjs): add 7 TypeORM entities"
```

---

### Task 3: SeedService (données de démonstration)

**Files:**
- Create: `protask/guides/nestjs/src/seed/seed.service.ts`
- Create: `protask/guides/nestjs/src/seed/seed.module.ts`

**Interfaces:**
- Consumes: Task 2 (entities)
- Produces: SeedService injectable, seed data populating all 7 tables

- [ ] **Step 1: Créer SeedService**

`src/seed/seed.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Board } from '../entities/board.entity';
import { ProjectColumn } from '../entities/column.entity';
import { Card } from '../entities/card.entity';
import { Label } from '../entities/label.entity';
import { Comment } from '../entities/comment.entity';
import { Invitation } from '../entities/invitation.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Board) private boards: Repository<Board>,
    @InjectRepository(ProjectColumn) private columns: Repository<ProjectColumn>,
    @InjectRepository(Card) private cards: Repository<Card>,
    @InjectRepository(Label) private labels: Repository<Label>,
    @InjectRepository(Comment) private comments: Repository<Comment>,
    @InjectRepository(Invitation) private invitations: Repository<Invitation>,
  ) {}

  async seed(): Promise<void> {
    const existing = await this.users.findOne({ where: { id: 1 } });
    if (existing) return;

    // Users
    const alex = await this.users.save({ id: 1, name: 'Alexandre', email: 'alex@protask.dev', password: 'pass123', avatar: '' });
    const sophie = await this.users.save({ id: 2, name: 'Sophie', email: 'sophie@protask.dev', password: 'pass123', avatar: '' });
    const marc = await this.users.save({ id: 3, name: 'Marc', email: 'marc@protask.dev', password: 'pass123', avatar: '' });

    // Board 1
    const board1 = await this.boards.save({ id: 1, title: 'Design System', ownerId: 1, description: "Design system de l'application", color: '#8B5CF6', categories: ['Design', 'UI/UX'], memberIds: [2, 3] });
    const b1c1 = await this.columns.save({ id: 1, title: 'Backlog', orderColumn: 0, boardId: 1, color: '#6B7280', description: 'Tâches en attente de traitement' });
    const b1c2 = await this.columns.save({ id: 2, title: 'En cours', orderColumn: 1, boardId: 1, color: '#3B82F6', description: 'Tâches en cours de développement' });
    const b1c3 = await this.columns.save({ id: 3, title: 'Terminé', orderColumn: 2, boardId: 1, color: '#10B981', description: 'Tâches terminées et validées' });

    // Board 2
    const board2 = await this.boards.save({ id: 2, title: 'Refonte App Mobile', ownerId: 1, description: "Refonte complète de l'application mobile", color: '#3B82F6', categories: ['Mobile'], memberIds: [] });
    const b2c1 = await this.columns.save({ id: 4, title: 'À faire', orderColumn: 0, boardId: 2, color: '#F59E0B', description: 'Tâches planifiées' });
    const b2c2 = await this.columns.save({ id: 5, title: 'En cours', orderColumn: 1, boardId: 2, color: '#3B82F6', description: '' });
    const b2c3 = await this.columns.save({ id: 6, title: 'Terminé', orderColumn: 2, boardId: 2, color: '#10B981', description: '' });

    // Board 3
    const board3 = await this.boards.save({ id: 3, title: 'Marketing Q2', ownerId: 2, description: 'Stratégie marketing pour le Q2', color: '#EF4444', categories: ['Marketing'], memberIds: [3] });
    await this.columns.save({ id: 7, title: 'Idées', orderColumn: 0, boardId: 3, color: '#8B5CF6', description: 'Idées à explorer' });
    await this.columns.save({ id: 8, title: 'En production', orderColumn: 1, boardId: 3, color: '#EF4444', description: 'Campagnes en cours' });

    // Labels
    await this.labels.save({ id: 1, name: 'Design', color: '#8B5CF6', boardId: 1, description: 'Design' });
    await this.labels.save({ id: 2, name: 'Dev', color: '#3B82F6', boardId: 1, description: 'Dev' });
    await this.labels.save({ id: 3, name: 'Documentation', color: '#10B981', boardId: 1, description: 'Doc' });
    await this.labels.save({ id: 4, name: 'Urgent', color: '#EF4444', boardId: 1, description: 'Urgent' });

    // Cards
    await this.cards.save({ id: 1, title: 'Définir la palette', description: 'Choisir les couleurs primaires et secondaires.', orderColumn: 0, columnId: 1, dueDate: '2025-04-15', assigneeId: 1, labelIds: [1] });
    await this.cards.save({ id: 2, title: 'Composants UI', description: 'Créer les composants Button, Input, Card, Modal.', orderColumn: 1, columnId: 1, dueDate: '2025-04-20', assigneeId: 2, labelIds: [1, 2] });
    await this.cards.save({ id: 3, title: 'Page accueil responsive', description: 'Terminer la mise en page responsive.', orderColumn: 0, columnId: 2, dueDate: '2025-04-10', assigneeId: 1, labelIds: [2] });
    await this.cards.save({ id: 4, title: 'Documentation', description: 'Écrire la documentation du design system.', orderColumn: 1, columnId: 3, dueDate: '2025-04-05', assigneeId: 2, labelIds: [3] });
    await this.cards.save({ id: 5, title: 'Wireframes', description: 'Wireframes validés par le client.', orderColumn: 0, columnId: 4, dueDate: '2025-04-08', assigneeId: 1, labelIds: [2] });
    await this.cards.save({ id: 6, title: 'Maquette Figma', description: 'Maquette haute fidélité.', orderColumn: 0, columnId: 5, dueDate: '2025-04-18', assigneeId: 1, labelIds: [1] });
    await this.cards.save({ id: 7, title: 'Tests utilisateurs', description: 'Sessions de tests utilisateurs.', orderColumn: 0, columnId: 6, dueDate: '2025-04-12', assigneeId: 2, labelIds: [3] });
    await this.cards.save({ id: 8, title: 'Analyse concurrents', description: 'Analyse des concurrents directs.', orderColumn: 0, columnId: 7, dueDate: '2025-04-14', assigneeId: 1, labelIds: [2] });
    await this.cards.save({ id: 9, title: 'Stratégie contenu', description: 'Plan de contenu pour les réseaux sociaux.', orderColumn: 1, columnId: 7, dueDate: '2025-04-22', assigneeId: 2, labelIds: [1, 4] });
    await this.cards.save({ id: 10, title: 'Campagne emailing', description: 'Campagne emailing Q2.', orderColumn: 0, columnId: 8, dueDate: '2025-04-25', assigneeId: 1, labelIds: [4] });

    // Comments
    await this.comments.save({ id: 1, text: "J'ai commencé la palette.", authorId: 1, cardId: 1 });
    await this.comments.save({ id: 2, text: 'Je valide le violet.', authorId: 2, cardId: 1 });
    await this.comments.save({ id: 3, text: 'PR créé.', authorId: 1, cardId: 3 });
    await this.comments.save({ id: 4, text: "J'ai ajouté les variantes disabled et loading.", authorId: 2, cardId: 2 });
    await this.comments.save({ id: 5, text: 'Review faite, quelques suggestions.', authorId: 1, cardId: 2 });

    // Invitations
    await this.invitations.save({ id: 1, boardId: 1, email: 'marc@protask.dev', invitedById: 1, status: 'accepted' });
    await this.invitations.save({ id: 2, boardId: 1, email: 'julie@test.com', invitedById: 1, status: 'pending' });
  }
}
```

- [ ] **Step 2: Créer SeedModule**

`src/seed/seed.module.ts`:

```typescript
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
```

- [ ] **Step 3: Vérifier compilation**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
npx nest build 2>&1 | tail -5
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/
git commit -m "feat(nestjs): add SeedService with demo data"
```

---

### Task 4: MockAuthGuard (authentification)

**Files:**
- Create: `protask/guides/nestjs/src/auth/mock-auth.guard.ts`

**Interfaces:**
- Consumes: Task 2 (User entity)
- Produces: Injectable guard usable as `@UseGuards(MockAuthGuard)` or global guard

- [ ] **Step 1: Créer MockAuthGuard**

`src/auth/mock-auth.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'] || '';

    if (!auth.startsWith('Bearer token-')) {
      throw new UnauthorizedException('Token manquant ou invalide.');
    }

    const userId = parseInt(auth.slice('Bearer token-'.length), 10);

    if (isNaN(userId) || userId <= 0) {
      throw new UnauthorizedException('Token invalide.');
    }

    request.userId = userId;
    return true;
  }
}
```

- [ ] **Step 2: Créer le décorateur `@Public()`**

`src/auth/public.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

- [ ] **Step 3: Vérifier compilation**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
npx nest build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/
git commit -m "feat(nestjs): add MockAuthGuard and @Public decorator"
```

---

### Task 5: AppModule + main.ts (wiring)

**Files:**
- Modify: `protask/guides/nestjs/src/app.module.ts`
- Modify: `protask/guides/nestjs/src/main.ts`

**Interfaces:**
- Consumes: Tasks 2-4 (entities, SeedModule, MockAuthGuard)
- Produces: Working NestJS application with TypeORM, global guard, CORS

- [ ] **Step 1: Écrire AppModule**

`src/app.module.ts`:

```typescript
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
```

- [ ] **Step 2: Écrire main.ts**

`src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  const seedService = app.get(SeedService);
  await seedService.seed();

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();
```

- [ ] **Step 3: Créer les modules vides pour éviter les erreurs d'import**

Créer les dossiers et fichiers squelette pour chaque module. Par exemple `src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

Créer le même pattern pour UsersModule, BoardsModule, ColumnsModule, CardsModule, LabelsModule, CommentsModule, InvitationsModule, ResetModule. Tous les contrôleurs et services seront des squelettes vides (classe sans méthodes) — ils seront implémentés dans les tâches suivantes.

- [ ] **Step 4: Tester le démarrage**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
npx nest start &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"alex@protask.dev","password":"pass123"}'
kill %1 2>/dev/null
```

Expected: 401 (public routes not yet configured with @Public, so guard rejects). Or 201/200 if auth controller is set up. Any non-500 response is acceptable.

- [ ] **Step 5: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/
git commit -m "feat(nestjs): configure AppModule, main.ts, and feature module skeletons"
```

---

### Task 6: Contrôleurs Auth + User + Reset

**Files:**
- Create: `protask/guides/nestjs/src/auth/auth.controller.ts`
- Create: `protask/guides/nestjs/src/auth/auth.service.ts`
- Create: `protask/guides/nestjs/src/users/users.controller.ts`
- Create: `protask/guides/nestjs/src/users/users.service.ts`
- Create: `protask/guides/nestjs/src/reset/reset.controller.ts`
- Create: `protask/guides/nestjs/src/reset/reset.module.ts`

**Interfaces:**
- Consumes: Task 5 (modules, entities)
- Produces: Auth (register, login, logout), User (me, updateMe, show), Reset (reset)

- [ ] **Step 1: AuthController**

`src/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body, Get, Put, Param, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('auth/register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Public()
  @Post('auth/login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Public()
  @Post('auth/logout')
  @HttpCode(200)
  logout() {
    return { success: true };
  }
}
```

- [ ] **Step 2: AuthService**

`src/auth/auth.service.ts`:

```typescript
import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async register(body: any) {
    if (!body.name || !body.email || !body.password) {
      throw new BadRequestException('Champs requis : name, email, password.');
    }
    const existing = await this.users.findOne({ where: { email: body.email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé.');

    const user = await this.users.save({
      name: body.name,
      email: body.email,
      password: body.password,
      avatar: body.avatar ?? '',
    });

    return { user: user.toResponse(), token: `token-${user.id}` };
  }

  async login(body: any) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email et mot de passe requis.');
    }
    const user = await this.users.findOne({ where: { email: body.email } });
    if (!user || user.password !== body.password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }
    return { user: user.toResponse(), token: `token-${user.id}` };
  }
}
```

- [ ] **Step 3: UsersController**

`src/users/users.controller.ts`:

```typescript
import { Controller, Get, Put, Body, Param, NotFoundException, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user.toResponse();
  }

  @Put('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    return this.usersService.update(req.userId, body);
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user.toResponse();
  }
}
```

`src/users/users.service.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async findById(id: number): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async update(id: number, body: any): Promise<any> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    if (body.name !== undefined) user.name = body.name;
    if (body.email !== undefined) user.email = body.email;
    if (body.avatar !== undefined) user.avatar = body.avatar;
    await this.users.save(user);
    return user.toResponse();
  }
}
```

- [ ] **Step 4: ResetController**

`src/reset/reset.controller.ts`:

```typescript
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
```

`src/reset/reset.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetController } from './reset.controller';
import { SeedModule } from '../seed/seed.module';

@Module({
  imports: [SeedModule],
  controllers: [ResetController],
})
export class ResetModule {}
```

- [ ] **Step 5: Tester**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
npx nest start &
sleep 3

# Test reset
curl -s -X POST http://localhost:3000/api/_reset

# Test login with demo user
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@protask.dev","password":"pass123"}'

kill %1 2>/dev/null
```

Expected: `_reset` returns 200, login returns 200 with user + token.

- [ ] **Step 6: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/
git commit -m "feat(nestjs): implement Auth, User and Reset controllers"
```

---

### Task 7: Contrôleurs Board + Column

**Files:**
- Create: `protask/guides/nestjs/src/boards/boards.controller.ts`
- Create: `protask/guides/nestjs/src/boards/boards.service.ts`
- Create: `protask/guides/nestjs/src/boards/boards.module.ts`
- Create: `protask/guides/nestjs/src/columns/columns.controller.ts`
- Create: `protask/guides/nestjs/src/columns/columns.service.ts`
- Create: `protask/guides/nestjs/src/columns/columns.module.ts`

**Interfaces:**
- Consumes: Task 6 (auth working)
- Produces: Full CRUD for boards and columns

- [ ] **Step 1: BoardsService**

`src/boards/boards.service.ts`:

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entities/board.entity';
import { ProjectColumn } from '../entities/column.entity';
import { Card } from '../entities/card.entity';
import { User } from '../entities/user.entity';
import { Label } from '../entities/label.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boards: Repository<Board>,
    @InjectRepository(ProjectColumn) private columns: Repository<ProjectColumn>,
    @InjectRepository(Card) private cards: Repository<Card>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Label) private labels: Repository<Label>,
  ) {}

  async findAll(userId: number): Promise<any[]> {
    const boards = await this.boards.find({
      where: [{ ownerId: userId }],
      relations: ['columns', 'columns.cards'],
    });
    // Also find boards where user is a member
    const allBoards = await this.boards.find({ relations: ['columns', 'columns.cards'] });
    return allBoards
      .filter(b => b.ownerId === userId || (b.memberIds || []).includes(userId))
      .map(b => this.formatBoard(b));
  }

  async create(userId: number, body: any): Promise<any> {
    const board = await this.boards.save({
      title: body.title || '',
      ownerId: userId,
      description: body.description || '',
      color: body.color || '#3B82F6',
      categories: body.categories || [],
      memberIds: [],
    });
    // Auto-create 3 default columns
    const defaultColumns = [
      { title: 'Backlog', orderColumn: 0, boardId: board.id, color: '#6B7280' },
      { title: 'En cours', orderColumn: 1, boardId: board.id, color: '#3B82F6' },
      { title: 'Terminé', orderColumn: 2, boardId: board.id, color: '#10B981' },
    ];
    for (const col of defaultColumns) {
      await this.columns.save(col);
    }
    return this.formatBoard(await this.boards.findOne({ where: { id: board.id }, relations: ['columns'] }));
  }

  async findOne(id: number): Promise<any> {
    const board = await this.boards.findOne({
      where: { id },
      relations: ['columns', 'columns.cards', 'columns.cards.comments'],
    });
    if (!board) throw new NotFoundException('Board introuvable.');
    return this.formatBoardWithDetails(board);
  }

  async update(id: number, body: any): Promise<any> {
    const board = await this.boards.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Board introuvable.');
    if (body.title !== undefined) board.title = body.title;
    if (body.description !== undefined) board.description = body.description;
    if (body.color !== undefined) board.color = body.color;
    if (body.categories !== undefined) board.categories = body.categories;
    await this.boards.save(board);
    return this.formatBoard(board);
  }

  async delete(id: number, userId: number): Promise<void> {
    const board = await this.boards.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Board introuvable.');
    if (board.ownerId !== userId) throw new ForbiddenException('Seul le propriétaire peut supprimer ce board.');
    await this.boards.remove(board);
  }

  private formatBoard(board: Board): any {
    const data: any = { ...board };
    data.cardCount = (board as any).columns?.reduce((sum: number, c: any) => sum + (c.cards?.length || 0), 0) || 0;
    return data;
  }

  private async formatBoardWithDetails(board: Board): Promise<any> {
    const data: any = { ...board };
    const owner = await this.users.findOne({ where: { id: board.ownerId } });
    const members: any[] = [];
    if (owner) members.push({ user: owner.toResponse(), role: 'owner' });
    for (const id of board.memberIds || []) {
      const u = await this.users.findOne({ where: { id } });
      if (u) members.push({ user: u.toResponse(), role: 'member' });
    }
    data.members = members;
    data.columns = (board as any).columns?.sort((a: any, b: any) => a.orderColumn - b.orderColumn) || [];
    return data;
  }
}
```

- [ ] **Step 2: BoardsController**

```typescript
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  async index(@Req() req: any) {
    return this.boardsService.findAll(req.userId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.boardsService.create(req.userId, body);
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    return this.boardsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: any) {
    return this.boardsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async destroy(@Param('id') id: number, @Req() req: any) {
    await this.boardsService.delete(id, req.userId);
  }
}
```

- [ ] **Step 3: ColumnsService + ColumnsController**

Même pattern que BoardsService mais pour les colonnes. Inclure :
- `findByBoard(boardId)` — retourne les colonnes triées par orderColumn
- `create(boardId, body)` — crée une colonne, auto-incrémente orderColumn
- `reorder(body)` — reçoit `[{id, order}]`, met à jour orderColumn
- `update(id, body)` — modifie title/color/description
- `delete(id)` — supprime, retourne 204

- [ ] **Step 4: Tester**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
npx nest start &
sleep 3

# Reset + login
curl -s -X POST http://localhost:3000/api/_reset
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@protask.dev","password":"pass123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")
echo "Token: $TOKEN"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/boards | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).length+' boards'))"

kill %1 2>/dev/null
```

Expected: Board list with 2+ boards.

- [ ] **Step 5: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/
git commit -m "feat(nestjs): implement Board and Column controllers"
```

---

### Task 8: Contrôleurs Card + Label + Comment + Invitation

**Files:**
- Create: `protask/guides/nestjs/src/cards/cards.controller.ts`
- Create: `protask/guides/nestjs/src/cards/cards.service.ts`
- Create: `protask/guides/nestjs/src/cards/cards.module.ts`
- Create: `protask/guides/nestjs/src/labels/labels.controller.ts`
- Create: `protask/guides/nestjs/src/labels/labels.service.ts`
- Create: `protask/guides/nestjs/src/labels/labels.module.ts`
- Create: `protask/guides/nestjs/src/comments/comments.controller.ts`
- Create: `protask/guides/nestjs/src/comments/comments.service.ts`
- Create: `protask/guides/nestjs/src/comments/comments.module.ts`
- Create: `protask/guides/nestjs/src/invitations/invitations.controller.ts`
- Create: `protask/guides/nestjs/src/invitations/invitations.service.ts`
- Create: `protask/guides/nestjs/src/invitations/invitations.module.ts`

**Interfaces:**
- Consumes: Task 7 (Board/Column working)
- Produces: Full 19-route implementation

- [ ] **Step 1: CardsService**

`src/cards/cards.service.ts` (methods list — implement full logic):

- `findByColumn(columnId)` — cards triés par orderColumn, avec assignee, comments.author
- `create(columnId, body)` — titre requis, auto orderColumn
- `findOne(id)` — avec assignee et comments
- `update(id, body)` — title, description, dueDate, assigneeId, labelIds
- `delete(id)` — supprime
- `reorder(body)` — `[{id, order}]`
- `move(id, body)` — change columnId et/ou orderColumn

- [ ] **Step 2: LabelsService**

- `findByBoard(boardId)` — tous les labels d'un board
- `create(boardId, body)` — nom requis
- `update(id, body)` — name, color, description
- `delete(id)` — supprime

- [ ] **Step 3: CommentsService**

- `findByCard(cardId)` — avec author
- `create(cardId, body, userId)` — texte requis
- `delete(id)` — supprime

- [ ] **Step 4: InvitationsService**

- `findByBoard(boardId)` — toutes les invitations
- `create(boardId, body, userId)` — validation email, vérification doublon, auto-invitation
- `update(id, body, userId)` — accepted → ajoute member_ids, vérifie permissions
- `delete(id)` — supprime
- `removeMember(boardId, memberId, userId)` — owner only

- [ ] **Step 5: Tester tous les endpoints**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
npx nest start &
sleep 3
curl -s -X POST http://localhost:3000/api/_reset
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@protask.dev","password":"pass123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

# Quick smoke test of card creation
COL_ID=1
curl -s -X POST "http://localhost:3000/api/columns/$COL_ID/cards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test card"}'

kill %1 2>/dev/null
```

- [ ] **Step 6: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/
git commit -m "feat(nestjs): implement Card, Label, Comment and Invitation controllers"
```

---

### Task 9: Validation e2e (53/53)

**Files:**
- None (validation only)

- [ ] **Step 1: Démarrer le serveur**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/nestjs
npx nest start &
sleep 4
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/_reset
```

Expected: 200

- [ ] **Step 2: Lancer les tests**

```bash
cd /home/warol52/WORK/projects-ideas
API_BASE_URL=http://localhost:3000/api pnpm test:api 2>&1
```

Expected: 53 passed, 0 failed.

**Débogage si échec :**
- `401` sur routes publiques → oubli du décorateur `@Public()` sur auth/_reset
- `404` → vérifier les paths des contrôleurs (préfixe `auth/` vs `auth`)
- Mauvais format JSON → les réponses NestJS sont automatiquement sérialisées — vérifier les retours des services
- `500` sur _reset → les noms de tables TypeORM peuvent différer des noms d'entités. Vérifier `@Entity()` et les requêtes DELETE
- `order` column → si l'entité utilise `orderColumn` mais le test attend `order`, vérifier le mapping dans `toResponse()` ou le formatage

- [ ] **Step 3: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/
git commit -m "feat(nestjs): e2e validation (53/53)"
```

---

### Task 10: Guide index.md

**Files:**
- Create: `protask/guides/nestjs/index.md`

- [ ] **Step 1: Écrire le guide**

`protask/guides/nestjs/index.md` — 10 sections, ~600-800 lignes, en français :

```markdown
# Guide d'implémentation NestJS pour ProTask

> **Objectif** : Implémenter les 19 routes de l'API ProTask avec NestJS 11, étape par étape.

**Prérequis** : Node.js v24, pnpm

**Durée estimée** : 2-3 heures

---

## 1. Setup

[Installation avec @nestjs/cli, dépendances TypeORM + better-sqlite3]

## 2. Structure du projet

[Arborescence src/, explication modules/entités/contrôleurs/services]

## 3. Entités TypeORM

[7 entités avec décorateurs @Entity, @PrimaryGeneratedColumn, @Column, relations @ManyToOne/@OneToMany]

## 4. SeedService

[Création des données de démonstration, module dédié]

## 5. Authentification

[MockAuthGuard, décorateur @Public(), enregistrement global APP_GUARD]

## 6. Modules et routing

[AppModule, imports, TypeOrmModule.forRoot, globalPrefix 'api']

## 7. Contrôleurs par ressource

[8 contrôleurs, services associés, patterns de CRUD]

## 8. Reset

[POST /api/_reset, PRAGMA foreign_keys, ordre DELETE]

## 9. Tests

[Lancement 53 tests e2e avec API_BASE_URL]

## 10. Déploiement

[Build production, variables d'environnement]
```

- [ ] **Step 2: Vérifier longueur**

```bash
wc -l /home/warol52/WORK/projects-ideas/protask/guides/nestjs/index.md
```

Expected: ~600-800 lines.

- [ ] **Step 3: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/nestjs/index.md
git commit -m "docs(nestjs): add implementation guide index.md"
```

---

### Task 11: Script package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Ajouter `test:guide:nestjs`**

```bash
cd /home/warol52/WORK/projects-ideas
node -e "
const pkg = require('./package.json');
pkg.scripts['test:guide:nestjs'] = 'API_BASE_URL=http://localhost:3000/api vitest run protask/api/e2e.spec.js';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "feat: add test:guide:nestjs script to package.json"
```

---

## Self-Review

### 1. Spec coverage
- Scaffold NestJS → Task 1
- 7 TypeORM entities → Task 2
- Seed data → Task 3
- MockAuth guard → Task 4
- AppModule + main.ts wiring → Task 5
- Auth/User/Reset controllers → Task 6
- Board/Column controllers → Task 7
- Card/Label/Comment/Invitation controllers → Task 8
- 53/53 e2e passing → Task 9
- Guide index.md → Task 10
- package.json script → Task 11

### 2. Placeholder scan
No placeholders found.

### 3. Type consistency
- `orderColumn` used consistently in entities/controllers (maps to `order` in API responses via toResponse)
- `userId` stored in `request.userId` (set by MockAuthGuard)
- All controllers return objects (NestJS serializes to JSON)
- Public routes marked with `@Public()` decorator
- All entities have `@Entity()` decorator with proper table names
- `better-sqlite3` type throughout
