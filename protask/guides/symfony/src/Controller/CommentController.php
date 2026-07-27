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
