# Guide d'implémentation Symfony pour ProTask

> **Objectif** : Implémenter les 19 routes de l'API ProTask avec Symfony 7.2, étape par étape.

**Prérequis** : PHP 8.2+, Composer, extensions `pdo_sqlite` et `sqlite3`

**Durée estimée** : 2-3 heures

---

## 1. Setup

```bash
mkdir protask/guides/symfony && cd protask/guides/symfony
composer require symfony/framework-bundle:7.2.* \
  symfony/runtime:7.2.* \
  symfony/console:7.2.* \
  symfony/yaml:7.2.* \
  symfony/dotenv:7.2.* \
  symfony/flex:^2 \
  doctrine/orm:^3 \
  doctrine/doctrine-bundle:^2 \
  doctrine/doctrine-migrations-bundle:^3 \
  symfony/validator:7.2.* \
  symfony/property-access:7.2.* \
  symfony/serializer:7.2.* \
  symfony/var-exporter:7.2.* \
  --no-interaction
composer require --dev doctrine/doctrine-fixtures-bundle:^3 --no-interaction
```

On utilise Symfony Flex pour générer les fichiers de configuration de base (`config/packages/doctrine.yaml`, `config/packages/framework.yaml`, etc.), mais on garde la main sur l'arborescence.

### Dépendances clés

| Paquet | Rôle |
|--------|------|
| `symfony/framework-bundle` | Cœur du framework |
| `doctrine/orm` + `doctrine/doctrine-bundle` | ORM et intégration Symfony |
| `symfony/serializer` | Encodage JSON des réponses |
| `symfony/validator` | Validation des données entrantes |
| `doctrine/doctrine-fixtures-bundle` | Données de démonstration en CLI |

## 2. Structure du projet

```
protask/guides/symfony/
├── .env                          # Variables d'environnement
├── composer.json                 # Dépendances PHP
├── bin/console                   # Point d'entrée CLI
├── config/
│   ├── bootstrap.php             # Chargement du .env et autoload
│   ├── packages/
│   │   ├── doctrine.yaml         # Configuration SQLite/Doctrine
│   │   ├── framework.yaml        # Configuration du framework
│   │   └── ...
│   └── services.yaml             # Services et autowiring
├── public/
│   └── index.php                 # Point d'entrée HTTP (front controller)
└── src/
    ├── Kernel.php                # MicroKernel + bundles
    ├── Controller/               # 9 contrôleurs (1 par ressource)
    ├── Entity/                   # 7 entités Doctrine
    ├── EventListener/            # Middleware d'authentification
    ├── Service/                  # SeedService (données de démo)
    └── DataFixtures/             # AppFixtures (CLI fixtures)
```

### `public/index.php`

Fichier standard Symfony : charge l'autoloader, crée le kernel et gère la requête.

```php
<?php
use App\Kernel;
require_once dirname(__DIR__).'/vendor/autoload_runtime.php';
return function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
```

### `bin/console`

Le point d'entrée CLI standard : charge le bootstrap, crée le kernel et exécute la commande.

```php
#!/usr/bin/env php
<?php
use App\Kernel;
use Symfony\Bundle\FrameworkBundle\Console\Application;
require dirname(__DIR__).'/config/bootstrap.php';
$kernel = new Kernel($_SERVER['APP_ENV'] ?? 'dev', (bool)($_SERVER['APP_DEBUG'] ?? true));
$application = new Application($kernel);
$application->run(new ArgvInput());
```

### `config/bootstrap.php`

Charge le `.env` via le DotEnv component et l'autoloader Composer.

```php
<?php
use Symfony\Component\Dotenv\Dotenv;
require dirname(__DIR__).'/vendor/autoload.php';
(new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
$_SERVER += $_ENV;
$_SERVER['APP_ENV'] = $_ENV['APP_ENV'] = ($_SERVER['APP_ENV'] ?? $_ENV['APP_ENV'] ?? 'dev') ?: 'dev';
```

## 3. Kernel et bundles

On utilise `MicroKernelTrait` pour un kernel léger, avec enregistrement manuel des bundles (pas de `bundles.php` Flex).

```php
class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    public function registerBundles(): iterable
    {
        return [
            new FrameworkBundle(),
            new DoctrineBundle(),
            new DoctrineMigrationsBundle(),
            new DoctrineFixturesBundle(),
        ];
    }
}
```

`MicroKernelTrait` configure automatiquement les routes depuis les attributs `#[Route]` et charge la configuration YAML depuis `config/packages/`.

## 4. Modèles de données

### 4.1 Entité User

```php
#[Entity(repositoryClass: UserRepository::class)]
class User
{
    #[Id, GeneratedValue, Column]
    private ?int $id = null;

    #[Column(length: 100)]
    private string $name;

    #[Column(length: 180, unique: true)]
    private string $email;

    #[Column]
    private string $password;

    #[Column(type: 'string', length: 500, nullable: true)]
    private ?string $avatar = '';

    #[Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    // getters et setters…
}
```

### 4.2 Entité Board

```php
#[Entity]
class Board
{
    #[Id, GeneratedValue, Column]
    private ?int $id = null;

    #[Column(length: 200)]
    private string $title;

    #[Column(type: 'integer')]
    private int $ownerId;

    #[Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[Column(length: 7, nullable: true)]
    private ?string $color = null;

    #[Column(type: 'simple_array', nullable: true)]
    private array $categories = [];

    #[OneToMany(targetEntity: ProjectColumn::class, mappedBy: 'board', cascade: ['all'])]
    private Collection $columns;

    #[Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    // getters, setters, constructor avec $columns = new ArrayCollection()
}
```

### 4.3 Entité ProjectColumn

Le mot `order` étant réservé en SQL, on l'échappe avec des backticks dans les attributs Doctrine :

```php
#[Entity]
class ProjectColumn
{
    #[Column(type: 'integer')]
    private int $order;

    #[ManyToOne(inversedBy: 'columns')]
    #[JoinColumn(nullable: false)]
    private Board $board;

    // …
}
```

### 4.4 Entité Card

```php
#[Entity]
class Card
{
    #[Column(type: 'integer', nullable: true)]
    private ?int $assigneeId = null;

    #[Column(type: 'simple_array', nullable: true)]
    private array $labels = [];

    #[Column(type: 'string', length: 20, nullable: true)]
    private ?string $dueDate = null;

    #[ManyToOne]
    private ?User $assignee = null;

    #[OneToMany(targetEntity: Comment::class, mappedBy: 'card', cascade: ['remove'])]
    private Collection $comments;

    // …
}
```

### 4.5 Entités Label, Comment, Invitation

Ces entités suivent le même pattern : propriétés avec attributs Doctrine, relations ManyToOne vers Card/Board, et types stricts PHP (int, string, etc.).

### 4.6 SeedService

Service chargé d'initialiser les données de démonstration au premier appel API :

```php
class SeedService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function seed(): void
    {
        if ($this->em->getRepository(User::class)->find(1)) return;

        $alex = new User();
        $alex->setName('Alexandre')->setEmail('alex@protask.dev')->setPassword('pass123');
        $this->em->persist($alex);

        $board = new Board();
        $board->setTitle('Design System')->setOwnerId(1)->setColor('#8B5CF6');
        $this->em->persist($board);

        // … tous les utilisateurs, boards, colonnes, cartes, labels, commentaires de démo
        $this->em->flush();
    }
}
```

Le `SeedService` est appelé par un écouteur `kernel.request` à priorité basse (pour s'exécuter après le middleware d'auth).

### 4.7 AppFixtures

Alternative CLI pour charger les fixtures via `doctrine:fixtures:load` :

```php
class AppFixtures extends Fixture
{
    public function __construct(private SeedService $seedService) {}

    public function load(ObjectManager $manager): void
    {
        $this->seedService->seed();
    }
}
```

## 5. Authentification

### 5.1 Principe

Pas de vraie sécurité — on utilise un header `Authorization: Bearer token-{userId}` où `token-1` identifie l'utilisateur id=1. Les routes publiques (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/_reset`) n'ont pas besoin de token.

### 5.2 MockAuthSubscriber

```php
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

        if (in_array($path, ['/api/auth/register', '/api/auth/login',
                              '/api/auth/logout', '/api/_reset'], true)) {
            return;
        }

        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer token-')) {
            $event->setResponse(new JsonResponse(['error' => 'Token manquant ou invalide.'], 401));
            return;
        }
        $userId = (int) substr($auth, strlen('Bearer token-'));
        $request->attributes->set('_user_id', $userId);
    }
}
```

Points clés :
- Priorité `10` pour s'exécuter avant la plupart des autres listeners
- Retourne une `JsonResponse` directement (ne throw pas d'exception)
- Stocke l'userId dans les attributs de la requête pour les contrôleurs

### 5.3 AuthController

```php
#[Route('/api/auth')]
class AuthController extends AbstractController
{
    #[Route('/register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        // validation, création en DB, retour de l'utilisateur + token
    }

    #[Route('/login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        // vérifie email/mot de passe, retourne token-{id}
    }

    #[Route('/logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        return new JsonResponse(['success' => true]);
    }
}
```

### 5.4 UserController

```php
#[Route('/api/users')]
class UserController extends AbstractController
{
    #[Route('/me', methods: ['GET'])]
    public function me(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $user = $this->userRepository->find($userId);
        return new JsonResponse($user);
    }

    #[Route('/me', methods: ['PUT'])]
    public function updateMe(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        // met à jour name/email/avatar
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        return $user ? new JsonResponse($user) : new JsonResponse(['error' => 'Utilisateur introuvable.'], 404);
    }
}
```

## 6. Routes groupées par ressource

### 6.1 Boards (5 routes)

```php
#[Route('/api/boards')]
class BoardController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $boards = $this->boardRepository->findByOwnerId($userId);
        // + boards où l'utilisateur est membre
        return new JsonResponse($boards);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse { … }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse { … }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse { … }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse { … }
}
```

Les controllers suivent un pattern cohérent :
1. Injection de `Request $request` pour accéder au body JSON et aux attributs
2. Injection de `EntityManagerInterface` pour la persistance
3. Injection du repository via `EntityManagerInterface::getRepository()`
4. Retour de `JsonResponse` avec les données sérialisées

### 6.2 Colonnes (5 routes)

Le `ColumnController` gère le CRUD des colonnes. Attention à la route `PUT /api/columns/reorder` qui doit être déclarée AVANT `PUT /api/columns/{id}` dans l'ordre des méthodes (Symfony match la première correspondance).

```php
#[Route('/api')]
class ColumnController extends AbstractController
{
    #[Route('/boards/{boardId}/columns', methods: ['GET'])]
    public function list(int $boardId): JsonResponse { … }

    #[Route('/boards/{boardId}/columns', methods: ['POST'])]
    public function create(int $boardId, Request $request): JsonResponse { … }

    #[Route('/columns/reorder', methods: ['PUT'])]
    public function reorder(Request $request): JsonResponse { … }

    #[Route('/columns/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse { … }

    #[Route('/columns/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse { … }
}
```

### 6.3 Cartes (7 routes)

```php
#[Route('/api')]
class CardController extends AbstractController
{
    #[Route('/columns/{columnId}/cards', methods: ['GET'])]
    public function list(int $columnId): JsonResponse { … }

    #[Route('/columns/{columnId}/cards', methods: ['POST'])]
    public function create(int $columnId, Request $request): JsonResponse { … }

    #[Route('/cards/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse { … }

    #[Route('/cards/{id}', methods: ['PATCH'])]
    public function update(int $id, Request $request): JsonResponse { … }

    #[Route('/cards/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse { … }

    #[Route('/cards/reorder', methods: ['POST'])]
    public function reorder(Request $request): JsonResponse { … }

    #[Route('/cards/{id}/move', methods: ['POST'])]
    public function move(int $id, Request $request): JsonResponse { … }
}
```

### 6.4 Labels (4 routes), Commentaires (3 routes), Invitations (5 routes)

Ces contrôleurs suivent exactement le même pattern : `AbstractController` avec injection de `Request` et `EntityManagerInterface`, routes définies par attributs `#[Route]`, réponses en `JsonResponse`.

## 7. ResetController

Route spéciale (hors OpenAPI) pour les tests : vide toutes les tables et réinitialise les données de démonstration.

```php
#[Route('/api/_reset', methods: ['POST'])]
class ResetController extends AbstractController
{
    public function reset(EntityManagerInterface $em, SeedService $seedService): JsonResponse
    {
        $em->createQuery('DELETE FROM App\Entity\Comment')->execute();
        $em->createQuery('DELETE FROM App\Entity\Card')->execute();
        $em->createQuery('DELETE FROM App\Entity\Label')->execute();
        $em->createQuery('DELETE FROM App\Entity\Invitation')->execute();
        $em->createQuery('DELETE FROM App\Entity\ProjectColumn')->execute();
        $em->createQuery('DELETE FROM App\Entity\Board')->execute();
        $em->createQuery('DELETE FROM App\Entity\User')->execute();

        $seedService->seed();
        return new JsonResponse(['success' => true]);
    }
}
```

## 8. Configuration

### 8.1 Doctrine (SQLite)

```yaml
# config/packages/doctrine.yaml
doctrine:
    dbal:
        driver: pdo_sqlite
        path: '%kernel.project_dir%/var/data.db'
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

On utilise `path` (pas `url`) pour la configuration SQLite, ce qui permet d'utiliser `%kernel.project_dir%` comme variable de chemin. Cela évite les problèmes de résolution du paramètre dans la chaîne DSN.

### 8.2 Services

```yaml
# config/services.yaml
services:
    _defaults:
        autowire: true
        autoconfigure: true

    App\:
        resource: '../src/'
        exclude:
            - '../src/Entity/'
            - '../src/Kernel.php'

    App\Controller\:
        resource: '../src/Controller/'
        tags: ['controller.service_arguments']
```

Le tag `controller.service_arguments` est essentiel : il permet l'injection automatique des dépendances (EntityManager, Request, etc.) dans les méthodes des contrôleurs.

### 8.3 Environnement

```bash
# .env
APP_ENV=dev
APP_SECRET=protask_dev_secret_key_2026
APP_DEBUG=1
```

Pas de `DATABASE_URL` dans le `.env` — la configuration SQLite est gérée entièrement dans `doctrine.yaml`.

## 9. Tests

### 9.1 Lancer les tests

```bash
# Démarrer le serveur Symfony
php -S 0.0.0.0:8002 -t public/

# Lancer les tests API (53 tests)
API_BASE_URL=http://localhost:8002/api pnpm test:api
```

### 9.2 Initialisation de la base de données

```bash
# Créer le schéma
php bin/console doctrine:schema:create

# Charger les fixtures de démonstration
php bin/console doctrine:fixtures:load --no-interaction
```

### 9.3 Validation

Les 53 tests de `protask/api/e2e.spec.js` couvrent :

| Ressource | Tests | Routes couvertes |
|-----------|-------|------------------|
| Auth | 7 | register, login, logout, users/me |
| Boards | 5 | CRUD + 404 |
| Colonnes | 5 | CRUD + reorder + 404 |
| Cartes | 7 | CRUD + move + reorder + 404 |
| Labels | 5 | CRUD + 404 |
| Commentaires | 3 | list, create, delete |
| Invitations | 7 | CRUD + permissions + 404 |

Tous les tests passent contre l'implémentation Symfony.

## 10. Déploiement

### 10.1 Variables d'environnement

```bash
APP_ENV=prod
APP_SECRET=une_cle_secrete_tres_longue
APP_DEBUG=0
```

### 10.2 Production

Pour la production, utilisez un serveur PHP plus performant que le built-in :

```bash
# Avec PHP-FPM + Nginx
# Ou avec un worker Symfony
symfony server:start --no-tls
```

La base SQLite devra être stockée dans un répertoire persistant avec les bons droits d'écriture.

### 10.3 Guide du débutant

Les pièges à éviter :

1. **Ordre des routes** : `PUT /api/columns/reorder` avant `PUT /api/columns/{id}` — Symfony match la première route qui correspond
2. **SQLite** : Pas de `doctrine:database:create` — SQLite crée le fichier automatiquement à la première connexion, `doctrine:schema:create` suffit
3. **Mot-clé `order`** : Échappé avec des backticks dans les annotations/attributs Doctrine car c'est un mot réservé SQL
4. **Dépendance circulaire** : Éviter la sérialisation récursive des entités liées (Board → Column → Board) — utiliser des tableaux personnalisés ou `AbstractController::json()`
5. **_reset** : Les `DELETE FROM` doivent être ordonnés (enfants avant parents) à cause des contraintes de clés étrangères
