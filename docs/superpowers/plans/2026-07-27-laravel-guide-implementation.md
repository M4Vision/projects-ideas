# Guide Laravel ProTask — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter un guide pédagogique complet pour ProTask avec Laravel 12 (projet exécutable + guide Markdown), validable par les 53 tests e2e existants.

**Architecture:** Projet Laravel 12 avec SQLite, Eloquent ORM, middlewares d'authentification simulée, route groupée `api` préfixée par `/api`. 7 modèles Eloquent, 9 contrôleurs HTTP, 7 migrations, 1 seeder. Le guide Markdown explique chaque étape. La batterie de tests `protask/api/e2e.spec.js` valide le serveur via `API_BASE_URL`.

**Tech Stack:** PHP 8.2+, Laravel 12, SQLite, Eloquent ORM, Pest/PHPUnit (non utilisé — validation via `e2e.spec.js` Vitest externe)

## Global Constraints

- Tous les guides sont en français
- Le glossaire de `CONTEXT.md` est la source de vérité pour la terminologie (Guide, Template, Mock API, Projet)
- `server.js` (Hono) reste l'implémentation de référence — ne pas supprimer
- L'authentification simulée utilise le header `Authorization: Bearer token-{userId}`
- Les routes sont préfixées par `/api` (Laravel route group `prefix: 'api'`)
- La base de données est SQLite (fichier `database/database.sqlite`)
- `POST /api/_reset` vide toutes les tables et réinitialise les données de démonstration
- Tous les mots de passe en clair (pas de bcrypt — mock API)
- Le champ `password` est exclu des réponses JSON
- 53 tests doivent passer avec `API_BASE_URL=http://localhost:8000/api pnpm test:api`
- `order` est un mot réservé SQL — utiliser `order_column` comme nom de colonne ou échapper
- Les controllers return `response()->json($data, $status)`

---

## File Structure

```
protask/guides/laravel/
├── .env                          ← SQLite config
├── .env.example                  ← Template
├── artisan                       ← CLI entry point
├── composer.json                 ← Dépendances
├── routes/
│   └── api.php                   ← 19 routes API + _reset
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php        ← register, login, logout
│   │   │   ├── UserController.php        ← me, updateMe, show
│   │   │   ├── BoardController.php       ← index, create, show, update, destroy
│   │   │   ├── ColumnController.php      ← index, create, reorder, update, destroy
│   │   │   ├── CardController.php        ← index, create, show, update, destroy, reorder, move
│   │   │   ├── LabelController.php       ← index, create, update, destroy
│   │   │   ├── CommentController.php     ← index, create, destroy
│   │   │   ├── InvitationController.php  ← index, create, update, destroy, removeMember
│   │   │   └── ResetController.php       ← reset
│   │   └── Middleware/
│   │       └── MockAuth.php              ← Bearer token extraction
│   └── Models/
│       ├── User.php
│       ├── Board.php
│       ├── ProjectColumn.php
│       ├── Card.php
│       ├── Label.php
│       ├── Comment.php
│       └── Invitation.php
├── database/
│   ├── migrations/
│   │   ├── 2026_01_01_000001_create_users_table.php
│   │   ├── 2026_01_01_000002_create_boards_table.php
│   │   ├── 2026_01_01_000003_create_project_columns_table.php
│   │   ├── 2026_01_01_000004_create_cards_table.php
│   │   ├── 2026_01_01_000005_create_labels_table.php
│   │   ├── 2026_01_01_000006_create_comments_table.php
│   │   └── 2026_01_01_000007_create_invitations_table.php
│   └── seeders/
│       └── DatabaseSeeder.php            ← Données de démonstration
└── index.md                               ← Guide pédagogique (créé en dernier)
```

## Dépendances entre tâches

```
Task 1 (Scaffold)
  └──> Task 2 (Migrations + Models)
         └──> Task 3 (Seeder)
         └──> Task 4 (MockAuth middleware)
                └──> Task 5 (Routes + stubs controllers)
                       ├──> Task 6 (Auth + User + Reset)
                       ├──> Task 7 (Board + Column)
                       ├──> Task 8 (Card + Label + Comment + Invitation)
                       └──> Task 9 (DB init + e2e validation)
                              └──> Task 10 (Guide index.md)
                                     └──> Task 11 (package.json script)
```

---

### Task 1: Scaffold projet Laravel + config SQLite

**Files:**
- Create: `protask/guides/laravel/` (composer create-project output)
- Modify: `protask/guides/laravel/.env`
- Modify: `protask/guides/laravel/config/database.php`

**Interfaces:**
- Consumes: nothing
- Produces: Laravel project with SQLite configured, DB file created, `php artisan` working

- [ ] **Step 1: Créer le projet Laravel**

```bash
cd /home/warol52/WORK/projects-ideas
composer create-project laravel/laravel --prefer-dist protask/guides/laravel 2>&1 | tail -5
```

Expected output: "Application ready!" or similar

- [ ] **Step 2: Configurer SQLite dans `.env`**

Write `protask/guides/laravel/.env`:

```bash
APP_NAME=ProTask
APP_ENV=dev
APP_KEY=base64:protaskdevkey1234567890123456789012345678901234567890123
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD not needed for SQLite

LOG_CHANNEL=stack
LOG_LEVEL=debug
```

Generate a real APP_KEY:

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel && php artisan key:generate
```

- [ ] **Step 3: Créer le fichier SQLite**

```bash
touch /home/warol52/WORK/projects-ideas/protask/guides/laravel/database/database.sqlite
```

- [ ] **Step 4: Vérifier que le projet fonctionne**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel && php artisan serve --port=8000 &
sleep 2 && curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/
kill %1 2>/dev/null
```

Expected: `200` (Laravel welcome page)

- [ ] **Step 5: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/laravel/
git commit -m "feat(laravel): scaffold Laravel project with SQLite config"
```

---

### Task 2: Migrations + Modèles Eloquent (7 entités)

**Files:**
- Create: `protask/guides/laravel/database/migrations/2026_01_01_000001_create_users_table.php`
- Create: `protask/guides/laravel/database/migrations/2026_01_01_000002_create_boards_table.php`
- Create: `protask/guides/laravel/database/migrations/2026_01_01_000003_create_project_columns_table.php`
- Create: `protask/guides/laravel/database/migrations/2026_01_01_000004_create_cards_table.php`
- Create: `protask/guides/laravel/database/migrations/2026_01_01_000005_create_labels_table.php`
- Create: `protask/guides/laravel/database/migrations/2026_01_01_000006_create_comments_table.php`
- Create: `protask/guides/laravel/database/migrations/2026_01_01_000007_create_invitations_table.php`
- Modify: `protask/guides/laravel/app/Models/User.php` (ajout champs + cast)
- Create: `protask/guides/laravel/app/Models/Board.php`
- Create: `protask/guides/laravel/app/Models/ProjectColumn.php`
- Create: `protask/guides/laravel/app/Models/Card.php`
- Create: `protask/guides/laravel/app/Models/Label.php`
- Create: `protask/guides/laravel/app/Models/Comment.php`
- Create: `protask/guides/laravel/app/Models/Invitation.php`

**Interfaces:**
- Consumes: Task 1 (Laravel project with artisan)
- Produces: 7 migrations executables + 7 models with relations and casts

- [ ] **Step 1: Créer la migration `users`**

`database/migrations/2026_01_01_000001_create_users_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 180)->unique();
            $table->string('password');
            $table->string('avatar', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

- [ ] **Step 2: Créer la migration `boards`**

`database/migrations/2026_01_01_000002_create_boards_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boards', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->foreignId('owner_id')->constrained('users');
            $table->text('description')->nullable();
            $table->string('color', 7)->nullable();
            $table->json('categories')->nullable();
            $table->json('member_ids')->default('[]');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boards');
    }
};
```

- [ ] **Step 3: Créer la migration `project_columns`**

`database/migrations/2026_01_01_000003_create_project_columns_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_columns', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->integer('order_column'); // 'order' is reserved in SQL
            $table->foreignId('board_id')->constrained()->cascadeOnDelete();
            $table->string('color', 7)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_columns');
    }
};
```

- [ ] **Step 4: Créer la migration `cards`**

`database/migrations/2026_01_01_000004_create_cards_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->integer('order_column');
            $table->foreignId('column_id')->constrained('project_columns')->cascadeOnDelete();
            $table->date('due_date')->nullable();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('label_ids')->default('[]');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};
```

- [ ] **Step 5: Créer les migrations `labels`, `comments`, `invitations`**

`database/migrations/2026_01_01_000005_create_labels_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labels', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('color', 7);
            $table->foreignId('board_id')->constrained()->cascadeOnDelete();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labels');
    }
};
```

`database/migrations/2026_01_01_000006_create_comments_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->foreignId('author_id')->constrained('users');
            $table->foreignId('card_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
```

`database/migrations/2026_01_01_000007_create_invitations_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('board_id')->constrained()->cascadeOnDelete();
            $table->string('email', 180);
            $table->foreignId('invited_by_id')->constrained('users');
            $table->string('status', 20)->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
```

- [ ] **Step 6: Modifier le modèle User**

`app/Models/User.php` :

```php
<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = ['name', 'email', 'password', 'avatar'];

    protected $hidden = ['password'];

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar ?? '',
            'createdAt' => $this->created_at?->format('c'),
        ];
    }
}
```

- [ ] **Step 7: Créer le modèle Board**

`app/Models/Board.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Board extends Model
{
    protected $fillable = ['title', 'owner_id', 'description', 'color', 'categories', 'member_ids'];

    protected function casts(): array
    {
        return [
            'categories' => 'array',
            'member_ids' => 'array',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function columns(): HasMany
    {
        return $this->hasMany(ProjectColumn::class);
    }

    public function labels(): HasMany
    {
        return $this->hasMany(Label::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function isMember(int $userId): bool
    {
        return in_array($userId, $this->member_ids ?? []);
    }

    public function getMembers(): array
    {
        $members = [];
        $owner = User::find($this->owner_id);
        if ($owner) {
            $members[] = ['user' => $owner->toArray(), 'role' => 'owner'];
        }
        foreach ($this->member_ids ?? [] as $id) {
            $user = User::find($id);
            if ($user) {
                $members[] = ['user' => $user->toArray(), 'role' => 'member'];
            }
        }
        return $members;
    }

    public function toArray(): array
    {
        $data = parent::toArray();
        $data['createdAt'] = $this->created_at?->format('c');
        $data['categories'] = $this->categories ?? [];
        $data['memberIds'] = $this->member_ids ?? [];
        $data['cardCount'] = $this->columns->sum(fn($c) => $c->cards->count());
        return $data;
    }
}
```

- [ ] **Step 8: Créer le modèle ProjectColumn**

`app/Models/ProjectColumn.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectColumn extends Model
{
    protected $fillable = ['title', 'order_column', 'board_id', 'color', 'description'];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function cards(): HasMany
    {
        return $this->hasMany(Card::class, 'column_id');
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'order' => $this->order_column,
            'boardId' => $this->board_id,
            'color' => $this->color,
            'description' => $this->description ?? '',
        ];
    }
}
```

- [ ] **Step 9: Créer le modèle Card**

`app/Models/Card.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Card extends Model
{
    protected $fillable = ['title', 'description', 'order_column', 'column_id', 'due_date', 'assignee_id', 'label_ids'];

    protected function casts(): array
    {
        return ['label_ids' => 'array'];
    }

    public function column(): BelongsTo
    {
        return $this->belongsTo(ProjectColumn::class, 'column_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description ?? '',
            'order' => $this->order_column,
            'columnId' => $this->column_id,
            'dueDate' => $this->due_date,
            'assigneeId' => $this->assignee_id,
            'labelIds' => $this->label_ids ?? [],
            'assignee' => $this->assignee?->toArray(),
            'labels' => $this->label_ids ? Label::whereIn('id', $this->label_ids)->get()->toArray() : [],
            'comments' => $this->comments->map(fn($c) => $c->toArray()),
        ];
    }
}
```

- [ ] **Step 10: Créer les modèles Label, Comment, Invitation**

`app/Models/Label.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Label extends Model
{
    protected $fillable = ['name', 'color', 'board_id', 'description'];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color,
            'boardId' => $this->board_id,
            'description' => $this->description ?? '',
        ];
    }
}
```

`app/Models/Comment.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    protected $fillable = ['text', 'author_id', 'card_id'];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'text' => $this->text,
            'authorId' => $this->author_id,
            'cardId' => $this->card_id,
            'createdAt' => $this->created_at?->format('c'),
            'author' => $this->author?->toArray(),
        ];
    }
}
```

`app/Models/Invitation.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invitation extends Model
{
    protected $fillable = ['board_id', 'email', 'invited_by_id', 'status'];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_id');
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'boardId' => $this->board_id,
            'email' => $this->email,
            'invitedById' => $this->invited_by_id,
            'status' => $this->status,
            'createdAt' => $this->created_at?->format('c'),
        ];
    }
}
```

- [ ] **Step 11: Exécuter les migrations**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel
php artisan migrate --force 2>&1
```

Expected output: "Migration table created successfully." + 7 migrations run

- [ ] **Step 12: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/laravel/
git commit -m "feat(laravel): add migrations and Eloquent models for 7 entities"
```

---

### Task 3: DatabaseSeeder avec données de démonstration

**Files:**
- Modify: `protask/guides/laravel/database/seeders/DatabaseSeeder.php`

**Interfaces:**
- Consumes: Task 2 (models + migrations)
- Produces: seed data populating all 7 tables, callable via `php artisan db:seed`

- [ ] **Step 1: Écrire DatabaseSeeder complet**

`database/seeders/DatabaseSeeder.php`:

```php
<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Board;
use App\Models\ProjectColumn;
use App\Models\Card;
use App\Models\Label;
use App\Models\Comment;
use App\Models\Invitation;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        $alex = User::create(['name' => 'Alexandre', 'email' => 'alex@protask.dev', 'password' => 'pass123']);
        $sophie = User::create(['name' => 'Sophie', 'email' => 'sophie@protask.dev', 'password' => 'pass123']);
        $marc = User::create(['name' => 'Marc', 'email' => 'marc@protask.dev', 'password' => 'pass123']);

        // Board 1 - Design System
        $board1 = Board::create([
            'title' => 'Design System', 'owner_id' => 1,
            'description' => "Design system de l'application",
            'color' => '#8B5CF6', 'categories' => ['Design', 'UI/UX'],
            'member_ids' => [2, 3],
        ]);
        $b1backlog = ProjectColumn::create(['title' => 'Backlog', 'order_column' => 0, 'board_id' => 1, 'color' => '#6B7280', 'description' => 'Tâches en attente de traitement']);
        $b1encours = ProjectColumn::create(['title' => 'En cours', 'order_column' => 1, 'board_id' => 1, 'color' => '#3B82F6', 'description' => 'Tâches en cours de développement']);
        $b1termine = ProjectColumn::create(['title' => 'Terminé', 'order_column' => 2, 'board_id' => 1, 'color' => '#10B981', 'description' => 'Tâches terminées et validées']);

        // Board 2 - Refonte App Mobile
        $board2 = Board::create([
            'title' => 'Refonte App Mobile', 'owner_id' => 1,
            'description' => "Refonte complète de l'application mobile",
            'color' => '#3B82F6', 'categories' => ['Mobile'], 'member_ids' => [],
        ]);
        $b2todo = ProjectColumn::create(['title' => 'À faire', 'order_column' => 0, 'board_id' => 2, 'color' => '#F59E0B', 'description' => 'Tâches planifiées']);
        $b2encours = ProjectColumn::create(['title' => 'En cours', 'order_column' => 1, 'board_id' => 2, 'color' => '#3B82F6', 'description' => '']);
        $b2termine = ProjectColumn::create(['title' => 'Terminé', 'order_column' => 2, 'board_id' => 2, 'color' => '#10B981', 'description' => '']);

        // Board 3 - Marketing Q2
        $board3 = Board::create([
            'title' => 'Marketing Q2', 'owner_id' => 2,
            'description' => 'Stratégie marketing pour le Q2',
            'color' => '#EF4444', 'categories' => ['Marketing'], 'member_ids' => [3],
        ]);
        $b3idees = ProjectColumn::create(['title' => 'Idées', 'order_column' => 0, 'board_id' => 3, 'color' => '#8B5CF6', 'description' => 'Idées à explorer']);
        $b3prod = ProjectColumn::create(['title' => 'En production', 'order_column' => 1, 'board_id' => 3, 'color' => '#EF4444', 'description' => 'Campagnes en cours']);

        // Labels (Board 1)
        $l1 = Label::create(['name' => 'Design', 'color' => '#8B5CF6', 'board_id' => 1, 'description' => 'Design']);
        $l2 = Label::create(['name' => 'Dev', 'color' => '#3B82F6', 'board_id' => 1, 'description' => 'Dev']);
        $l3 = Label::create(['name' => 'Documentation', 'color' => '#10B981', 'board_id' => 1, 'description' => 'Doc']);
        $l4 = Label::create(['name' => 'Urgent', 'color' => '#EF4444', 'board_id' => 1, 'description' => 'Urgent']);

        // Cards
        Card::create(['title' => "Définir la palette", 'description' => "Choisir les couleurs primaires et secondaires.", 'order_column' => 0, 'column_id' => 1, 'due_date' => '2025-04-15', 'assignee_id' => 1, 'label_ids' => [1]]);
        Card::create(['title' => 'Composants UI', 'description' => "Créer les composants Button, Input, Card, Modal.", 'order_column' => 1, 'column_id' => 1, 'due_date' => '2025-04-20', 'assignee_id' => 2, 'label_ids' => [1, 2]]);
        Card::create(['title' => "Page accueil responsive", 'description' => "Terminer la mise en page responsive.", 'order_column' => 0, 'column_id' => 2, 'due_date' => '2025-04-10', 'assignee_id' => 1, 'label_ids' => [2]]);
        Card::create(['title' => 'Documentation', 'description' => "Écrire la documentation du design system.", 'order_column' => 1, 'column_id' => 3, 'due_date' => '2025-04-05', 'assignee_id' => 2, 'label_ids' => [3]]);
        Card::create(['title' => 'Wireframes', 'description' => "Wireframes validés par le client.", 'order_column' => 0, 'column_id' => 4, 'due_date' => '2025-04-08', 'assignee_id' => 1, 'label_ids' => [2]]);
        Card::create(['title' => 'Maquette Figma', 'description' => "Maquette haute-fidélité.", 'order_column' => 0, 'column_id' => 5, 'due_date' => '2025-04-18', 'assignee_id' => 1, 'label_ids' => [1]]);
        Card::create(['title' => "Tests utilisateurs", 'description' => "Session de tests utilisateurs.", 'order_column' => 0, 'column_id' => 6, 'due_date' => '2025-04-12', 'assignee_id' => 2, 'label_ids' => [3]]);
        Card::create(['title' => 'Analyse concurrents', 'description' => "Analyse des concurrents directs.", 'order_column' => 0, 'column_id' => 7, 'due_date' => '2025-04-14', 'assignee_id' => 1, 'label_ids' => [2]]);
        Card::create(['title' => 'Stratégie contenu', 'description' => "Plan de contenu pour les réseaux sociaux.", 'order_column' => 1, 'column_id' => 7, 'due_date' => '2025-04-22', 'assignee_id' => 2, 'label_ids' => [1, 4]]);
        Card::create(['title' => 'Campagne emailing', 'description' => "Campagne emailing Q2.", 'order_column' => 0, 'column_id' => 8, 'due_date' => '2025-04-25', 'assignee_id' => 1, 'label_ids' => [4]]);

        // Comments
        Comment::create(['text' => "J'ai commencé la palette.", 'author_id' => 1, 'card_id' => 1]);
        Comment::create(['text' => "Je valide le violet.", 'author_id' => 2, 'card_id' => 1]);
        Comment::create(['text' => 'PR créé.', 'author_id' => 1, 'card_id' => 3]);
        Comment::create(['text' => "J'ai ajouté les variantes disabled et loading.", 'author_id' => 2, 'card_id' => 2]);
        Comment::create(['text' => "Review faite, quelques suggestions.", 'author_id' => 1, 'card_id' => 2]);

        // Invitations
        Invitation::create(['board_id' => 1, 'email' => 'marc@protask.dev', 'invited_by_id' => 1, 'status' => 'accepted']);
        Invitation::create(['board_id' => 1, 'email' => 'julie@test.com', 'invited_by_id' => 1, 'status' => 'pending']);
    }
}
```

- [ ] **Step 2: Exécuter le seeder**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel
php artisan db:seed --force 2>&1
```

Expected output: "Database seeding completed successfully."

- [ ] **Step 3: Vérifier les données**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel
php artisan tinker --execute="echo App\Models\User::count();" 2>&1
```

Expected: `3`

- [ ] **Step 4: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/laravel/
git commit -m "feat(laravel): add DatabaseSeeder with demo data"
```

---

### Task 4: Middleware MockAuth (authentification simulée)

**Files:**
- Create: `protask/guides/laravel/app/Http/Middleware/MockAuth.php`
- Modify: `protask/guides/laravel/bootstrap/app.php` (enregistrer le middleware)

**Interfaces:**
- Consumes: Task 2 (User model)
- Produces: middleware `mock.auth` utilisable dans les routes

- [ ] **Step 1: Créer le middleware MockAuth**

`app/Http/Middleware/MockAuth.php`:

```php
<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MockAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $auth = $request->header('Authorization', '');

        if (!str_starts_with($auth, 'Bearer token-')) {
            return response()->json(['error' => 'Token manquant ou invalide.'], 401);
        }

        $userId = (int) substr($auth, strlen('Bearer token-'));

        if ($userId <= 0) {
            return response()->json(['error' => 'Token invalide.'], 401);
        }

        $request->attributes->set('_user_id', $userId);
        return $next($request);
    }
}
```

- [ ] **Step 2: Enregistrer le middleware dans `bootstrap/app.php`**

`bootstrap/app.php`:

```php
<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\MockAuth;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'mock.auth' => MockAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

- [ ] **Step 3: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/laravel/
git commit -m "feat(laravel): add MockAuth middleware"
```

---

### Task 5: Routes API + squelettes de contrôleurs

**Files:**
- Create: `protask/guides/laravel/routes/api.php`
- Create: `protask/guides/laravel/app/Http/Controllers/AuthController.php` (skeleton)
- Create: `protask/guides/laravel/app/Http/Controllers/UserController.php` (skeleton)
- Create: `protask/guides/laravel/app/Http/Controllers/BoardController.php` (skeleton)
- Create: `protask/guides/laravel/app/Http/Controllers/ColumnController.php` (skeleton)
- Create: `protask/guides/laravel/app/Http/Controllers/CardController.php` (skeleton)
- Create: `protask/guides/laravel/app/Http/Controllers/LabelController.php` (skeleton)
- Create: `protask/guides/laravel/app/Http/Controllers/CommentController.php` (skeleton)
- Create: `protask/guides/laravel/app/Http/Controllers/InvitationController.php` (skeleton)
- Create: `protask/guides/laravel/app/Http/Controllers/ResetController.php` (skeleton)

**Interfaces:**
- Consumes: Task 4 (mock.auth middleware)
- Produces: route definitions + controller files with method stubs returning `response()->json(['error' => 'not implemented'], 501)`

- [ ] **Step 1: Créer `routes/api.php`**

```php
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\ColumnController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\ResetController;

// Public routes (no auth)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::post('/_reset', [ResetController::class, 'reset']);

// Protected routes
Route::middleware('mock.auth')->group(function () {
    // Users
    Route::get('/users/me', [UserController::class, 'me']);
    Route::put('/users/me', [UserController::class, 'updateMe']);
    Route::get('/users/{id}', [UserController::class, 'show']);

    // Boards
    Route::get('/boards', [BoardController::class, 'index']);
    Route::post('/boards', [BoardController::class, 'store']);
    Route::get('/boards/{board}', [BoardController::class, 'show']);
    Route::put('/boards/{board}', [BoardController::class, 'update']);
    Route::delete('/boards/{board}', [BoardController::class, 'destroy']);

    // Columns (reorder MUST be before {column})
    Route::put('/columns/reorder', [ColumnController::class, 'reorder']);
    Route::get('/boards/{board}/columns', [ColumnController::class, 'index']);
    Route::post('/boards/{board}/columns', [ColumnController::class, 'store']);
    Route::put('/columns/{column}', [ColumnController::class, 'update']);
    Route::delete('/columns/{column}', [ColumnController::class, 'destroy']);

    // Cards
    Route::post('/cards/reorder', [CardController::class, 'reorder']);
    Route::post('/cards/{card}/move', [CardController::class, 'move']);
    Route::get('/columns/{column}/cards', [CardController::class, 'index']);
    Route::post('/columns/{column}/cards', [CardController::class, 'store']);
    Route::get('/cards/{card}', [CardController::class, 'show']);
    Route::patch('/cards/{card}', [CardController::class, 'update']);
    Route::delete('/cards/{card}', [CardController::class, 'destroy']);

    // Labels
    Route::get('/boards/{board}/labels', [LabelController::class, 'index']);
    Route::post('/boards/{board}/labels', [LabelController::class, 'store']);
    Route::patch('/labels/{label}', [LabelController::class, 'update']);
    Route::delete('/labels/{label}', [LabelController::class, 'destroy']);

    // Comments
    Route::get('/cards/{card}/comments', [CommentController::class, 'index']);
    Route::post('/cards/{card}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Invitations + Members
    Route::get('/boards/{board}/invitations', [InvitationController::class, 'index']);
    Route::post('/boards/{board}/invitations', [InvitationController::class, 'store']);
    Route::patch('/invitations/{invitation}', [InvitationController::class, 'update']);
    Route::delete('/invitations/{invitation}', [InvitationController::class, 'destroy']);
    Route::delete('/boards/{board}/members/{member}', [InvitationController::class, 'removeMember']);
});
```

**Important** : Les routes `reorder` et `move` sont déclarées AVANT les routes paramétrées `{column}` et `{card}` pour éviter les conflits de routing.

- [ ] **Step 2: Créer les squelettes de contrôleurs**

Chaque contrôleur est créé avec toutes ses méthodes, retournant 501. Exemple pour `AuthController`:

```php
<?php
namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function login(Request $request): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function logout(): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }
}
```

Créer le même pattern pour tous les autres contrôleurs, chaque méthode retournant 501.

- [ ] **Step 3: Vérifier que les routes sont chargées**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel
php artisan route:list --path=api 2>&1 | head -40
```

Expected: 20 routes listées (19 API + 1 _reset), toutes avec préfixe `/api/`

- [ ] **Step 4: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/laravel/
git commit -m "feat(laravel): add API routes and controller skeletons"
```

---

### Task 6: Contrôleurs Auth + User + Reset

**Files:**
- Modify: `protask/guides/laravel/app/Http/Controllers/AuthController.php`
- Modify: `protask/guides/laravel/app/Http/Controllers/UserController.php`
- Modify: `protask/guides/laravel/app/Http/Controllers/ResetController.php`

**Interfaces:**
- Consumes: Task 5 (routes + skeleton), Task 2 (User model), Task 3 (DatabaseSeeder accessible via seeder)
- Produces: working auth flow (register, login, logout), user CRUD, reset endpoint

- [ ] **Step 1: Implémenter AuthController**

```php
<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return response()->json(['error' => 'Champs requis : name, email, password.'], 400);
        }

        $existing = User::where('email', $data['email'])->first();
        if ($existing) {
            return response()->json(['error' => 'Cet email est déjà utilisé.'], 400);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // plain text — mock API
            'avatar' => $data['avatar'] ?? '',
        ]);

        return response()->json([
            'user' => $user->toArray(),
            'token' => 'token-' . $user->id,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password'])) {
            return response()->json(['error' => 'Email et mot de passe requis.'], 400);
        }

        $user = User::where('email', $data['email'])->first();

        if (!$user || $user->password !== $data['password']) {
            return response()->json(['error' => 'Email ou mot de passe incorrect.'], 401);
        }

        return response()->json([
            'user' => $user->toArray(),
            'token' => 'token-' . $user->id,
        ]);
    }

    public function logout(): JsonResponse
    {
        return response()->json(['success' => true]);
    }
}
```

- [ ] **Step 2: Implémenter UserController**

```php
<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'Utilisateur introuvable.'], 404);
        }

        return response()->json($user->toArray());
    }

    public function updateMe(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'Utilisateur introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['avatar'])) $user->avatar = $data['avatar'];
        $user->save();

        return response()->json($user->toArray());
    }

    public function show(int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'Utilisateur introuvable.'], 404);
        }

        return response()->json($user->toArray());
    }
}
```

- [ ] **Step 3: Implémenter ResetController**

```php
<?php
namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Database\Seeders\DatabaseSeeder;

class ResetController extends Controller
{
    public function reset(): JsonResponse
    {
        DB::statement('PRAGMA foreign_keys = OFF');

        DB::table('comments')->delete();
        DB::table('cards')->delete();
        DB::table('labels')->delete();
        DB::table('invitations')->delete();
        DB::table('project_columns')->delete();
        DB::table('boards')->delete();
        DB::table('users')->delete();

        DB::statement('PRAGMA foreign_keys = ON');

        // Reset auto-increment
        DB::statement('DELETE FROM sqlite_sequence');

        $seeder = new DatabaseSeeder();
        $seeder->run();

        return response()->json(['success' => true]);
    }
}
```

**Note**: On désactive les contraintes de clés étrangères avant la suppression (SQLite ne supporte pas `TRUNCATE`), et on réinitialise les séquences d'auto-incrémentation.

- [ ] **Step 4: Tester le serveur**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel
php artisan serve --port=8000 &
sleep 2

# Test reset
curl -s -w "\nHTTP: %{http_code}" -X POST http://localhost:8000/api/_reset

# Test register
curl -s -w "\nHTTP: %{http_code}" -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123"}'

# Test login with demo user
curl -s -w "\nHTTP: %{http_code}" -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@protask.dev","password":"pass123"}'

kill %1 2>/dev/null
```

Expected: 200 for reset, 201 for register, 200 for login with user data and token

- [ ] **Step 5: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/laravel/
git commit -m "feat(laravel): implement Auth, User and Reset controllers"
```

---

### Task 7: Contrôleurs Board + Column

**Files:**
- Modify: `protask/guides/laravel/app/Http/Controllers/BoardController.php`
- Modify: `protask/guides/laravel/app/Http/Controllers/ColumnController.php`

**Interfaces:**
- Consumes: Task 6 (auth working), Task 2 (Board, ProjectColumn models)
- Produces: full CRUD for boards and columns, column reordering

- [ ] **Step 1: Implémenter BoardController**

```php
<?php
namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\ProjectColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $boards = Board::where('owner_id', $userId)
            ->orWhereJsonContains('member_ids', $userId)
            ->with('columns.cards')
            ->get();

        return response()->json($boards->toArray());
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $data = json_decode($request->getContent(), true);

        $board = Board::create([
            'title' => $data['title'] ?? '',
            'owner_id' => $userId,
            'description' => $data['description'] ?? '',
            'color' => $data['color'] ?? '#3B82F6',
            'categories' => $data['categories'] ?? [],
            'member_ids' => [],
        ]);

        // Auto-create default columns
        ProjectColumn::create(['title' => 'Backlog', 'order_column' => 0, 'board_id' => $board->id, 'color' => '#6B7280']);
        ProjectColumn::create(['title' => 'En cours', 'order_column' => 1, 'board_id' => $board->id, 'color' => '#3B82F6']);
        ProjectColumn::create(['title' => 'Terminé', 'order_column' => 2, 'board_id' => $board->id, 'color' => '#10B981']);

        return response()->json($board->fresh()->toArray(), 201);
    }

    public function show(int $id): JsonResponse
    {
        $board = Board::with('columns.cards.comments', 'columns.cards.assignee')->find($id);

        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = $board->toArray();
        $data['columns'] = $board->columns->sortBy('order_column')->values()->map(fn($c) => $c->toArray());
        $data['members'] = $board->getMembers();

        return response()->json($data);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $board = Board::find($id);

        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $board->title = $data['title'];
        if (isset($data['description'])) $board->description = $data['description'];
        if (isset($data['color'])) $board->color = $data['color'];
        if (isset($data['categories'])) $board->categories = $data['categories'];
        $board->save();

        return response()->json($board->fresh()->toArray());
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $board = Board::find($id);

        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $userId = $request->attributes->get('_user_id');
        if ($board->owner_id !== $userId) {
            return response()->json(['error' => 'Seul le propriétaire peut supprimer ce board.'], 403);
        }

        $board->delete();
        return response()->json(null, 204);
    }
}
```

- [ ] **Step 2: Implémenter ColumnController**

```php
<?php
namespace App\Http\Controllers;

use App\Models\ProjectColumn;
use App\Models\Board;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ColumnController extends Controller
{
    public function index(int $boardId): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $columns = ProjectColumn::where('board_id', $boardId)
            ->orderBy('order_column')
            ->get();

        return response()->json($columns->toArray());
    }

    public function store(int $boardId, Request $request): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        $maxOrder = ProjectColumn::where('board_id', $boardId)->max('order_column') ?? -1;

        $column = ProjectColumn::create([
            'title' => $data['title'] ?? '',
            'order_column' => $maxOrder + 1,
            'board_id' => $boardId,
            'color' => $data['color'] ?? '#6B7280',
            'description' => $data['description'] ?? '',
        ]);

        return response()->json($column->toArray(), 201);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return response()->json(['error' => 'Format invalide.'], 400);
        }

        foreach ($data as $item) {
            if (isset($item['id']) && isset($item['order'])) {
                ProjectColumn::where('id', $item['id'])->update(['order_column' => $item['order']]);
            }
        }

        $columns = ProjectColumn::orderBy('order_column')->get();
        return response()->json($columns->toArray());
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $column = ProjectColumn::find($id);

        if (!$column) {
            return response()->json(['error' => 'Colonne introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $column->title = $data['title'];
        if (isset($data['color'])) $column->color = $data['color'];
        if (isset($data['description'])) $column->description = $data['description'];
        $column->save();

        return response()->json($column->toArray());
    }

    public function destroy(int $id): JsonResponse
    {
        $column = ProjectColumn::find($id);

        if (!$column) {
            return response()->json(['error' => 'Colonne introuvable.'], 404);
        }

        $column->delete();
        return response()->json(null, 204);
    }
}
```

- [ ] **Step 3: Tester les boards/colonnes**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel

# Reset + get token
curl -s -X POST http://localhost:8000/api/_reset
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@protask.dev","password":"pass123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

# List boards
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/boards | head -c 200

kill %1 2>/dev/null
```

Expected: board list with 2+ boards, each with columns and cardCount

- [ ] **Step 4: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/laravel/
git commit -m "feat(laravel): implement Board and Column controllers"
```

---

### Task 8: Contrôleurs Card + Label + Comment + Invitation

**Files:**
- Modify: `protask/guides/laravel/app/Http/Controllers/CardController.php`
- Modify: `protask/guides/laravel/app/Http/Controllers/LabelController.php`
- Modify: `protask/guides/laravel/app/Http/Controllers/CommentController.php`
- Modify: `protask/guides/laravel/app/Http/Controllers/InvitationController.php`

**Interfaces:**
- Consumes: Task 7 (Board/Column working), models from Task 2
- Produces: full 19-route API implementation

- [ ] **Step 1: Implémenter CardController**

```php
<?php
namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\ProjectColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function index(int $columnId): JsonResponse
    {
        $column = ProjectColumn::find($columnId);
        if (!$column) {
            return response()->json(['error' => 'Colonne introuvable.'], 404);
        }

        $cards = Card::where('column_id', $columnId)
            ->with('assignee', 'comments.author')
            ->orderBy('order_column')
            ->get();

        return response()->json($cards->toArray());
    }

    public function store(int $columnId, Request $request): JsonResponse
    {
        $column = ProjectColumn::find($columnId);
        if (!$column) {
            return response()->json(['error' => 'Colonne introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['title'])) {
            return response()->json(['error' => 'Le titre est requis.'], 400);
        }

        $maxOrder = Card::where('column_id', $columnId)->max('order_column') ?? -1;

        $card = Card::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'order_column' => $maxOrder + 1,
            'column_id' => $columnId,
            'due_date' => $data['dueDate'] ?? null,
            'assignee_id' => $data['assigneeId'] ?? null,
            'label_ids' => $data['labelIds'] ?? [],
        ]);

        return response()->json($card->load('assignee', 'comments.author')->toArray(), 201);
    }

    public function show(int $id): JsonResponse
    {
        $card = Card::with('assignee', 'comments.author')->find($id);

        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        return response()->json($card->toArray());
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $card = Card::with('assignee', 'comments.author')->find($id);

        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $card->title = $data['title'];
        if (isset($data['description'])) $card->description = $data['description'];
        if (isset($data['dueDate'])) $card->due_date = $data['dueDate'];
        if (isset($data['assigneeId'])) $card->assignee_id = $data['assigneeId'];
        if (isset($data['labelIds'])) $card->label_ids = $data['labelIds'];
        $card->save();

        return response()->json($card->fresh()->load('assignee', 'comments.author')->toArray());
    }

    public function destroy(int $id): JsonResponse
    {
        $card = Card::find($id);

        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        $card->delete();
        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return response()->json(['error' => 'Format invalide.'], 400);
        }

        foreach ($data as $item) {
            if (isset($item['id']) && isset($item['order'])) {
                Card::where('id', $item['id'])->update(['order_column' => $item['order']]);
            }
        }

        return response()->json(['success' => true]);
    }

    public function move(int $id, Request $request): JsonResponse
    {
        $card = Card::find($id);

        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['columnId'])) {
            $card->column_id = $data['columnId'];
        }

        if (isset($data['order'])) {
            $card->order_column = $data['order'];
        }

        $card->save();

        return response()->json($card->load('assignee', 'comments.author')->toArray());
    }
}
```

- [ ] **Step 2: Implémenter LabelController**

```php
<?php
namespace App\Http\Controllers;

use App\Models\Label;
use App\Models\Board;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(int $boardId): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        return response()->json(Label::where('board_id', $boardId)->get()->toArray());
    }

    public function store(int $boardId, Request $request): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['name'])) {
            return response()->json(['error' => 'Le nom est requis.'], 400);
        }

        $label = Label::create([
            'name' => $data['name'],
            'color' => $data['color'] ?? '#3B82F6',
            'board_id' => $boardId,
            'description' => $data['description'] ?? '',
        ]);

        return response()->json($label->toArray(), 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $label = Label::find($id);

        if (!$label) {
            return response()->json(['error' => 'Label introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) $label->name = $data['name'];
        if (isset($data['color'])) $label->color = $data['color'];
        if (isset($data['description'])) $label->description = $data['description'];
        $label->save();

        return response()->json($label->toArray());
    }

    public function destroy(int $id): JsonResponse
    {
        $label = Label::find($id);

        if (!$label) {
            return response()->json(['error' => 'Label introuvable.'], 404);
        }

        $label->delete();
        return response()->json(null, 204);
    }
}
```

- [ ] **Step 3: Implémenter CommentController**

```php
<?php
namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Card;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(int $cardId): JsonResponse
    {
        $card = Card::find($cardId);
        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        return response()->json(
            Comment::where('card_id', $cardId)->with('author')->get()->toArray()
        );
    }

    public function store(int $cardId, Request $request): JsonResponse
    {
        $card = Card::find($cardId);
        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['text'])) {
            return response()->json(['error' => 'Le texte est requis.'], 400);
        }

        $userId = $request->attributes->get('_user_id');

        $comment = Comment::create([
            'text' => $data['text'],
            'author_id' => $userId,
            'card_id' => $cardId,
        ]);

        return response()->json($comment->load('author')->toArray(), 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['error' => 'Commentaire introuvable.'], 404);
        }

        $comment->delete();
        return response()->json(null, 204);
    }
}
```

- [ ] **Step 4: Implémenter InvitationController**

```php
<?php
namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Board;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function index(int $boardId): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        return response()->json(
            Invitation::where('board_id', $boardId)->get()->toArray()
        );
    }

    public function store(int $boardId, Request $request): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json(['error' => 'Email invalide.'], 400);
        }

        $userId = $request->attributes->get('_user_id');

        if ($board->owner_id === $userId) {
            $invitedUser = User::where('email', $email)->first();
            if ($invitedUser && $invitedUser->id === $userId) {
                return response()->json(['error' => 'Vous ne pouvez pas vous inviter vous-même.'], 400);
            }
        }

        $invitedUser = User::where('email', $email)->first();
        if (!$invitedUser) {
            return response()->json(['error' => 'Utilisateur non trouvé.'], 404);
        }

        $existing = Invitation::where('board_id', $boardId)
            ->where('email', $email)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['error' => 'Une invitation est déjà en attente pour cet email.'], 400);
        }

        $invitation = Invitation::create([
            'board_id' => $boardId,
            'email' => $email,
            'invited_by_id' => $userId,
            'status' => 'pending',
        ]);

        return response()->json($invitation->toArray(), 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $invitation = Invitation::find($id);

        if (!$invitation) {
            return response()->json(['error' => 'Invitation introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $status = $data['status'] ?? '';
        $userId = $request->attributes->get('_user_id');

        $invitedUser = User::where('email', $invitation->email)->first();

        if ($status === 'accepted' || $status === 'declined') {
            if (!$invitedUser || $invitedUser->id !== $userId) {
                return response()->json(['error' => 'Vous ne pouvez pas répondre à cette invitation.'], 403);
            }
        }

        if ($status === 'accepted') {
            $board = Board::find($invitation->board_id);
            if ($board) {
                $memberIds = $board->member_ids ?? [];
                if (!in_array($invitedUser->id, $memberIds)) {
                    $memberIds[] = $invitedUser->id;
                    $board->member_ids = $memberIds;
                    $board->save();
                }
            }
        }

        $invitation->status = $status;
        $invitation->save();

        return response()->json($invitation->toArray());
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $invitation = Invitation::find($id);

        if (!$invitation) {
            return response()->json(['error' => 'Invitation introuvable.'], 404);
        }

        $invitation->delete();
        return response()->json(null, 204);
    }

    public function removeMember(int $boardId, int $memberId, Request $request): JsonResponse
    {
        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $userId = $request->attributes->get('_user_id');

        if ($board->owner_id !== $userId) {
            return response()->json(['error' => 'Seul le propriétaire peut retirer un membre.'], 403);
        }

        $memberIds = $board->member_ids ?? [];
        $board->member_ids = array_values(array_filter($memberIds, fn($id) => $id != $memberId));
        $board->save();

        return response()->json(null, 204);
    }
}
```

- [ ] **Step 5: Tester le serveur complet**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel
php artisan serve --port=8000 &
sleep 2

# Quick smoke test of all endpoints
curl -s -X POST http://localhost:8000/api/_reset > /dev/null

# Register
echo "=== Register ==="
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@protask.dev","password":"pass123"}' | head -c 100

# Login
echo -e "\n=== Login ==="
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@protask.dev","password":"pass123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

# List boards
echo -e "\n=== Boards ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/boards | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d)} boards')"

# Get board 1 with columns
echo -e "\n=== Board 1 ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/boards/1 | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{d[\"title\"]}: {len(d[\"columns\"])} columns, {d[\"cardCount\"]} cards')"

kill %1 2>/dev/null
```

Expected: All endpoints return correct data with proper status codes

- [ ] **Step 6: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/laravel/
git commit -m "feat(laravel): implement Card, Label, Comment and Invitation controllers"
```

---

### Task 9: Initialisation DB + tests e2e

**Files:**
- Modify: `protask/guides/laravel/.env` (confirm SQLite path)

**Interfaces:**
- Consumes: Task 8 (all controllers working)
- Produces: database seeded, server running, 53/53 tests passing

- [ ] **Step 1: Réinitialiser la base de données**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel
rm -f database/database.sqlite
touch database/database.sqlite
php artisan migrate --force 2>&1
php artisan db:seed --force 2>&1
```

- [ ] **Step 2: Démarrer le serveur Laravel**

```bash
cd /home/warol52/WORK/projects-ideas/protask/guides/laravel
php artisan serve --port=8000 2>&1 &
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/_reset -X POST
```

Expected: `200`

- [ ] **Step 3: Lancer les 53 tests e2e**

```bash
cd /home/warol52/WORK/projects-ideas
API_BASE_URL=http://localhost:8000/api pnpm test:api 2>&1
```

Expected: "Test Files 1 passed (1), Tests 53 passed (53)"

If tests fail, debug by checking:
- Route ordering (reorder/move before {id}/{card})
- JSON response format matches `toArray()` exactly (camelCase keys)
- `_reset` empties and reseeds correctly

- [ ] **Step 4: Arrêter le serveur et commit**

```bash
kill %1 2>/dev/null
git add protask/guides/laravel/
git commit -m "feat(laravel): database init and e2e validation (53/53)"
```

---

### Task 10: Rédiger le guide index.md

**Files:**
- Create: `protask/guides/laravel/index.md`

**Interfaces:**
- Consumes: all prior tasks (full working project to document)

- [ ] **Step 1: Écrire le guide**

`protask/guides/laravel/index.md` — structure (10 sections, ~600-800 lignes, en français) :

```markdown
# Guide d'implémentation Laravel pour ProTask

> **Objectif** : Implémenter les 19 routes de l'API ProTask avec Laravel 12, étape par étape.

**Prérequis** : PHP 8.2+, Composer, SQLite

**Durée estimée** : 2-3 heures

---

## 1. Setup

[composer create-project, .env, SQLite]

## 2. Structure du projet

[arborescence complète, explication des dossiers]

## 3. Migrations et modèles

[7 migrations, 7 Eloquent models, relations, casts JSON]

## 4. Données de démonstration

[DatabaseSeeder avec 3 users, 3 boards, 8 colonnes, 10 cartes...]

## 5. Authentification

[MockAuth middleware, extraction Bearer token-{id}]

## 6. Routes

[routes/api.php, groupement middleware, ordre important]

## 7. Contrôleurs

[9 contrôleurs, pattern de chaque ressource, réponses JSON]

## 8. Reset

[POST /api/_reset, désactivation FK, DELETE ordonné, reseed]

## 9. Tests

[53 tests e2e, commande de validation]

## 10. Déploiement

[.env.production, sqlite droits, nginx/php-fpm]
```

Remplir chaque section avec :
- Explication du concept (quoi et pourquoi)
- Bloc de code montrant les fichiers clés (pas le fichier entier)
- Commandes shell pour reproduire
- Pièges à éviter (ordre des routes, `order_column`, JSON casts)

- [ ] **Step 2: Vérifier la longueur du guide**

```bash
wc -l /home/warol52/WORK/projects-ideas/protask/guides/laravel/index.md
```

Expected: ~600-800 lines

- [ ] **Step 3: Commit**

```bash
cd /home/warol52/WORK/projects-ideas
git add protask/guides/laravel/index.md
git commit -m "docs(laravel): add implementation guide index.md"
```

---

### Task 11: Script de test dans package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Ajouter le script `test:guide:laravel`**

```bash
cd /home/warol52/WORK/projects-ideas
# Read current package.json
cat package.json | python3 -c "
import sys, json
pkg = json.load(sys.stdin)
pkg['scripts']['test:guide:laravel'] = 'API_BASE_URL=http://localhost:8000/api vitest run protask/api/e2e.spec.js'
print(json.dumps(pkg, indent=2))
" > /tmp/pkg.json && mv /tmp/pkg.json package.json
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "feat: add test:guide:laravel script to package.json"
```

---

## Self-Review

### 1. Spec coverage
- Setup Laravel project → Task 1
- 7 migrations + 7 Eloquent models → Task 2
- Seed data (3 users, 3 boards, 8 columns, 10 cards, 4 labels, 5 comments, 2 invitations) → Task 3
- Auth middleware (Bearer token-{id}) → Task 4
- 19 API routes + _reset → Task 5
- Auth CRUD (register, login, logout) → Task 6
- User CRUD (me, updateMe, show) → Task 6
- Board CRUD (index, store, show, update, destroy) → Task 7
- Column CRUD + reorder → Task 7
- Card CRUD + reorder + move → Task 8
- Label CRUD → Task 8
- Comment CRUD → Task 8
- Invitation CRUD + removeMember → Task 8
- Reset endpoint → Task 6
- 53/53 tests passing → Task 9
- Guide index.md → Task 10
- package.json script → Task 11
- SQLite config → Task 1
- `order` reserved keyword handled → Task 2 (order_column)
- Password excluded from responses → Task 2 (User model `$hidden`)
- Board creation auto-creates 3 columns → Task 7 (store method)
- Owner-only board deletion → Task 7 (destroy method)
- Invitation acceptance adds to member_ids → Task 8 (update method)

### 2. Placeholder scan
No placeholders found — every step has complete code and commands.

### 3. Type consistency
- `order_column` used consistently across migration, model, and controller
- `toArray()` returns camelCase keys matching OpenAPI spec
- `_user_id` retrieved from `$request->attributes->get('_user_id')` everywhere
- `$board->member_ids` cast as array, checked with `?? []` on reads
- All controllers extend `Controller` base class
- All JSON responses use `response()->json()`
