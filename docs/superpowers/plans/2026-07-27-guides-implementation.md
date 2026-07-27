# Guides d'implémentation par framework — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter des guides d'implémentation pédagogiques (projet complet + guide Markdown) pour chaque framework, en commençant par Symfony, avec une infrastructure de test mutualisée via `API_BASE_URL`.

**Architecture:** Chaque guide est un sous-dossier `protask/guides/{framework}/` contenant un `index.md` (guide pas-à-pas) et un projet complet exécutable. La batterie de tests `protask/api/e2e.spec.js` est refactorée pour accepter `API_BASE_URL` et pouvoir valider n'importe quel guide. Symfony est le premier guide (pilote), servant de template structurel pour tous les suivants.

**Tech Stack:** Vitest (tests API), Hono (mock API de référence), Symfony 7.2 (premier guide avec PHP 8.2+, Doctrine, Fixtures)

## Global Constraints

- Le glossaire dans `CONTEXT.md` est la source de vérité pour la terminologie (Guide, Template, Mock API, Projet, etc.)
- `server.js` reste l'implémentation de référence mono-fichier Hono — ne pas supprimer
- Tous les guides sont en français
- Chaque guide suit le plan type: Setup → Structure → Modèles → Routes → Auth → Tests → Déploiement
- Chaque guide doit produire un serveur validable par `protask/api/e2e.spec.js` via `API_BASE_URL`
- L'ADR `docs/adr/0002-guides-projets-complets.md` documente la décision architecturale
- Tous les tests API utilisent les helpers `get()`, `post()`, `put()`, `patch()`, `del()` définis dans `e2e.spec.js`
- L'authentification simulée utilise le header `Authorization: Bearer token-{userId}`
- `POST /api/_reset` réinitialise les données en mémoire à l'état initial des fixtures

---

### Task 1: Refactorer e2e.spec.js pour API_BASE_URL

**Files:**
- Modify: `protask/api/e2e.spec.js`

**Interfaces:**
- Consumes: `process.env.API_BASE_URL` (optional), `process.env.API_PORT` (optional, default `3001`)
- Produces: test file supporting two modes — local (starts Hono server) and remote (uses external server)

- [ ] **Step 1: Verify existing tests pass**

Run: `pnpm test:api`
Expected: PASS (40 tests)

- [ ] **Step 2: Replace the setup block**

Replace lines 1-22 with:

```js
import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'

const API_BASE_URL = process.env.API_BASE_URL || ''
const PORT = parseInt(process.env.API_PORT || '3001')
const BASE = API_BASE_URL || `http://localhost:${PORT}/api`

let server

beforeAll(async () => {
  if (API_BASE_URL) return
  const { serve } = await import('@hono/node-server')
  const { default: app } = await import('./server.js')
  return new Promise((resolve) => {
    server = serve({ fetch: app.fetch, port: PORT }, resolve)
  })
})

afterAll(() => {
  server?.close()
})

beforeEach(async () => {
  await fetch(`${BASE}/_reset`, { method: 'POST' })
})
```

- [ ] **Step 3: Run tests to verify**

Run: `pnpm test:api`
Expected: PASS (40 tests)

- [ ] **Step 4: Commit**

```bash
git add protask/api/e2e.spec.js
git commit -m "feat(api): support API_BASE_URL in e2e.spec.js for guide validation"
```

---

### Task 2: Créer les dossiers guides et le template

**Files:**
- Create: `protask/guides/.gitkeep`
- Create: `protask/guides/GUIDE-TEMPLATE.md`

- [ ] **Step 1: Create directory and template**

```bash
mkdir -p protask/guides
```

`protask/guides/GUIDE-TEMPLATE.md`:

```markdown
# Guide d'implémentation {Framework} pour {Projet}

> **Objectif** : Implémenter les {N} routes de l'API {Projet} avec {Framework}, étape par étape.

**Prérequis** : {PHP 8.2+, Composer, etc.}

**Durée estimée** : {2-3 heures}

---

## 1. Setup

Installation, création du projet, dépendances.

## 2. Structure du projet

Arborescence des fichiers, explication des dossiers clés.

## 3. Modèles / schémas de données

Définition des entités : User, Board, Column, Card, Label, Comment, Invitation.

## 4. Routes groupées par ressource

### 4.1 Authentification
- POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout
- GET /api/users/me, PUT /api/users/me

### 4.2 Boards
- GET /api/boards, POST /api/boards, GET /api/boards/:id, PUT /api/boards/:id, DELETE /api/boards/:id

### 4.3 Colonnes
- GET /api/boards/:id/columns, POST /api/boards/:id/columns
- PUT /api/columns/reorder, PUT /api/columns/:id, DELETE /api/columns/:id

### 4.4 Cartes
- GET /api/columns/:id/cards, POST /api/columns/:id/cards
- GET /api/cards/:id, PATCH /api/cards/:id, DELETE /api/cards/:id
- POST /api/cards/reorder, POST /api/cards/:id/move

### 4.5 Labels
- GET /api/boards/:id/labels, POST /api/boards/:id/labels
- PATCH /api/labels/:id, DELETE /api/labels/:id

### 4.6 Commentaires
- GET /api/cards/:id/comments, POST /api/cards/:id/comments, DELETE /api/comments/:id

### 4.7 Invitations
- GET /api/boards/:id/invitations, POST /api/boards/:id/invitations
- PATCH /api/invitations/:id, DELETE /api/invitations/:id
- DELETE /api/boards/:id/members/:userId

## 5. Authentification

Middleware, header Bearer token.

## 6. Tests

Lancer la batterie de tests existante contre ce serveur :

```bash
API_BASE_URL=http://localhost:{PORT}/api pnpm test:api
```

## 7. Déploiement

Variables d'environnement, configuration production.
```

- [ ] **Step 2: Commit**

```bash
git add protask/guides/
git commit -m "feat: add guides directory and GUIDE-TEMPLATE.md"
```

---

### Task 3: Scaffolder le projet Symfony

**Files:**
- Create: `protask/guides/symfony/composer.json`
- Create: `protask/guides/symfony/.env`
- Create: `protask/guides/symfony/.env.test`
- Create: `protask/guides/symfony/.gitignore`
- Create: `protask/guides/symfony/config/bootstrap.php`
- Create: `protask/guides/symfony/config/services.yaml`
- Create: `protask/guides/symfony/config/routes.yaml`
- Create: `protask/guides/symfony/config/packages/framework.yaml`
- Create: `protask/guides/symfony/config/packages/doctrine.yaml`
- Create: `protask/guides/symfony/public/index.php`
- Create: `protask/guides/symfony/src/Kernel.php`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p protask/guides/symfony/{config/packages,public,src/{Entity,Controller,Service,EventListener,DataFixtures}}
```

- [ ] **Step 2: Create composer.json**

```json
{
    "name": "protask/guide-symfony",
    "type": "project",
    "description": "Guide d'implémentation ProTask avec Symfony 7",
    "require": {
        "php": ">=8.2",
        "symfony/framework-bundle": "7.2.*",
        "symfony/runtime": "7.2.*",
        "symfony/console": "7.2.*",
        "symfony/yaml": "7.2.*",
        "symfony/dotenv": "7.2.*",
        "symfony/flex": "^2",
        "doctrine/orm": "^3",
        "doctrine/doctrine-bundle": "^2",
        "doctrine/doctrine-migrations-bundle": "^3",
        "symfony/validator": "7.2.*",
        "symfony/property-access": "7.2.*",
        "symfony/serializer": "7.2.*"
    },
    "require-dev": {
        "doctrine/doctrine-fixtures-bundle": "^3"
    },
    "autoload": {
        "psr-4": { "App\\": "src/" }
    },
    "extra": {
        "symfony": { "allow-contrib": false }
    }
}
```

- [ ] **Step 3: Create .env**

```
APP_ENV=dev
APP_SECRET=protask_dev_secret_key_2026
APP_DEBUG=1
DATABASE_URL=sqlite:///%kernel.project_dir%/var/data.db
```

- [ ] **Step 4: Create .env.test**

```
APP_ENV=test
APP_SECRET=protask_test_secret_key
APP_DEBUG=0
DATABASE_URL=sqlite:///%kernel.project_dir%/var/test.db
```

- [ ] **Step 5: Create .gitignore**

```
/var/
/vendor/
.env.local
.env.*.local
```

- [ ] **Step 6: Create config/bootstrap.php**

```php
<?php
use Symfony\Component\Dotenv\Dotenv;
require dirname(__DIR__).'/vendor/autoload.php';
if (file_exists(dirname(__DIR__).'/.env')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}
```

- [ ] **Step 7: Create config/services.yaml**

```yaml
services:
    _defaults:
        autowire: true
        autoconfigure: true
    App\:
        resource: '../src/'
        exclude: '../src/Kernel.php'
```

- [ ] **Step 8: Create config/routes.yaml**

```yaml
api_auth_register:
    path: /api/auth/register
    controller: App\Controller\AuthController::register
    methods: POST
api_auth_login:
    path: /api/auth/login
    controller: App\Controller\AuthController::login
    methods: POST
api_auth_logout:
    path: /api/auth/logout
    controller: App\Controller\AuthController::logout
    methods: POST
api_users_me:
    path: /api/users/me
    controller: App\Controller\UserController::me
    methods: GET
api_users_me_update:
    path: /api/users/me
    controller: App\Controller\UserController::updateMe
    methods: PUT
api_users_show:
    path: /api/users/{id}
    controller: App\Controller\UserController::show
    methods: GET
api_boards_list:
    path: /api/boards
    controller: App\Controller\BoardController::index
    methods: GET
api_boards_create:
    path: /api/boards
    controller: App\Controller\BoardController::create
    methods: POST
api_boards_show:
    path: /api/boards/{id}
    controller: App\Controller\BoardController::show
    methods: GET
api_boards_update:
    path: /api/boards/{id}
    controller: App\Controller\BoardController::update
    methods: PUT
api_boards_delete:
    path: /api/boards/{id}
    controller: App\Controller\BoardController::delete
    methods: DELETE
api_columns_list:
    path: /api/boards/{boardId}/columns
    controller: App\Controller\ColumnController::index
    methods: GET
api_columns_create:
    path: /api/boards/{boardId}/columns
    controller: App\Controller\ColumnController::create
    methods: POST
api_columns_reorder:
    path: /api/columns/reorder
    controller: App\Controller\ColumnController::reorder
    methods: PUT
api_columns_update:
    path: /api/columns/{id}
    controller: App\Controller\ColumnController::update
    methods: PUT
api_columns_delete:
    path: /api/columns/{id}
    controller: App\Controller\ColumnController::delete
    methods: DELETE
api_cards_list:
    path: /api/columns/{columnId}/cards
    controller: App\Controller\CardController::index
    methods: GET
api_cards_create:
    path: /api/columns/{columnId}/cards
    controller: App\Controller\CardController::create
    methods: POST
api_cards_show:
    path: /api/cards/{id}
    controller: App\Controller\CardController::show
    methods: GET
api_cards_update:
    path: /api/cards/{id}
    controller: App\Controller\CardController::update
    methods: PATCH
api_cards_delete:
    path: /api/cards/{id}
    controller: App\Controller\CardController::delete
    methods: DELETE
api_cards_reorder:
    path: /api/cards/reorder
    controller: App\Controller\CardController::reorder
    methods: POST
api_cards_move:
    path: /api/cards/{id}/move
    controller: App\Controller\CardController::move
    methods: POST
api_labels_list:
    path: /api/boards/{boardId}/labels
    controller: App\Controller\LabelController::index
    methods: GET
api_labels_create:
    path: /api/boards/{boardId}/labels
    controller: App\Controller\LabelController::create
    methods: POST
api_labels_update:
    path: /api/labels/{id}
    controller: App\Controller\LabelController::update
    methods: PATCH
api_labels_delete:
    path: /api/labels/{id}
    controller: App\Controller\LabelController::delete
    methods: DELETE
api_comments_list:
    path: /api/cards/{cardId}/comments
    controller: App\Controller\CommentController::index
    methods: GET
api_comments_create:
    path: /api/cards/{cardId}/comments
    controller: App\Controller\CommentController::create
    methods: POST
api_comments_delete:
    path: /api/comments/{id}
    controller: App\Controller\CommentController::delete
    methods: DELETE
api_invitations_list:
    path: /api/boards/{boardId}/invitations
    controller: App\Controller\InvitationController::index
    methods: GET
api_invitations_create:
    path: /api/boards/{boardId}/invitations
    controller: App\Controller\InvitationController::create
    methods: POST
api_invitations_update:
    path: /api/invitations/{id}
    controller: App\Controller\InvitationController::update
    methods: PATCH
api_invitations_delete:
    path: /api/invitations/{id}
    controller: App\Controller\InvitationController::delete
    methods: DELETE
api_boards_remove_member:
    path: /api/boards/{boardId}/members/{userId}
    controller: App\Controller\InvitationController::removeMember
    methods: DELETE
api_reset:
    path: /api/_reset
    controller: App\Controller\ResetController::reset
    methods: POST
```

- [ ] **Step 9: Create config/packages/framework.yaml**

```yaml
framework:
    secret: '%env(APP_SECRET)%'
    http_method_override: true
    handle_all_throwables: true
    php_errors: { log: true }
    session: { enabled: false }
    router:
        utf8: true
        resource: '%kernel.project_dir%/config/routes.yaml'
```

- [ ] **Step 10: Create config/packages/doctrine.yaml**

```yaml
doctrine:
    dbal:
        url: '%env(DATABASE_URL)%'
    orm:
        auto_generate_proxy_classes: true
        enable_lazy_ghost_objects: true
        auto_mapping: true
        mappings:
            App:
                is_bundle: false
                dir: '%kernel.project_dir%/src/Entity'
                prefix: 'App\Entity'
```

- [ ] **Step 11: Create public/index.php**

```php
<?php
use App\Kernel;
use Symfony\Component\HttpFoundation\Request;
require_once dirname(__DIR__).'/config/bootstrap.php';
$kernel = new Kernel($_SERVER['APP_ENV'] ?? 'dev', (bool)($_SERVER['APP_DEBUG'] ?? true));
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
```

- [ ] **Step 12: Create src/Kernel.php**

```php
<?php
namespace App;
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;
class Kernel extends BaseKernel { use MicroKernelTrait; }
```

- [ ] **Step 13: Install dependencies**

```bash
cd protask/guides/symfony && composer install
```

Expected: All dependencies installed, `vendor/` created.

- [ ] **Step 14: Commit**

```bash
git add protask/guides/symfony/
git commit -m "feat(symfony): scaffold Symfony project for ProTask guide"
```

---

### Task 4: Créer les entités Doctrine et le SeedService

**Files:**
- Create: `protask/guides/symfony/src/Entity/User.php`
- Create: `protask/guides/symfony/src/Entity/Board.php`
- Create: `protask/guides/symfony/src/Entity/ProjectColumn.php`
- Create: `protask/guides/symfony/src/Entity/Card.php`
- Create: `protask/guides/symfony/src/Entity/Label.php`
- Create: `protask/guides/symfony/src/Entity/Comment.php`
- Create: `protask/guides/symfony/src/Entity/Invitation.php`
- Create: `protask/guides/symfony/src/Service/SeedService.php`
- Create: `protask/guides/symfony/src/DataFixtures/AppFixtures.php`

**Interfaces:**
- Produces: 7 Doctrine entities matching the ProTask domain model
- Produces: `SeedService::load()` — fills the database with seed data matching `server.js` mockData
- Produces: `AppFixtures` — delegates to `SeedService::load()`

- [ ] **Step 1: Create User entity**

`protask/guides/symfony/src/Entity/User.php`:

```php
<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'users')]
class User
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 100)] private string $name;
    #[ORM\Column(length: 180, unique: true)] private string $email;
    #[ORM\Column(length: 255)] private string $password;
    #[ORM\Column(length: 500, nullable: true)] private ?string $avatar = null;
    #[ORM\Column(name: 'created_at')] private \DateTimeImmutable $createdAt;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }
    public function getPassword(): string { return $this->password; }
    public function setPassword(string $password): self { $this->password = $password; return $this; }
    public function getAvatar(): ?string { return $this->avatar; }
    public function setAvatar(?string $avatar): self { $this->avatar = $avatar; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'name' => $this->name, 'email' => $this->email,
            'avatar' => $this->avatar ?? '',
            'createdAt' => $this->createdAt->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
```

- [ ] **Step 2: Create Board entity**

`protask/guides/symfony/src/Entity/Board.php`:

```php
<?php
namespace App\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'boards')]
class Board
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 200)] private string $title;
    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false)] private User $owner;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;
    #[ORM\Column(length: 7, nullable: true)] private ?string $color = null;
    #[ORM\Column(type: 'json', nullable: true)] private ?array $categories = [];
    #[ORM\Column(name: 'created_at')] private \DateTimeImmutable $createdAt;
    #[ORM\OneToMany(targetEntity: ProjectColumn::class, mappedBy: 'board', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['order' => 'ASC'])] private Collection $columns;
    #[ORM\OneToMany(targetEntity: Label::class, mappedBy: 'board', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $labels;
    #[ORM\OneToMany(targetEntity: Invitation::class, mappedBy: 'board', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $invitations;
    #[ORM\Column(type: 'json')] private array $memberIds = [];

    public function __construct() {
        $this->createdAt = new \DateTimeImmutable();
        $this->columns = new ArrayCollection();
        $this->labels = new ArrayCollection();
        $this->invitations = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $title): self { $this->title = $title; return $this; }
    public function getOwner(): User { return $this->owner; }
    public function setOwner(User $owner): self { $this->owner = $owner; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }
    public function getColor(): ?string { return $this->color; }
    public function setColor(?string $color): self { $this->color = $color; return $this; }
    public function getCategories(): ?array { return $this->categories; }
    public function setCategories(?array $c): self { $this->categories = $c; return $this; }
    public function getMemberIds(): array { return $this->memberIds; }
    public function setMemberIds(array $ids): self { $this->memberIds = $ids; return $this; }
    public function getColumns(): Collection { return $this->columns; }
    public function getLabels(): Collection { return $this->labels; }
    public function getInvitations(): Collection { return $this->invitations; }

    public function isMember(int $userId): bool {
        return $this->owner->getId() === $userId || in_array($userId, $this->memberIds);
    }

    // Used by controllers to build member list with roles
    public function getMembers(array $users): array
    {
        $members = [];
        $ownerArr = ['id' => $this->owner->getId(), 'name' => $this->owner->getName(),
            'email' => $this->owner->getEmail(), 'avatar' => $this->owner->getAvatar() ?? '',
            'createdAt' => $this->owner->getCreatedAt()->format('Y-m-d\TH:i:s\Z'), 'role' => 'owner'];
        $members[] = $ownerArr;
        foreach ($users as $user) {
            if (in_array($user->getId(), $this->memberIds)) {
                $arr = $user->toArray();
                $arr['role'] = 'member';
                $members[] = $arr;
            }
        }
        return $members;
    }
}
```

- [ ] **Step 3: Create ProjectColumn entity**

`protask/guides/symfony/src/Entity/ProjectColumn.php`:

```php
<?php
namespace App\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'project_columns')]
class ProjectColumn
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 200)] private string $title;
    #[ORM\Column(type: 'integer')] private int $order;
    #[ORM\ManyToOne(targetEntity: Board::class, inversedBy: 'columns'), ORM\JoinColumn(nullable: false)]
    private Board $board;
    #[ORM\Column(length: 7, nullable: true)] private ?string $color = null;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;
    #[ORM\OneToMany(targetEntity: Card::class, mappedBy: 'column', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['order' => 'ASC'])] private Collection $cards;

    public function __construct() { $this->cards = new ArrayCollection(); }

    public function getId(): ?int { return $this->id; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $t): self { $this->title = $t; return $this; }
    public function getOrder(): int { return $this->order; }
    public function setOrder(int $o): self { $this->order = $o; return $this; }
    public function getBoard(): Board { return $this->board; }
    public function setBoard(Board $b): self { $this->board = $b; return $this; }
    public function getColor(): ?string { return $this->color; }
    public function setColor(?string $c): self { $this->color = $c; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }
    public function getCards(): Collection { return $this->cards; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'title' => $this->title, 'order' => $this->order,
            'boardId' => $this->board->getId(), 'color' => $this->color ?? '',
            'description' => $this->description ?? '',
        ];
    }
}
```

- [ ] **Step 4: Create Card entity**

`protask/guides/symfony/src/Entity/Card.php`:

```php
<?php
namespace App\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'cards')]
class Card
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 200)] private string $title;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;
    #[ORM\Column(type: 'integer')] private int $order;
    #[ORM\ManyToOne(targetEntity: ProjectColumn::class, inversedBy: 'cards'), ORM\JoinColumn(nullable: false)]
    private ProjectColumn $column;
    #[ORM\Column(type: 'date', nullable: true)] private ?\DateTimeInterface $dueDate = null;
    #[ORM\ManyToOne, ORM\JoinColumn(nullable: true)] private ?User $assignee = null;
    #[ORM\Column(type: 'json')] private array $labelIds = [];
    #[ORM\OneToMany(targetEntity: Comment::class, mappedBy: 'card', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $comments;

    public function __construct() { $this->comments = new ArrayCollection(); }

    public function getId(): ?int { return $this->id; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $t): self { $this->title = $t; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }
    public function getOrder(): int { return $this->order; }
    public function setOrder(int $o): self { $this->order = $o; return $this; }
    public function getColumn(): ProjectColumn { return $this->column; }
    public function setColumn(ProjectColumn $c): self { $this->column = $c; return $this; }
    public function getDueDate(): ?\DateTimeInterface { return $this->dueDate; }
    public function setDueDate(?\DateTimeInterface $d): self { $this->dueDate = $d; return $this; }
    public function getAssignee(): ?User { return $this->assignee; }
    public function setAssignee(?User $a): self { $this->assignee = $a; return $this; }
    public function getLabelIds(): array { return $this->labelIds; }
    public function setLabelIds(array $ids): self { $this->labelIds = $ids; return $this; }
    public function getComments(): Collection { return $this->comments; }
}
```

- [ ] **Step 5: Create Label entity**

`protask/guides/symfony/src/Entity/Label.php`:

```php
<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'labels')]
class Label
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 100)] private string $name;
    #[ORM\Column(length: 7)] private string $color;
    #[ORM\ManyToOne(targetEntity: Board::class, inversedBy: 'labels'), ORM\JoinColumn(nullable: false)]
    private Board $board;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $n): self { $this->name = $n; return $this; }
    public function getColor(): string { return $this->color; }
    public function setColor(string $c): self { $this->color = $c; return $this; }
    public function getBoard(): Board { return $this->board; }
    public function setBoard(Board $b): self { $this->board = $b; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'name' => $this->name, 'color' => $this->color,
            'boardId' => $this->board->getId(), 'description' => $this->description ?? '',
        ];
    }
}
```

- [ ] **Step 6: Create Comment entity**

`protask/guides/symfony/src/Entity/Comment.php`:

```php
<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'comments')]
class Comment
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(type: 'text')] private string $text;
    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false)] private User $author;
    #[ORM\ManyToOne(targetEntity: Card::class, inversedBy: 'comments'), ORM\JoinColumn(nullable: false)]
    private Card $card;
    #[ORM\Column(name: 'created_at')] private \DateTimeImmutable $createdAt;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }

    public function getId(): ?int { return $this->id; }
    public function getText(): string { return $this->text; }
    public function setText(string $t): self { $this->text = $t; return $this; }
    public function getAuthor(): User { return $this->author; }
    public function setAuthor(User $a): self { $this->author = $a; return $this; }
    public function getCard(): Card { return $this->card; }
    public function setCard(Card $c): self { $this->card = $c; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'text' => $this->text, 'author' => $this->author->toArray(),
            'cardId' => $this->card->getId(),
            'createdAt' => $this->createdAt->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
```

- [ ] **Step 7: Create Invitation entity**

`protask/guides/symfony/src/Entity/Invitation.php`:

```php
<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'invitations')]
class Invitation
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(targetEntity: Board::class, inversedBy: 'invitations'), ORM\JoinColumn(nullable: false)]
    private Board $board;
    #[ORM\Column(length: 180)] private string $email;
    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false)] private User $invitedBy;
    #[ORM\Column(length: 20)] private string $status = 'pending';
    #[ORM\Column(name: 'created_at')] private \DateTimeImmutable $createdAt;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }

    public function getId(): ?int { return $this->id; }
    public function getBoard(): Board { return $this->board; }
    public function setBoard(Board $b): self { $this->board = $b; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $e): self { $this->email = $e; return $this; }
    public function getInvitedBy(): User { return $this->invitedBy; }
    public function setInvitedBy(User $u): self { $this->invitedBy = $u; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $s): self { $this->status = $s; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'boardId' => $this->board->getId(), 'email' => $this->email,
            'invitedBy' => $this->invitedBy->toArray(), 'status' => $this->status,
            'createdAt' => $this->createdAt->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
```

- [ ] **Step 8: Create SeedService**

`protask/guides/symfony/src/Service/SeedService.php`:

```php
<?php
namespace App\Service;
use App\Entity\{Board, Card, Comment, Invitation, Label, ProjectColumn, User};
use Doctrine\ORM\EntityManagerInterface;

class SeedService
{
    public function __construct(private EntityManagerInterface $em) {}

    public function load(): void
    {
        $alex = (new User())->setName('Alexandre')->setEmail('alex@protask.dev')->setPassword('pass123');
        $sophie = (new User())->setName('Sophie')->setEmail('sophie@protask.dev')->setPassword('pass123');
        $marc = (new User())->setName('Marc')->setEmail('marc@protask.dev')->setPassword('pass123');
        foreach ([$alex, $sophie, $marc] as $u) { $this->em->persist($u); }
        $this->em->flush();

        // Board 1: Design System
        $b1 = (new Board())->setTitle('Design System')->setOwner($alex)
            ->setDescription("Design system de l'application")->setColor('#8B5CF6')
            ->setCategories(['Design', 'UI/UX'])->setMemberIds([$sophie->getId(), $marc->getId()]);
        $this->em->persist($b1);

        $cols = [];
        foreach ([['Backlog',0,'#6B7280','Tâches en attente'],['En cours',1,'#3B82F6','Tâches en cours'],['Terminé',2,'#10B981','Tâches terminées']] as [$t,$o,$c,$d]) {
            $col = (new ProjectColumn())->setTitle($t)->setOrder($o)->setBoard($b1)->setColor($c)->setDescription($d);
            $this->em->persist($col); $cols[] = $col;
        }

        foreach ([['Design','#8B5CF6','Design'],['Dev','#3B82F6','Dev'],['Documentation','#10B981','Doc'],['Urgent','#EF4444','Urgent']] as [$n,$c,$desc]) {
            $this->em->persist((new Label())->setName($n)->setColor($c)->setBoard($b1)->setDescription($desc));
        }
        $this->em->flush();

        $cards = [];
        foreach ([
            ['Définir la palette','Choisir les couleurs.',0,$cols[0],'2025-04-15',$alex,[1]],
            ['Composants UI','Créer les composants.',1,$cols[0],'2025-04-20',$sophie,[1,2]],
            ['Page accueil responsive','Terminer la mise en page.',0,$cols[1],'2025-04-10',$alex,[2]],
            ['Documentation','Écrire la documentation.',1,$cols[2],'2025-04-05',$sophie,[3]],
        ] as [$t,$d,$o,$col,$dd,$a,$l]) {
            $c = (new Card())->setTitle($t)->setDescription($d)->setOrder($o)->setColumn($col)
                ->setDueDate(new \DateTime($dd))->setAssignee($a)->setLabelIds($l);
            $this->em->persist($c); $cards[] = $c;
        }
        $this->em->flush();

        $this->em->persist((new Comment())->setText("J'ai commencé la palette.")->setAuthor($alex)->setCard($cards[0]));
        $this->em->persist((new Comment())->setText('Je valide le violet.')->setAuthor($sophie)->setCard($cards[0]));
        $this->em->persist((new Comment())->setText('PR créé.')->setAuthor($alex)->setCard($cards[2]));
        $this->em->persist((new Invitation())->setBoard($b1)->setEmail('marc@protask.dev')->setInvitedBy($alex)->setStatus('accepted'));
        $this->em->persist((new Invitation())->setBoard($b1)->setEmail('julie@test.com')->setInvitedBy($alex)->setStatus('pending'));

        // Board 2: Refonte App Mobile
        $b2 = (new Board())->setTitle('Refonte App Mobile')->setOwner($alex)
            ->setDescription("Refonte complète de l'application mobile")->setColor('#3B82F6')
            ->setCategories(['Mobile'])->setMemberIds([]);
        $this->em->persist($b2);
        $cols2 = [];
        foreach ([['À faire',0,'#F59E0B','Planifiées'],['En cours',1,'#3B82F6',''],['Terminé',2,'#10B981','']] as [$t,$o,$c,$d]) {
            $col = (new ProjectColumn())->setTitle($t)->setOrder($o)->setBoard($b2)->setColor($c)->setDescription($d);
            $this->em->persist($col); $cols2[] = $col;
        }
        foreach ([
            ['Wireframes','Wireframes validés.',0,$cols2[0],'2025-04-08',$alex,[2]],
            ['Maquette Figma','Maquette haute fidélité.',0,$cols2[1],'2025-04-18',$alex,[1]],
            ['Tests utilisateurs','Sessions de test.',0,$cols2[2],'2025-04-12',$sophie,[3]],
        ] as [$t,$d,$o,$col,$dd,$a,$l]) {
            $this->em->persist((new Card())->setTitle($t)->setDescription($d)->setOrder($o)->setColumn($col)
                ->setDueDate(new \DateTime($dd))->setAssignee($a)->setLabelIds($l));
        }

        // Board 3: Marketing Q2
        $b3 = (new Board())->setTitle('Marketing Q2')->setOwner($sophie)
            ->setDescription('Stratégie marketing pour le Q2')->setColor('#EF4444')
            ->setCategories(['Marketing'])->setMemberIds([$marc->getId()]);
        $this->em->persist($b3);
        foreach ([['Idées',0,'#8B5CF6','Idées à explorer'],['En production',1,'#EF4444','Campagnes en cours']] as [$t,$o,$c,$d]) {
            $this->em->persist((new ProjectColumn())->setTitle($t)->setOrder($o)->setBoard($b3)->setColor($c)->setDescription($d));
        }
        $this->em->flush();

        $cols3 = $this->em->getRepository(ProjectColumn::class)->findBy(['board' => $b3], ['order' => 'ASC']);
        foreach ([
            ['Analyse concurrents','Benchmark',0,$cols3[0],'2025-04-14',$alex,[2]],
            ['Stratégie contenu','Calendrier éditorial.',1,$cols3[0],'2025-04-22',$sophie,[1,4]],
            ['Campagne emailing',"Séquence d'emails.",0,$cols3[1],'2025-04-25',$alex,[4]],
        ] as [$t,$d,$o,$col,$dd,$a,$l]) {
            $this->em->persist((new Card())->setTitle($t)->setDescription($d)->setOrder($o)->setColumn($col)
                ->setDueDate(new \DateTime($dd))->setAssignee($a)->setLabelIds($l));
        }
        $this->em->flush();
    }
}
```

- [ ] **Step 9: Create AppFixtures**

`protask/guides/symfony/src/DataFixtures/AppFixtures.php`:

```php
<?php
namespace App\DataFixtures;
use App\Service\SeedService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function __construct(private SeedService $seedService) {}
    public function load(ObjectManager $manager): void { $this->seedService->load(); }
}
```

- [ ] **Step 10: Commit**

```bash
git add protask/guides/symfony/src/Entity/ protask/guides/symfony/src/Service/ protask/guides/symfony/src/DataFixtures/
git commit -m "feat(symfony): add Doctrine entities, SeedService and AppFixtures"
```

---

### Task 5: Implémenter l'auth et le reset

**Files:**
- Create: `protask/guides/symfony/src/EventListener/MockAuthSubscriber.php`
- Create: `protask/guides/symfony/src/Controller/AuthController.php`
- Create: `protask/guides/symfony/src/Controller/ResetController.php`

**Interfaces:**
- Produces: `MockAuthSubscriber` — extracts userId from `Authorization: Bearer token-{userId}`, sets `_user_id` request attribute
- Produces: `AuthController` — register, login, logout endpoints
- Produces: `ResetController::reset` — truncates all tables, calls `SeedService::load()`

- [ ] **Step 1: Create MockAuthSubscriber**

```php
<?php
namespace App\EventListener;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\KernelEvents;

class MockAuthSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', 10]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $path = $request->getPathInfo();

        if (in_array($path, ['/api/auth/register', '/api/auth/login', '/api/_reset'], true)) {
            return;
        }

        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer token-')) {
            throw new AccessDeniedHttpException('Token manquant ou invalide.');
        }
        $userId = (int) substr($auth, strlen('Bearer token-'));
        if ($userId <= 0) {
            throw new AccessDeniedHttpException('Token invalide.');
        }
        $request->attributes->set('_user_id', $userId);
    }
}
```

- [ ] **Step 2: Create AuthController**

```php
<?php
namespace App\Controller;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class AuthController
{
    public function register(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return new JsonResponse(['error' => 'Champs obligatoires : name, email, password'], 400);
        }
        $existing = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return new JsonResponse(['error' => 'Email déjà utilisé.'], 400);
        }
        $user = (new User())->setName($data['name'])->setEmail($data['email'])->setPassword($data['password']);
        $em->persist($user);
        $em->flush();
        return new JsonResponse(['user' => $user->toArray(), 'token' => 'token-'.$user->getId()], 201);
    }

    public function login(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $em->getRepository(User::class)->findOneBy(['email' => $data['email'] ?? '']);
        if (!$user || $user->getPassword() !== ($data['password'] ?? '')) {
            return new JsonResponse(['error' => 'Email ou mot de passe incorrect.'], 401);
        }
        return new JsonResponse(['user' => $user->toArray(), 'token' => 'token-'.$user->getId()]);
    }

    public function logout(): JsonResponse
    {
        return new JsonResponse(['success' => true]);
    }
}
```

- [ ] **Step 3: Create ResetController**

```php
<?php
namespace App\Controller;
use App\Service\SeedService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class ResetController
{
    public function reset(EntityManagerInterface $em, SeedService $seedService): JsonResponse
    {
        $conn = $em->getConnection();
        foreach (['comments','invitations','cards','labels','project_columns','boards','users'] as $table) {
            $conn->executeStatement("DELETE FROM $table");
        }
        $seedService->load();
        return new JsonResponse(['success' => true]);
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add protask/guides/symfony/src/EventListener/ protask/guides/symfony/src/Controller/AuthController.php protask/guides/symfony/src/Controller/ResetController.php
git commit -m "feat(symfony): add auth, MockAuthSubscriber and ResetController"
```

---

### Task 6: Implémenter les controllers Boards, Users, Colonnes

**Files:**
- Create: `protask/guides/symfony/src/Controller/BoardController.php`
- Create: `protask/guides/symfony/src/Controller/UserController.php`
- Create: `protask/guides/symfony/src/Controller/ColumnController.php`

- [ ] **Step 1: Create UserController**

```php
<?php
namespace App\Controller;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class UserController
{
    public function __construct(private EntityManagerInterface $em) {}

    public function me(Request $request): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($request->attributes->get('_user_id'));
        return new JsonResponse($user->toArray());
    }

    public function updateMe(Request $request): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($request->attributes->get('_user_id'));
        $data = json_decode($request->getContent(), true);
        if (isset($data['name'])) $user->setName($data['name']);
        if (isset($data['avatar'])) $user->setAvatar($data['avatar']);
        $this->em->flush();
        return new JsonResponse($user->toArray());
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) return new JsonResponse(['error' => 'Utilisateur introuvable.'], 404);
        return new JsonResponse($user->toArray());
    }
}
```

- [ ] **Step 2: Create BoardController**

```php
<?php
namespace App\Controller;
use App\Entity\Board;
use App\Entity\ProjectColumn;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class BoardController
{
    public function __construct(private EntityManagerInterface $em) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $users = $this->em->getRepository(User::class)->findAll();
        $result = [];
        foreach ($this->em->getRepository(Board::class)->findAll() as $b) {
            if (!$b->isMember($userId)) continue;
            $cardCount = 0;
            foreach ($b->getColumns() as $col) { $cardCount += $col->getCards()->count(); }
            $result[] = [
                'id' => $b->getId(), 'title' => $b->getTitle(),
                'description' => $b->getDescription() ?? '', 'color' => $b->getColor() ?? '',
                'categories' => $b->getCategories() ?? [], 'ownerId' => $b->getOwner()->getId(),
                'createdAt' => $b->getCreatedAt()->format('Y-m-d\TH:i:s\Z'),
                'cardCount' => $cardCount,
                'members' => $b->getMembers($users),
            ];
        }
        return new JsonResponse($result);
    }

    public function create(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $owner = $this->em->getRepository(User::class)->find($userId);
        $data = json_decode($request->getContent(), true);
        $board = (new Board())->setTitle($data['title'] ?? 'Sans titre')->setOwner($owner);
        if (isset($data['description'])) $board->setDescription($data['description']);
        if (isset($data['color'])) $board->setColor($data['color']);
        if (isset($data['categories'])) $board->setCategories($data['categories']);
        $this->em->persist($board);
        foreach ([['Backlog',0],['En cours',1],['Terminé',2]] as [$t,$o]) {
            $this->em->persist((new ProjectColumn())->setTitle($t)->setOrder($o)->setBoard($board));
        }
        $this->em->flush();
        return new JsonResponse([
            'id' => $board->getId(), 'title' => $board->getTitle(),
            'description' => $board->getDescription() ?? '', 'color' => $board->getColor() ?? '',
            'categories' => $board->getCategories() ?? [], 'ownerId' => $owner->getId(),
            'createdAt' => $board->getCreatedAt()->format('Y-m-d\TH:i:s\Z'),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($id);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        $columns = array_map(fn($c) => $c->toArray(), $board->getColumns()->toArray());
        $users = $this->em->getRepository(User::class)->findAll();
        return new JsonResponse([
            'id' => $board->getId(), 'title' => $board->getTitle(),
            'description' => $board->getDescription() ?? '', 'color' => $board->getColor() ?? '',
            'categories' => $board->getCategories() ?? [], 'ownerId' => $board->getOwner()->getId(),
            'createdAt' => $board->getCreatedAt()->format('Y-m-d\TH:i:s\Z'),
            'columns' => $columns, 'members' => $board->getMembers($users),
        ]);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($id);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        if (isset($data['title'])) $board->setTitle($data['title']);
        if (isset($data['description'])) $board->setDescription($data['description']);
        if (isset($data['color'])) $board->setColor($data['color']);
        if (isset($data['categories'])) $board->setCategories($data['categories']);
        $this->em->flush();
        return new JsonResponse([
            'id' => $board->getId(), 'title' => $board->getTitle(),
            'description' => $board->getDescription() ?? '', 'color' => $board->getColor() ?? '',
            'categories' => $board->getCategories() ?? [], 'ownerId' => $board->getOwner()->getId(),
            'createdAt' => $board->getCreatedAt()->format('Y-m-d\TH:i:s\Z'),
        ]);
    }

    public function delete(int $id): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($id);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        $this->em->remove($board);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
```

- [ ] **Step 3: Create ColumnController**

```php
<?php
namespace App\Controller;
use App\Entity\Board;
use App\Entity\ProjectColumn;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ColumnController
{
    public function __construct(private EntityManagerInterface $em) {}

    public function index(int $boardId): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($boardId);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        $result = array_map(fn($c) => $c->toArray(), $board->getColumns()->toArray());
        return new JsonResponse($result);
    }

    public function create(int $boardId, Request $request): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($boardId);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        $maxOrder = 0;
        foreach ($board->getColumns() as $c) { if ($c->getOrder() > $maxOrder) $maxOrder = $c->getOrder(); }
        $col = (new ProjectColumn())->setTitle($data['title'] ?? 'Sans titre')->setOrder($maxOrder + 1)->setBoard($board);
        if (isset($data['color'])) $col->setColor($data['color']);
        if (isset($data['description'])) $col->setDescription($data['description']);
        $this->em->persist($col);
        $this->em->flush();
        return new JsonResponse($col->toArray(), 201);
    }

    public function reorder(Request $request): JsonResponse
    {
        foreach (json_decode($request->getContent(), true) as $item) {
            $col = $this->em->getRepository(ProjectColumn::class)->find($item['id']);
            if ($col) $col->setOrder($item['order']);
        }
        $this->em->flush();
        $result = array_map(fn($c) => $c->toArray(), $this->em->getRepository(ProjectColumn::class)->findAll());
        return new JsonResponse($result);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $col = $this->em->getRepository(ProjectColumn::class)->find($id);
        if (!$col) return new JsonResponse(['error' => 'Colonne introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        if (isset($data['title'])) $col->setTitle($data['title']);
        if (isset($data['color'])) $col->setColor($data['color']);
        if (isset($data['description'])) $col->setDescription($data['description']);
        $this->em->flush();
        return new JsonResponse($col->toArray());
    }

    public function delete(int $id): JsonResponse
    {
        $col = $this->em->getRepository(ProjectColumn::class)->find($id);
        if (!$col) return new JsonResponse(['error' => 'Colonne introuvable.'], 404);
        $this->em->remove($col);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add protask/guides/symfony/src/Controller/BoardController.php protask/guides/symfony/src/Controller/UserController.php protask/guides/symfony/src/Controller/ColumnController.php
git commit -m "feat(symfony): add Board, User and Column controllers"
```

---

### Task 7: Implémenter les controllers Cartes, Labels, Commentaires, Invitations

**Files:**
- Create: `protask/guides/symfony/src/Controller/CardController.php`
- Create: `protask/guides/symfony/src/Controller/LabelController.php`
- Create: `protask/guides/symfony/src/Controller/CommentController.php`
- Create: `protask/guides/symfony/src/Controller/InvitationController.php`

- [ ] **Step 1: Create CardController**

`protask/guides/symfony/src/Controller/CardController.php`:

```php
<?php
namespace App\Controller;
use App\Entity\{Card, Label, ProjectColumn, User};
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class CardController
{
    public function __construct(private EntityManagerInterface $em) {}

    public function index(int $columnId): JsonResponse
    {
        $col = $this->em->getRepository(ProjectColumn::class)->find($columnId);
        if (!$col) return new JsonResponse(['error' => 'Colonne introuvable.'], 404);
        return new JsonResponse(array_map(fn($c) => $this->toArray($c), $col->getCards()->toArray()));
    }

    public function create(int $columnId, Request $request): JsonResponse
    {
        $col = $this->em->getRepository(ProjectColumn::class)->find($columnId);
        if (!$col) return new JsonResponse(['error' => 'Colonne introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        if (empty($data['title'])) return new JsonResponse(['error' => 'Le titre est obligatoire.'], 400);
        $maxOrder = 0;
        foreach ($col->getCards() as $c) { if ($c->getOrder() > $maxOrder) $maxOrder = $c->getOrder(); }
        $card = (new Card())->setTitle($data['title'])->setOrder($maxOrder + 1)->setColumn($col);
        if (isset($data['description'])) $card->setDescription($data['description']);
        if (isset($data['dueDate'])) $card->setDueDate(new \DateTime($data['dueDate']));
        if (isset($data['assigneeId'])) {
            $a = $this->em->getRepository(User::class)->find($data['assigneeId']);
            if ($a) $card->setAssignee($a);
        }
        if (isset($data['labels'])) $card->setLabelIds($data['labels']);
        $this->em->persist($card);
        $this->em->flush();
        return new JsonResponse($this->toArray($card), 201);
    }

    public function show(int $id): JsonResponse
    {
        $card = $this->em->getRepository(Card::class)->find($id);
        if (!$card) return new JsonResponse(['error' => 'Carte introuvable.'], 404);
        $arr = $this->toArray($card);
        $arr['comments'] = array_map(fn($c) => $c->toArray(), $card->getComments()->toArray());
        return new JsonResponse($arr);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $card = $this->em->getRepository(Card::class)->find($id);
        if (!$card) return new JsonResponse(['error' => 'Carte introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        if (isset($data['title'])) $card->setTitle($data['title']);
        if (isset($data['description'])) $card->setDescription($data['description']);
        if (isset($data['dueDate'])) $card->setDueDate(new \DateTime($data['dueDate']));
        if (isset($data['assigneeId'])) {
            $card->setAssignee($this->em->getRepository(User::class)->find($data['assigneeId']) ?: null);
        }
        if (isset($data['labels'])) $card->setLabelIds($data['labels']);
        $this->em->flush();
        return new JsonResponse($this->toArray($card));
    }

    public function delete(int $id): JsonResponse
    {
        $card = $this->em->getRepository(Card::class)->find($id);
        if (!$card) return new JsonResponse(['error' => 'Carte introuvable.'], 404);
        $this->em->remove($card);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        foreach (json_decode($request->getContent(), true) as $item) {
            $card = $this->em->getRepository(Card::class)->find($item['id']);
            if ($card) $card->setOrder($item['order']);
        }
        $this->em->flush();
        $result = array_map(fn($c) => $this->toArray($c), $this->em->getRepository(Card::class)->findAll());
        return new JsonResponse($result);
    }

    public function move(int $id, Request $request): JsonResponse
    {
        $card = $this->em->getRepository(Card::class)->find($id);
        if (!$card) return new JsonResponse(['error' => 'Carte introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        if (!isset($data['columnId'])) return new JsonResponse(['error' => 'columnId requis.'], 400);
        $newCol = $this->em->getRepository(ProjectColumn::class)->find($data['columnId']);
        if (!$newCol) return new JsonResponse(['error' => 'Colonne introuvable.'], 404);
        $card->setColumn($newCol);
        $maxOrder = 0;
        foreach ($newCol->getCards() as $c) { if ($c->getOrder() > $maxOrder) $maxOrder = $c->getOrder(); }
        $card->setOrder($maxOrder + 1);
        $this->em->flush();
        return new JsonResponse($this->toArray($card));
    }

    private function toArray(Card $card): array
    {
        $labels = array_values(array_filter(array_map(
            fn($id) => ($l = $this->em->getRepository(Label::class)->find($id)) ? $l->toArray() : null,
            $card->getLabelIds()
        )));
        return [
            'id' => $card->getId(), 'title' => $card->getTitle(),
            'description' => $card->getDescription() ?? '',
            'order' => $card->getOrder(), 'columnId' => $card->getColumn()->getId(),
            'dueDate' => $card->getDueDate()?->format('Y-m-d') ?? '',
            'assignee' => $card->getAssignee()?->toArray() ?? null,
            'labels' => $labels,
            'comments' => [],
        ];
    }
}
```

- [ ] **Step 2: Create LabelController**

```php
<?php
namespace App\Controller;
use App\Entity\{Board, Label};
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class LabelController
{
    public function __construct(private EntityManagerInterface $em) {}

    public function index(int $boardId): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($boardId);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        return new JsonResponse(array_map(fn($l) => $l->toArray(), $board->getLabels()->toArray()));
    }

    public function create(int $boardId, Request $request): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($boardId);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        if (empty($data['name'])) return new JsonResponse(['error' => 'Le nom est obligatoire.'], 400);
        $label = (new Label())->setName($data['name'])->setColor($data['color'] ?? '#808080')->setBoard($board);
        if (isset($data['description'])) $label->setDescription($data['description']);
        $this->em->persist($label);
        $this->em->flush();
        return new JsonResponse($label->toArray(), 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $label = $this->em->getRepository(Label::class)->find($id);
        if (!$label) return new JsonResponse(['error' => 'Label introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        if (isset($data['name'])) $label->setName($data['name']);
        if (isset($data['color'])) $label->setColor($data['color']);
        if (isset($data['description'])) $label->setDescription($data['description']);
        $this->em->flush();
        return new JsonResponse($label->toArray());
    }

    public function delete(int $id): JsonResponse
    {
        $label = $this->em->getRepository(Label::class)->find($id);
        if (!$label) return new JsonResponse(['error' => 'Label introuvable.'], 404);
        $this->em->remove($label);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
```

- [ ] **Step 3: Create CommentController**

```php
<?php
namespace App\Controller;
use App\Entity\{Card, Comment, User};
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class CommentController
{
    public function __construct(private EntityManagerInterface $em) {}

    public function index(int $cardId): JsonResponse
    {
        $card = $this->em->getRepository(Card::class)->find($cardId);
        if (!$card) return new JsonResponse(['error' => 'Carte introuvable.'], 404);
        return new JsonResponse(array_map(fn($c) => $c->toArray(), $card->getComments()->toArray()));
    }

    public function create(int $cardId, Request $request): JsonResponse
    {
        $card = $this->em->getRepository(Card::class)->find($cardId);
        if (!$card) return new JsonResponse(['error' => 'Carte introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        if (empty($data['text'])) return new JsonResponse(['error' => 'Le texte est obligatoire.'], 400);
        $author = $this->em->getRepository(User::class)->find($request->attributes->get('_user_id'));
        $comment = (new Comment())->setText($data['text'])->setAuthor($author)->setCard($card);
        $this->em->persist($comment);
        $this->em->flush();
        return new JsonResponse($comment->toArray(), 201);
    }

    public function delete(int $id): JsonResponse
    {
        $comment = $this->em->getRepository(Comment::class)->find($id);
        if (!$comment) return new JsonResponse(['error' => 'Commentaire introuvable.'], 404);
        $this->em->remove($comment);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
```

- [ ] **Step 4: Create InvitationController**

```php
<?php
namespace App\Controller;
use App\Entity\{Board, Invitation, User};
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class InvitationController
{
    public function __construct(private EntityManagerInterface $em) {}

    public function index(int $boardId): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($boardId);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        return new JsonResponse(array_map(fn($i) => $i->toArray(), $board->getInvitations()->toArray()));
    }

    public function create(int $boardId, Request $request): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($boardId);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Email invalide.'], 400);
        }
        $userId = $request->attributes->get('_user_id');
        $inviter = $this->em->getRepository(User::class)->find($userId);
        if ($email === $inviter->getEmail()) {
            return new JsonResponse(['error' => 'Vous ne pouvez pas vous inviter vous-même.'], 400);
        }
        $invited = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$invited) {
            return new JsonResponse(['error' => 'Aucun utilisateur trouvé avec cet email.'], 404);
        }
        foreach ($board->getInvitations() as $inv) {
            if ($inv->getEmail() === $email && $inv->getStatus() === 'pending') {
                return new JsonResponse(['error' => 'Invitation déjà en attente.'], 400);
            }
        }
        $invitation = (new Invitation())->setBoard($board)->setEmail($email)->setInvitedBy($inviter);
        $this->em->persist($invitation);
        $this->em->flush();
        return new JsonResponse($invitation->toArray(), 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $invitation = $this->em->getRepository(Invitation::class)->find($id);
        if (!$invitation) return new JsonResponse(['error' => 'Invitation introuvable.'], 404);
        $userId = $request->attributes->get('_user_id');
        $user = $this->em->getRepository(User::class)->find($userId);
        if ($user->getEmail() !== $invitation->getEmail()) {
            return new JsonResponse(['error' => 'Vous ne pouvez pas répondre à cette invitation.'], 403);
        }
        $data = json_decode($request->getContent(), true);
        $invitation->setStatus($data['status'] ?? 'pending');
        if ($invitation->getStatus() === 'accepted') {
            $board = $invitation->getBoard();
            $ids = $board->getMemberIds();
            if (!in_array($userId, $ids)) {
                $ids[] = $userId;
                $board->setMemberIds($ids);
            }
        }
        $this->em->flush();
        return new JsonResponse($invitation->toArray());
    }

    public function delete(int $id): JsonResponse
    {
        $inv = $this->em->getRepository(Invitation::class)->find($id);
        if (!$inv) return new JsonResponse(['error' => 'Invitation introuvable.'], 404);
        $this->em->remove($inv);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }

    public function removeMember(int $boardId, int $userId): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($boardId);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        $ids = $board->getMemberIds();
        $key = array_search($userId, $ids);
        if ($key === false) return new JsonResponse(null, 204);
        unset($ids[$key]);
        $board->setMemberIds(array_values($ids));
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add protask/guides/symfony/src/Controller/CardController.php protask/guides/symfony/src/Controller/LabelController.php protask/guides/symfony/src/Controller/CommentController.php protask/guides/symfony/src/Controller/InvitationController.php
git commit -m "feat(symfony): add Card, Label, Comment and Invitation controllers"
```

---

### Task 8: Initialiser la BDD et tester le serveur Symfony

**Files:**
- Modify: none (run CLI commands)

- [ ] **Step 1: Create database and schema**

```bash
cd protask/guides/symfony && php bin/console doctrine:database:create --if-not-exists
```

Expected: Database created at `var/data.db`.

- [ ] **Step 3: Create schema**

```bash
cd protask/guides/symfony && php bin/console doctrine:schema:create
```

Expected: Tables created.

- [ ] **Step 4: Load fixtures**

```bash
cd protask/guides/symfony && php bin/console doctrine:fixtures:load --no-interaction
```

Expected: Seed data loaded.

- [ ] **Step 5: Start the Symfony server**

```bash
cd protask/guides/symfony && php -S localhost:8000 -t public/
```

Expected: Server running on port 8000.

- [ ] **Step 6: Quick smoke test**

```bash
curl -s http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email":"alex@protask.dev","password":"pass123"}'
```

Expected: JSON with user + token.

- [ ] **Step 7: Run API tests against Symfony server**

```bash
cd /home/warol52/WORK/projects-ideas && API_BASE_URL=http://localhost:8000/api pnpm test:api
```

Expected: PASS (40 tests).

- [ ] **Step 8: Commit (if fixes needed)**

```bash
git add -A protask/guides/symfony/
git commit -m "fix(symfony): add getMembers helper and test fixes"
```

---

### Task 9: Rédiger le guide Symfony (index.md)

**Files:**
- Create: `protask/guides/symfony/index.md`

- [ ] **Step 1: Write the full guide**

`protask/guides/symfony/index.md` — a rich pedagogical document following the plan type. Sections:

1. **Setup** — PHP 8.2+, Composer, création du projet, installation des dépendances
2. **Structure du projet** — arborescence expliquée, chaque dossier commenté
3. **Modèles** — chaque entité Doctrine, ses champs, ses relations (avec diagrammes textuels)
4. **Routes** — chaque groupe de routes expliqué avec extraits de code
5. **Authentification** — le MockAuthSubscriber, son rôle, pourquoi c'est simulé
6. **Tests** — comment lancer la batterie avec `API_BASE_URL`
7. **Déploiement** — variables d'environnement

The guide should:
- Call out Symfony-specific concepts (Dependency Injection, EventSubscriber, Doctrine ORM)
- Show code snippets from the actual project files (copy-paste, not rewrite)
- End each section with a "Vérification" step
- Be in French

- [ ] **Step 2: Commit**

```bash
git add protask/guides/symfony/index.md
git commit -m "docs(symfony): add Symfony implementation guide"
```

---

### Task 10: Ajouter un script de validation dans package.json

**Files:**
- Modify: `package.json`
- Create: `protask/guides/symfony/start.php` (optional, for running on a fixed port)

- [ ] **Step 1: Add guide validation script to root package.json**

Add to `scripts`:

```json
"test:guide:symfony": "cd protask/guides/symfony && php -S localhost:8001 -t public/ > /dev/null 2>&1 & sleep 1 && API_BASE_URL=http://localhost:8001/api pnpm test:api; kill %1 2>/dev/null"
```

This starts the Symfony server, runs tests, then kills the server.

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add test:guide:symfony script"
```
