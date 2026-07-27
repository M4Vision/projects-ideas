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
