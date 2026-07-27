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
