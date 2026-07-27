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
