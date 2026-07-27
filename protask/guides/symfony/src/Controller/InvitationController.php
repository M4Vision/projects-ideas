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

    public function removeMember(int $boardId, int $userId, Request $request): JsonResponse
    {
        $board = $this->em->getRepository(Board::class)->find($boardId);
        if (!$board) return new JsonResponse(['error' => 'Board introuvable.'], 404);
        $currentUserId = $request->attributes->get('_user_id');
        if ($board->getOwner()->getId() !== $currentUserId) {
            return new JsonResponse(['error' => 'Seul le propriétaire peut retirer un membre.'], 403);
        }
        $ids = $board->getMemberIds();
        $key = array_search($userId, $ids);
        if ($key === false) return new JsonResponse(null, 204);
        unset($ids[$key]);
        $board->setMemberIds(array_values($ids));
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
