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
