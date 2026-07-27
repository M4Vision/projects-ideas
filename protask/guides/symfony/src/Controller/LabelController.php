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
