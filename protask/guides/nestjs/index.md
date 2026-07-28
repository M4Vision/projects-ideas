# Guide d'implémentation NestJS pour ProTask

> **Objectif** : Implémenter les 19 routes de l'API ProTask avec NestJS 11, TypeORM et better-sqlite3, étape par étape.

**Prérequis** : Node.js v24+, pnpm

**Connaissances** : Bases de TypeScript, notions de MVC.

**Durée estimée** : 3-4 heures

---

## 1. Setup

```bash
# Création du projet avec le CLI NestJS
npx @nestjs/cli@11 new protask-nestjs --package-manager pnpm
cd protask-nestjs

# Dépendances principales
pnpm add @nestjs/typeorm typeorm better-sqlite3
pnpm add -D @types/better-sqlite3

# Démarrage
pnpm start:dev
```

NestJS 11 utilise TypeScript 5 natif. Le CLI génère une arborescence `src/` avec un module racine `AppModule`.

> **Note** : Laravel 13 utilise `composer create-project`. NestJS utilise `@nestjs/cli new` — les deux génèrent un squelette prêt à l'emploi.

### Fichier `.env`

```env
PORT=3000
NODE_ENV=development
```

Configuré via `@nestjs/config` ou directement dans `main.ts` :

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
```

---

## 2. Structure du projet

```
protask/guides/nestjs/
├── src/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── board.entity.ts
│   │   ├── column.entity.ts
│   │   ├── card.entity.ts
│   │   ├── label.entity.ts
│   │   ├── comment.entity.ts
│   │   └── invitation.entity.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── mock-auth.guard.ts
│   │   └── public.decorator.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   ├── boards/
│   │   ├── boards.module.ts
│   │   ├── boards.controller.ts
│   │   └── boards.service.ts
│   ├── columns/
│   │   ├── columns.module.ts
│   │   ├── columns.controller.ts
│   │   └── columns.service.ts
│   ├── cards/
│   │   ├── cards.module.ts
│   │   ├── cards.controller.ts
│   │   └── cards.service.ts
│   ├── labels/
│   │   ├── labels.module.ts
│   │   ├── labels.controller.ts
│   │   └── labels.service.ts
│   ├── comments/
│   │   ├── comments.module.ts
│   │   ├── comments.controller.ts
│   │   └── comments.service.ts
│   ├── invitations/
│   │   ├── invitations.module.ts
│   │   ├── invitations.controller.ts
│   │   └── invitations.service.ts
│   ├── seed/
│   │   ├── seed.module.ts
│   │   └── seed.service.ts
│   ├── reset/
│   │   ├── reset.module.ts
│   │   └── reset.controller.ts
│   ├── common/
│   │   └── exception.filter.ts
│   ├── app.module.ts
│   └── main.ts
├── data.db                              ← SQLite (généré)
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

Structure modulaire NestJS : chaque domaine a son propre module, son contrôleur et son service. Les entités TypeORM sont centralisées dans `entities/`.

Contrairement à Laravel où Eloquent fusionne modèle et accès aux données, NestJS sépare : l'entité décrit le schéma (`@Entity()`), le service contient la logique métier, le contrôleur gère le routage HTTP.

---

## 3. Entités TypeORM

Les entités TypeORM sont décorées avec `@Entity()`. Chaque champ utilise `@Column()` avec son type. Les relations `@ManyToOne` et `@OneToMany` lient les tables. TypeORM est un *Data Mapper* — l'entité est un POPO (Plain Old TypeScript Object), les accès se font via `Repository`.

**Contraste avec Eloquent (Laravel) :**

| TypeORM (NestJS) | Eloquent (Laravel) |
|---|---|
| *Data Mapper* | *Active Record* |
| Entité POPO, Repository séparé | Modèle = accès aux données |
| `repo.find({ where: { id } })` | `Model::find($id)` |
| `repo.save(entity)` + `await` | `$model->save()` |
| Relations par décorateurs | Relations par méthodes PHP |

### User

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 500, default: '' })
  avatar: string;

  toResponse(): any {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar ?? '',
      createdAt: undefined, // facultatif, Omis pour la mock API
    };
  }
}
```

- `@PrimaryGeneratedColumn()` génère un `id` auto-incrémenté
- `@Column({ length, unique, default })` définit les contraintes
- `toResponse()` formate pour l'API (camelCase, exclut le password)

### Board

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

  @ManyToOne('User')
  @JoinColumn({ name: 'ownerId' })
  owner: any;

  @OneToMany('ProjectColumn', 'board')
  columns: any[];
}
```

- `simple-json` : colonne JSON automatiquement sérialisée/désérialisée par TypeORM (équivalent des `casts` Eloquent)
- `@ManyToOne('User')` utilise une référence par nom de classe (évite les imports circulaires)
- `@JoinColumn({ name: 'ownerId' })` spécifie la colonne de clé étrangère

### ProjectColumn — attention à `order`

```typescript
@Entity()
export class ProjectColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column()
  orderColumn: number;   // 'order' est un mot réservé SQL

  @Column()
  boardId: number;

  @ManyToOne('Board', 'columns')
  @JoinColumn({ name: 'boardId' })
  board: any;

  @OneToMany('Card', 'column')
  cards: any[];
}
```

> **Pourquoi `orderColumn` et pas `order` ?** `order` est un mot réservé SQL (clause `ORDER BY`). En NestJS on le préfixe et le service le renomme en `order` dans la réponse. Même règle que pour Laravel/Symfony.

### Card

```typescript
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

Le champ `labelIds` est un tableau d'IDs stocké en JSON via `simple-json`. Pas de table pivot : TypeORM lit les IDs, puis on résout les labels dans le service via `find({ where: { id: In(labelIds) } })`.

### Label

```typescript
@Entity()
export class Label {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 7 })
  color: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  boardId: number;

  @ManyToOne('Board')
  @JoinColumn({ name: 'boardId' })
  board: any;
}
```

### Comment

```typescript
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

  @Column({ type: 'date', default: () => "datetime('now')" })
  createdAt: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'authorId' })
  author: any;

  @ManyToOne('Card', 'comments')
  @JoinColumn({ name: 'cardId' })
  card: any;
}
```

### Invitation

```typescript
@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boardId: number;

  @Column()
  userId: number;

  @Column({ length: 20, default: 'pending' })
  status: string;   // 'pending' | 'accepted' | 'declined'

  @ManyToOne('User')
  @JoinColumn({ name: 'userId' })
  user: any;

  @ManyToOne('Board')
  @JoinColumn({ name: 'boardId' })
  board: any;
}
```

---

## 4. Données de démonstration

Le `SeedService` peuple la base via `Module.onApplicationBootstrap()` (exécuté automatiquement au démarrage).

```typescript
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Board) private boards: Repository<Board>,
    @InjectRepository(ProjectColumn) private columns: Repository<ProjectColumn>,
    @InjectRepository(Card) private cards: Repository<Card>,
    @InjectRepository(Label) private labels: Repository<Label>,
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
    @InjectRepository(Invitation) private invitations: Repository<Invitation>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.users.count();
    if (count === 0) await this.seed();
  }

  async seed() {
    const alex = await this.users.save({ id: 1, name: 'Alexandre', email: 'alex@protask.dev', password: 'pass123' });
    const sophie = await this.users.save({ id: 2, name: 'Sophie', email: 'sophie@protask.dev', password: 'pass123' });
    await this.users.save({ id: 3, name: 'Marc', email: 'marc@protask.dev', password: 'pass123' });

    await this.boards.save({ id: 1, title: 'Design System', ownerId: 1, categories: ['Design', 'UI/UX'], memberIds: [2, 3] });
    await this.boards.save({ id: 2, title: 'Refonte Mobile', ownerId: 2, categories: ['Mobile'], memberIds: [1] });
    await this.boards.save({ id: 3, title: 'Marketing Q2', ownerId: 3, categories: ['Marketing'], memberIds: [1, 2] });

    // Colonnes + Cartes + Labels + Commentaires + Invitations...
    // Voir le fichier seed.service.ts pour le contenu complet
  }
}
```

| Entité | Quantité | Détails |
|---|---|---|
| Users | 3 | Alexandre, Sophie, Marc |
| Boards | 3 | Design System, Refonte Mobile, Marketing Q2 |
| Colonnes | 8 | Backlog/En cours/Terminé ×2, Idées/En production |
| Cartes | 10 | Réparties, avec assignees et label_ids |
| Labels | 4 | Design, Dev, Documentation, Urgent |
| Commentaires | 5 | Sur les cartes 1, 2, 3 |
| Invitations | 2 | 1 acceptée (Marc), 1 en attente (Julie) |

Les IDs sont explicites (`id: 1`) car l'ordre de création est connu. Les mots de passe sont en clair (mock API, pas de vrai hash).

---

## 5. Authentification

ProTask utilise une auth **mockée** : header `Authorization: Bearer token-{userId}`, pas de JWT ni session.

### MockAuthGuard

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
    const auth = request.headers?.authorization || '';

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

### Décorateur `@Public()`

```typescript
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### Enregistrement global

Dans `AppModule` :

```typescript
@Module({
  providers: [
    { provide: APP_GUARD, useClass: MockAuthGuard },
  ],
})
```

Le guard global s'applique à **toutes les routes**. Les routes publiques sont marquées avec `@Public()` :

```typescript
@Public()
@Post('auth/register')
async register(@Body() body: any) { ... }
```

> **Contraste Laravel** : Laravel utilise `bootstrap/app.php` avec `withMiddleware()` et des alias. NestJS utilise `APP_GUARD` avec des décorateurs `@Public()`.

---

## 6. Modules et routage

### AppModule

Le module racine importe chaque module métier et configure TypeORM :

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,   // synchronisation automatique du schéma
    }),
    AuthModule,
    UsersModule,
    BoardsModule,
    ColumnsModule,
    CardsModule,
    LabelsModule,
    CommentsModule,
    InvitationsModule,
    SeedModule,
    ResetModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: MockAuthGuard },
  ],
})
export class AppModule {}
```

- `synchronize: true` crée/met à jour les tables automatiquement (équivalent de `doctrine:schema:update` ou `migrate:fresh`)
- Les modules sont importés dans un ordre qui n'a pas d'importance (NestJS résout les dépendances)

### TypeORM forRoot

`TypeOrmModule.forRoot()` configure la connexion à la base. Les options :

| Option | Valeur | Description |
|---|---|---|
| `type` | `'better-sqlite3'` | Driver SQLite synchrone pour Node.js |
| `database` | `'data.db'` | Chemin vers le fichier SQLite |
| `entities` | Glob pattern | Chemins vers les fichiers d'entités |
| `synchronize` | `true` | Auto-création des tables (dev uniquement) |

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();
```

- `setGlobalPrefix('api')` : toutes les routes sont préfixées par `/api` (comme `Route::prefix('api')` dans Laravel)
- `enableCors()` : autorise les requêtes cross-origin (nécessaire pour les templates)

---

## 7. Contrôleurs par ressource

Chaque contrôleur suit un pattern CRUD standard. NestJS injecte le service via le constructeur et utilise des décorateurs pour mapper les routes HTTP.

### Organisation par module

Chaque module NestJS suit un pattern en 3 fichiers :

| Fichier | Rôle | Exemple (Boards) |
|---|---|---|
| `boards.module.ts` | Déclare le module, importe TypeORM, déclare le contrôleur et le service | |
| `boards.controller.ts` | Définit les routes HTTP (GET, POST, PUT, DELETE) | |
| `boards.service.ts` | Logique métier, accès base de données | |

### BoardsController — CRUD complet

```typescript
@Controller()
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get('boards')
  async index(@Req() req: any) {
    return this.boardsService.findAll(req.userId);
  }

  @Post('boards')
  async create(@Req() req: any, @Body() body: any) {
    return this.boardsService.create(req.userId, body);
  }

  @Get('boards/:id')
  async show(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.boardsService.findOne(id, req.userId);
  }

  @Put('boards/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.boardsService.update(id, body);
  }

  @Delete('boards/:id')
  @HttpCode(204)
  async destroy(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.boardsService.delete(id, req.userId);
  }
}
```

- `@Param('id', ParseIntPipe)` convertit la chaîne du paramètre en nombre — sinon `req.params.id` serait `"1"` (string)
- `@Req() req` donne accès à `req.userId` (injecté par MockAuthGuard)
- `@HttpCode(204)` fixe le code HTTP pour les réponses DELETE

### Piège : ParseIntPipe

Sans `ParseIntPipe`, `@Param('id')` retourne une chaîne de caractères. TypeORM ne ferait pas le cast automatiquement en SQLite, causant des bugs d'égalité. Toujours parseter les IDs numériques :

```typescript
@Param('id', ParseIntPipe) id: number
```

### BoardsService — logique métier

```typescript
@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boards: Repository<Board>,
    @InjectRepository(ProjectColumn) private columns: Repository<ProjectColumn>,
    @InjectRepository(Card) private cards: Repository<Card>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Invitation) private invitations: Repository<Invitation>,
  ) {}

  async findAll(userId: number): Promise<any[]> {
    const all = await this.boards.find({
      where: [
        { ownerId: userId },
      ],
      relations: { columns: { cards: true } },
    });
    // Filtrer les boards où l'utilisateur est owner OU membre
    return all.filter(b => b.ownerId === userId || b.memberIds?.includes(userId));
  }

  async create(userId: number, body: any): Promise<any> {
    const board = await this.boards.save({
      title: body.title,
      ownerId: userId,
      description: body.description || '',
      color: body.color || '#1976D2',
      categories: body.categories || [],
    });
    // Créer les 3 colonnes par défaut
    await this.columns.save([
      { title: 'Backlog', orderColumn: 0, boardId: board.id },
      { title: 'En cours', orderColumn: 1, boardId: board.id },
      { title: 'Terminé', orderColumn: 2, boardId: board.id },
    ]);
    return this.formatBoard(await this.boards.findOne({ where: { id: board.id }, relations: { columns: true } }));
  }

  async findOne(id: number, userId: number): Promise<any> {
    const board = await this.boards.findOne({
      where: { id },
      relations: { columns: { cards: { comments: { author: true }, assignee: true } } },
    });
    if (!board) throw new NotFoundException('Tableau introuvable.');
    return this.formatBoard(board);
  }

  private async formatBoard(board: any): Promise<any> {
    const data: any = { ...board };
    const memberIds = [board.ownerId, ...(board.memberIds || [])];
    data.members = memberIds.length > 0
      ? await this.users.find({ where: { id: In(memberIds) } }).then(u => u.map(u => u.toResponse()))
      : [];
    data.order = data.orderColumn;
    delete data.orderColumn;
    return data;
  }
}
```

### ColonnesController — reorder

Le reorder est une route spécifique qui DOIT être déclarée avant la route paramétrée :

```typescript
@Put('columns/reorder')    // ← DOIT être AVANT put('columns/:id')
async reorder(@Body() body: { id: number; order: number }[]) {
  return this.columnsService.reorder(body);
}

@Put('columns/:id')
async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { ... }
```

### CardsController — move + reorder

```typescript
@Post('cards/reorder')
@HttpCode(200)
async reorder(@Body() body: any) {
  return this.cardsService.reorder(body);
}

@Post('cards/:id/move')
@HttpCode(200)
async move(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
  return this.cardsService.move(id, body);
}
```

### LabelsController — ParseIntPipe sur boardId

```typescript
@Post('boards/:boardId/labels')
async create(@Param('boardId', ParseIntPipe) boardId: number, @Body() body: any) {
  return this.labelsService.create(boardId, body);
}
```

Sans `ParseIntPipe`, `boardId` serait une string → stockée comme string dans `label.boardId` → le test `expect(data.boardId).toBe(boardId)` échoue car `typeof data.boardId` serait `"string"` au lieu de `"number"`.

### CommentsController — author depuis le guard

```typescript
@Post('cards/:cardId/comments')
async create(@Param('cardId', ParseIntPipe) cardId: number, @Req() req: any, @Body() body: any) {
  return this.commentsService.create(cardId, req.userId, body);
}
```

L'`authorId` est extrait du guard via `req.userId`. Pas de body `authorId` — c'est le token qui détermine l'auteur.

### InvitationsController — logique d'accès

```typescript
@Post('boards/:boardId/invitations')
async create(@Param('boardId', ParseIntPipe) boardId: number, @Req() req: any, @Body() body: any) {
  return this.invitationsService.create(boardId, req.userId, body);
}

@Patch('invitations/:id')
async update(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() body: any) {
  return this.invitationsService.update(id, req.userId, body);
}

@Delete('boards/:boardId/members/:memberId')
@HttpCode(204)
async removeMember(@Param('boardId', ParseIntPipe) boardId: number, @Param('memberId', ParseIntPipe) memberId: number, @Req() req: any) {
  await this.invitationsService.removeMember(boardId, req.userId, memberId);
}
```

### Patterns de réponses

Les contrôleurs NestJS retournent directement une valeur (objet, tableau, `void`). NestJS la sérialise automatiquement en JSON.

| Code | Usage | Retour |
|---|---|---|
| `200` | Succès GET/PUT/POST | Valeur retournée |
| `201` | Création | Valeur retournée + `@HttpCode(201)` |
| `204` | Suppression | `@HttpCode(204)` + `void` |
| `400` | Validation | `throw new BadRequestException('message')` |
| `401` | Non authentifié | `throw new UnauthorizedException('message')` |
| `403` | Non autorisé | `throw new ForbiddenException('message')` |
| `404` | Introuvable | `throw new NotFoundException('message')` |

### Exception filter global

Le format d'erreur par défaut de NestJS inclut un champ `message` et `statusCode`. Les tests ProTask attendent `{ error: string, statusCode: number }`. On normalise avec un filtre global :

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const res = exception.getResponse() as any;

    response.status(status).json({
      error: typeof res === 'string' ? res : res.message || res.error,
      statusCode: status,
    });
  }
}
```

Enregistré dans `main.ts` : `app.useGlobalFilters(new HttpExceptionFilter());`

---

## 8. Reset

Route **interne** (pas dans l'OpenAPI) : `POST /api/_reset`. Remet la base à l'état initial pour les tests.

```typescript
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

**Pourquoi `PRAGMA foreign_keys = OFF` ?** SQLite désactive les contraintes par défaut, mais si elles sont actives, la suppression dans le désordre échoue. On les désactive temporairement.

**Pourquoi `DELETE FROM sqlite_sequence` ?** SQLite stocke le dernier auto-increment dans une table interne. Sans cette suppression, le prochain INSERT reprendrait à l'ancien maximum au lieu de 1.

**Ordre de suppression** : enfants avant parents — comments → cards → labels → invitations → project_columns → boards → users.

---

## 9. Tests

```bash
# Lancer les 53 tests e2e ProTask contre le serveur NestJS
API_BASE_URL=http://localhost:3000/api pnpm test:api
```

Les tests sont partagés avec les autres implémentations (Hono, Symfony, Laravel). Ils lancent des requests HTTP et valident les réponses.

### Pré-requis

1. Le serveur NestJS tourne sur le port 3000
2. La base `data.db` est fraîche (ou `POST /api/_reset` au début de la session de test)

### Couverture

53 tests couvrent :

- **Authentification** : register, login, logout, token invalide
- **Users** : me, updateMe, show
- **Boards** : list, create, show, update, delete, members
- **Colonnes** : listByBoard, create, update, reorder, delete, 404
- **Cartes** : listByColumn, create, show, update (titre, description, dueDate, assignee, labels), delete, reorder, move, 404
- **Labels** : listByBoard, create, update, delete, 404
- **Commentaires** : listByCard, create, delete, 404
- **Invitations** : listByBoard, create (existing, invalid email, self, not found, already invited), accept, decline, wrong user, cancel, removeMember, 403

---

## 10. Déploiement

### Build production

```bash
pnpm build
```

Génère le dossier `dist/` avec le code compilé en JavaScript.

### Variables d'environnement

```env
PORT=3000
NODE_ENV=production
```

À passer via le système d'exploitation ou un fichier `.env`.

### Lancement

```bash
node dist/main.js
```

### Configuration PM2 (optionnelle)

```bash
pm2 start dist/main.js --name protask-nestjs
```

### nginx

```nginx
server {
    listen 80;
    server_name protask.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Résumé

**19 routes API**, **7 entités TypeORM**, **9 contrôleurs**, **9 services**, **1 guard**, **1 filtre global**, **1 seed**, **1 reset**, **53 tests**.

### Points clés à retenir

1. **TypeORM = Data Mapper** — entités POPO, repositories séparés, pas d'Active Record
2. **`ParseIntPipe`** — toujours parser les IDs des paramètres d'URL (`@Param('id', ParseIntPipe)`)
3. **`simple-json`** — colonnes JSON automatiquement sérialisées/désérialisées (équivalent des `casts` Eloquent)
4. **`orderColumn`** — éviter `order` (mot réservé SQL), renommer via le service
5. **Ordre des routes** — `reorder`/`move` avant `{id}` (même règle que Laravel/Symfony)
6. **`APP_GUARD` global** — guard appliqué à toutes les routes, `@Public()` pour les exceptions
7. **Exception filter** — formater les erreurs NestJS en `{ error, statusCode }` pour compatibilité ProTask
8. **Reset SQLite** — `PRAGMA foreign_keys = OFF`, vider `sqlite_sequence`, reseed

### Pour aller plus loin

- Guide Symfony : `protask/guides/symfony/index.md`
- Guide Laravel : `protask/guides/laravel/index.md`
- Templates ProTask : `protask/templates/`
- Spec OpenAPI : `protask/docs/openapi.json`
