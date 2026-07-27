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
