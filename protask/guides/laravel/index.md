# Guide d'implémentation Laravel pour ProTask

> **Objectif** : Implémenter les 19 routes de l'API ProTask avec Laravel 13, étape par étape.

**Prérequis** : PHP 8.3+, Composer, SQLite

**Connaissances** : Bases de PHP, notions de MVC.

**Durée estimée** : 2-3 heures

---

## 1. Setup

```bash
composer create-project laravel/laravel protask-api
cd protask-api
```

Laravel 13 utilise SQLite par défaut. Le `.env` est déjà prêt :

```env
APP_NAME=ProTask
APP_ENV=dev
DB_CONNECTION=sqlite
CACHE_STORE=array
```

Générez la clé et lancez le serveur :

```bash
php artisan key:generate
php artisan serve
```

> **Note** : Symfony utilise des fichiers YAML dans `config/packages/`. Laravel centralise tout dans `config/` (PHP) et `.env`.

---

## 2. Structure du projet

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php     ← register/login/logout
│   │   ├── BoardController.php    ← CRUD boards
│   │   ├── CardController.php     ← CRUD cards + reorder/move
│   │   ├── ColumnController.php   ← CRUD columns + reorder
│   │   ├── CommentController.php  ← CRUD comments
│   │   ├── InvitationController.php ← invitations + removeMember
│   │   ├── LabelController.php    ← CRUD labels
│   │   ├── ResetController.php    ← POST /api/_reset
│   │   └── UserController.php     ← me / updateMe / show
│   └── Middleware/
│       └── MockAuth.php           ← Auth mockée
├── Models/
│   ├── Board.php
│   ├── Card.php
│   ├── Comment.php
│   ├── Invitation.php
│   ├── Label.php
│   ├── ProjectColumn.php
│   └── User.php
├── bootstrap/app.php              ← Enregistrement middleware
├── database/
│   ├── migrations/                ← 7 fichiers
│   └── seeders/DatabaseSeeder.php
└── routes/api.php                 ← Toutes les routes
```

Contrairement à Symfony où entités et repositories sont dans des dossiers séparés, Eloquent fusionne les deux dans `app/Models/`. Un modèle Eloquent = une table + ses requêtes.

---

## 3. Migrations et modèles

### Concept : Eloquent vs Doctrine

| Doctrine (Symfony) | Eloquent (Laravel) |
|---|---|
| *Data Mapper* | *Active Record* |
| Entités POPO, repositories séparés | Modèle = accès aux données |
| `$em->persist($u) + $em->flush()` | `User::create([...])` ou `$user->save()` |
| `$repo->find($id)` | `User::find($id)` |

Plus concis, moins de fichiers. Pour une mock API JSON, c'est idéal.

### Les 7 migrations

Chaque migration est une classe PHP retournée par `new class`. L'ordre des timestamps détermine l'exécution :

```
000001_create_users_table.php
000002_create_boards_table.php
000003_create_project_columns_table.php
000004_create_cards_table.php
000005_create_labels_table.php
000006_create_comments_table.php
000007_create_invitations_table.php
```

**Exemple : migration des boards**

```php
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
```

- `constrained('users')` crée la clé étrangère + index
- `json()` stocke en TEXT sous SQLite, mais Eloquent le caste automatiquement en tableau PHP
- `timestamps()` ajoute `created_at` et `updated_at`

**Exemple : migration des cards**

```php
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
```

> **Pourquoi `order_column` et pas `order` ?** `order` est un mot réservé SQL (clause `ORDER BY`). On le préfixe. Le `toArray()` le renommera en `order` pour l'API.

### Les 7 modèles Eloquent

**User** — étend `Authenticatable`, pas `Model` :

```php
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

- `$fillable` : champs autorisés pour l'*mass assignment* (sécurité)
- `$hidden` : exclut `password` de la sérialisation
- `toArray()` : retourne des clés **camelCase** conformes à l'OpenAPI spec

**Board** — JSON casts + relations :

```php
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

    public function getMembers(): array
    {
        // Rassemble owner + membres du tableau member_ids
    }
}
```

La méthode `casts()` associe chaque colonne JSON à son type PHP. Eloquent convertit automatiquement à la lecture et l'écriture — plus besoin de `json_decode()` manuel.

**ProjectColumn** — attention au renommage dans `toArray()` :

```php
class ProjectColumn extends Model
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'order' => $this->order_column,    // snake_case en DB → camelCase dans l'API
            'boardId' => $this->board_id,
            // ...
        ];
    }
}
```

**Card** — modèle le plus riche :

```php
class Card extends Model
{
    protected $fillable = ['title', 'description', 'order_column', 'column_id',
                           'due_date', 'assignee_id', 'label_ids'];

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
            'labels' => $this->label_ids
                ? Label::whereIn('id', $this->label_ids)->get()->toArray()
                : [],
            'comments' => $this->comments->map(fn($c) => $c->toArray()),
        ];
    }
}
```

**Les relations Eloquent :**

| Déclaration | Type SQL | Exemple |
|---|---|---|
| `$this->belongsTo(User::class, 'owner_id')` | Clé étrangère locale | Board → User |
| `$this->hasMany(ProjectColumn::class)` | Clé étrangère distante | Board → Column |
| `$this->hasMany(Comment::class)` | Clé étrangère distante | Card → Comment |

---

## 4. Données de démonstration

Le `DatabaseSeeder` peuple la base via `php artisan db:seed` (ou `--seed` avec migrate).

```php
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $alex = User::create(['name' => 'Alexandre', 'email' => 'alex@protask.dev', 'password' => 'pass123']);
        $sophie = User::create(['name' => 'Sophie', 'email' => 'sophie@protask.dev', 'password' => 'pass123']);
        $marc = User::create(['name' => 'Marc', 'email' => 'marc@protask.dev', 'password' => 'pass123']);

        $board1 = Board::create([
            'title' => 'Design System', 'owner_id' => 1,
            'categories' => ['Design', 'UI/UX'],
            'member_ids' => [2, 3],
        ]);
        ProjectColumn::create(['title' => 'Backlog', 'order_column' => 0, 'board_id' => 1]);
        // ...
    }
}
```

Contenu du seeder :

| Entité | Quantité | Détails |
|---|---|---|
| Users | 3 | Alexandre, Sophie, Marc |
| Boards | 3 | Design System, Refonte Mobile, Marketing Q2 |
| Colonnes | 8 | Backlog/En cours/Terminé ×2, Idées/En production |
| Cartes | 10 | Réparties, avec assignees et label_ids |
| Labels | 4 | Design, Dev, Documentation, Urgent |
| Commentaires | 5 | Sur les cartes 1, 2, 3 |
| Invitations | 2 | 1 acceptée (Marc), 1 en attente (Julie) |

- Les IDs sont explicites car l'ordre de création est connu
- `password` est en clair (mock API, pas de vrai hash bcrypt nécessaire)
- Les colonnes JSON (`categories`, `member_ids`) reçoivent des tableaux PHP — Eloquent les sérialise automatiquement

---

## 5. Authentification

ProTask utilise une auth **mockée** : header `Authorization: Bearer token-{userId}`, pas de JWT ni session.

### Le middleware MockAuth

```php
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

1. Extrait le header `Authorization`
2. Vérifie le format `Bearer token-{id}`
3. Stocke `$userId` dans les attributs de la requête
4. Passe au contrôleur suivant

### Enregistrement

Dans Laravel 11+, les middlewares s'enregistrent via `bootstrap/app.php` :

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(api: __DIR__.'/../routes/api.php')
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'mock.auth' => MockAuth::class,
        ]);
    })
    ->create();
```

L'alias `'mock.auth'` s'utilise dans les routes : `Route::middleware('mock.auth')->group(...)`.

> **Différence Symfony** : les middlewares Symfony se déclarent dans `config/packages/security.yaml` ou via des attributs. Laravel utilise `bootstrap/app.php` avec `withMiddleware()`.

---

## 6. Routes

Fichier `routes/api.php` — les routes sont automatiquement préfixées par `/api` par Laravel.

```php
// Publiques (pas de auth)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::post('/_reset', [ResetController::class, 'reset']);

// Protégées
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

    // Columns — reorder DOIT être avant {column}
    Route::put('/columns/reorder', [ColumnController::class, 'reorder']);
    Route::get('/boards/{board}/columns', [ColumnController::class, 'index']);
    Route::post('/boards/{board}/columns', [ColumnController::class, 'store']);
    Route::put('/columns/{column}', [ColumnController::class, 'update']);
    Route::delete('/columns/{column}', [ColumnController::class, 'destroy']);

    // Cards — pareil : reorder et move avant {card}
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

### Piège : l'ordre des routes

```php
Route::put('/columns/reorder', ...);   // Si {column} arrivait AVANT reorder,
Route::put('/columns/{column}', ...);   // Laravel interpréterait "reorder" comme un ID
```

Les routes **statiques** (`reorder`, `move`) doivent toujours être déclarées **avant** les routes paramétrées (`{column}`, `{card}`). Même règle qu'avec les attributs `@Route` de Symfony.

---

## 7. Contrôleurs

Les 9 contrôleurs suivent un pattern CRUD standard : recevoir la requête, interagir avec Eloquent, retourner `JsonResponse`.

### AuthController — 3 routes publiques

```php
class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return response()->json(['error' => 'Champs requis.'], 400);
        }

        $existing = User::where('email', $data['email'])->first();
        if ($existing) {
            return response()->json(['error' => 'Email déjà utilisé.'], 400);
        }

        $user = User::create([
            'name' => $data['name'], 'email' => $data['email'],
            'password' => $data['password'], 'avatar' => $data['avatar'] ?? '',
        ]);

        return response()->json([
            'user' => $user->toArray(),
            'token' => 'token-' . $user->id,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        // Vérifie email + password en clair
        $user = User::where('email', $data['email'])->first();
        if (!$user || $user->password !== $data['password']) {
            return response()->json(['error' => 'Email ou mot de passe incorrect.'], 401);
        }
        return response()->json(['user' => $user->toArray(), 'token' => 'token-'.$user->id]);
    }

    public function logout(): JsonResponse
    {
        return response()->json(['success' => true]);
    }
}
```

**Pourquoi la validation manuelle ?** L'OpenAPI spec attend `{"error": "message"}`. `$request->validate()` retournerait `{"message": "...", "errors": {...}}` avec un code 422.

### BoardController — CRUD avec accès utilisateur

```php
class BoardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');

        $boards = Board::where('owner_id', $userId)
            ->orWhereJsonContains('member_ids', $userId)
            ->with('columns.cards')
            ->get();

        return response()->json(
            $boards->map(fn($b) => array_merge($b->toArray(), ['members' => $b->getMembers()]))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $board = Board::create(['title' => $data['title'], 'owner_id' => $userId, ...]);
        // 3 colonnes par défaut
        ProjectColumn::create(['title' => 'Backlog', 'order_column' => 0, 'board_id' => $board->id]);
        ProjectColumn::create(['title' => 'En cours', 'order_column' => 1, 'board_id' => $board->id]);
        ProjectColumn::create(['title' => 'Terminé', 'order_column' => 2, 'board_id' => $board->id]);
        return response()->json($board->fresh()->toArray(), 201);
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $board = Board::find($id);
        if ($board->owner_id !== $userId) {
            return response()->json(['error' => 'Seul le propriétaire peut supprimer.'], 403);
        }
        $board->delete();
        return response()->json(null, 204);
    }
}
```

`orWhereJsonContains('member_ids', $userId)` est une méthode Eloquent qui génère `JSON_CONTAINS` — spécifique aux colonnes JSON.

### ColumnController — reorder

```php
public function reorder(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    // $data = [['id' => 3, 'order' => 0], ['id' => 1, 'order' => 1]]
    foreach ($data as $item) {
        if (isset($item['id']) && isset($item['order'])) {
            ProjectColumn::where('id', $item['id'])->update(['order_column' => $item['order']]);
        }
    }
    return response()->json(ProjectColumn::orderBy('order_column')->get()->toArray());
}
```

### CardController — move + reorder

```php
public function move(int $id, Request $request): JsonResponse
{
    $card = Card::find($id);
    $data = json_decode($request->getContent(), true);
    if (isset($data['columnId'])) $card->column_id = $data['columnId'];
    if (isset($data['order'])) $card->order_column = $data['order'];
    $card->save();
    return response()->json($card->load('assignee', 'comments.author')->toArray());
}
```

Les méthodes `move()` et `reorder()` sont spécifiques à ProTask : elles permettent le Drag & Drop dans le template Kanban.

### LabelController, CommentController, InvitationController

Patterns spécifiques :

- **Label** : toujours lié à un `board_id` passé en URL
- **Comment** : `author_id` récupéré depuis `$request->attributes->get('_user_id')` (le middleware)
- **Invitation** : l'`update` avec `status: accepted` ajoute l'utilisateur aux `member_ids` du board
- **removeMember** : retire un ID du tableau JSON `member_ids`

### UserController

```php
class UserController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        return response()->json(User::find($userId)->toArray());
    }

    public function updateMe(Request $request): JsonResponse
    {
        $user = User::find($request->attributes->get('_user_id'));
        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['avatar'])) $user->avatar = $data['avatar'];
        $user->save();
        return response()->json($user->toArray());
    }

    public function show(int $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) return response()->json(['error' => 'Utilisateur introuvable.'], 404);
        return response()->json($user->toArray());
    }
}
```

### Patterns de réponses

| Code | Usage | Exemple |
|---|---|---|
| `200` | Succès GET/PUT | `response()->json($data)` |
| `201` | Création POST | `response()->json($data, 201)` |
| `204` | Suppression DELETE | `response()->json(null, 204)` |
| `400` | Erreur validation | `response()->json(['error' => '...'], 400)` |
| `401` | Non authentifié | `response()->json(['error' => '...'], 401)` |
| `403` | Non autorisé | `response()->json(['error' => '...'], 403)` |
| `404` | Ressource introuvable | `response()->json(['error' => '...'], 404)` |

---

## 8. Reset

Route **interne** (pas dans l'OpenAPI) : `POST /api/_reset`. Remet la base à l'état initial pour les tests.

```php
class ResetController extends Controller
{
    public function reset(): JsonResponse
    {
        DB::statement('PRAGMA foreign_keys = OFF');

        // Ordre inverse des dépendances
        DB::table('comments')->delete();
        DB::table('cards')->delete();
        DB::table('labels')->delete();
        DB::table('invitations')->delete();
        DB::table('project_columns')->delete();
        DB::table('boards')->delete();
        DB::table('users')->delete();

        DB::statement('PRAGMA foreign_keys = ON');
        DB::statement('DELETE FROM sqlite_sequence');  // Reset auto-increment

        (new DatabaseSeeder())->run();
        return response()->json(['success' => true]);
    }
}
```

**Pourquoi `PRAGMA foreign_keys = OFF` ?** SQLite désactive les contraintes par défaut, mais si elles sont actives, la suppression dans le désordre échoue. On les désactive temporairement.

**Pourquoi `DELETE FROM sqlite_sequence` ?** SQLite stocke le dernier auto-increment dans une table interne. Sans cette suppression, le prochain INSERT reprendrait à l'ancien maximum au lieu de 1.

**Ordre de suppression** : enfants avant parents — comments → cards → labels → invitations → project_columns → boards → users.

---

## 9. Tests

Configuration `phpunit.xml` :

```xml
<php>
    <env name="DB_CONNECTION" value="sqlite"/>
    <env name="DB_DATABASE" value=":memory:"/>
    <env name="CACHE_STORE" value="array"/>
</php>
```

Base SQLite en mémoire (`:memory:`) — chaque session de test démarre propre. Les migrations sont exécutées automatiquement au début des tests avec `RefreshDatabase` ou manuellement via `Artisan::call('migrate')`.

```bash
# Lancer tous les tests
php artisan test

# Lancer un fichier
php artisan test --filter=BoardTest
```

53 tests e2e couvrent :
- Authentification (register, login, logout, token invalide)
- CRUD complet de chaque ressource (board, column, card, label, comment, invitation)
- Cas d'erreur (404, 401, 403, 400)
- Opérations spécifiques (reorder, move, removeMember)
- Reset (`POST /api/_reset`)

---

## 10. Déploiement

### Préparation

```bash
# .env.production
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=sqlite
CACHE_STORE=file
```

### Permissions SQLite

```bash
touch database/database.sqlite
chmod 664 database/database.sqlite
```

### Optimisations Laravel

```bash
php artisan config:cache
php artisan route:cache
composer install --no-dev --optimize-autoloader
php artisan migrate --seed
```

### Config nginx minimale

```nginx
server {
    listen 80;
    root /var/www/protask-api/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

Le point d'entrée est `public/index.php` (généré par Laravel). Tout le routage passe par lui.

---

## Résumé

**19 routes API**, **7 migrations**, **7 modèles Eloquent**, **9 contrôleurs**, **1 middleware**, **53 tests**.

### Points clés à retenir

1. **Eloquent = Active Record** — pas de repository, pas d'EntityManager. Le modèle EST la requête.
2. **JSON casts** — `casts()` convertit automatiquement les colonnes JSON en tableaux PHP.
3. **`order_column`** — éviter `order` (mot réservé SQL), renommer via `toArray()`.
4. **Ordre des routes** — `reorder`/`move` avant `{column}`/`{card}`.
5. **Middleware dans `bootstrap/app.php`** — Laravel 11+ utilise `withMiddleware()`.
6. **`toArray()` en camelCase** — chaque modèle surcharge pour correspondre à l'OpenAPI spec.
7. **Reset SQLite** — `PRAGMA foreign_keys = OFF`, vider `sqlite_sequence`, reseed.

### Pour aller plus loin

- Guide Symfony : `protask/guides/symfony/index.md`
- Templates ProTask : `protask/templates/`
- Spec OpenAPI : `protask/docs/openapi.json`
