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
