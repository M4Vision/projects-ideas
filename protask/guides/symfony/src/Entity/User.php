<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'users')]
class User
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 100)] private string $name;
    #[ORM\Column(length: 180, unique: true)] private string $email;
    #[ORM\Column(length: 255)] private string $password;
    #[ORM\Column(length: 500, nullable: true)] private ?string $avatar = null;
    #[ORM\Column(name: 'created_at')] private \DateTimeImmutable $createdAt;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }
    public function getPassword(): string { return $this->password; }
    public function setPassword(string $password): self { $this->password = $password; return $this; }
    public function getAvatar(): ?string { return $this->avatar; }
    public function setAvatar(?string $avatar): self { $this->avatar = $avatar; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'name' => $this->name, 'email' => $this->email,
            'avatar' => $this->avatar ?? '',
            'createdAt' => $this->createdAt->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
