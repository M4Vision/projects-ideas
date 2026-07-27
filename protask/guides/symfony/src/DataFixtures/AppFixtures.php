<?php
namespace App\DataFixtures;
use App\Service\SeedService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function __construct(private SeedService $seedService) {}
    public function load(ObjectManager $manager): void { $this->seedService->load(); }
}
