<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'invitations')]
class Invitation
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(targetEntity: Board::class, inversedBy: 'invitations'), ORM\JoinColumn(nullable: false)]
    private Board $board;
    #[ORM\Column(length: 180)] private string $email;
    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false)] private User $invitedBy;
    #[ORM\Column(length: 20)] private string $status = 'pending';
    #[ORM\Column(name: 'created_at')] private \DateTimeImmutable $createdAt;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }

    public function getId(): ?int { return $this->id; }
    public function getBoard(): Board { return $this->board; }
    public function setBoard(Board $b): self { $this->board = $b; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $e): self { $this->email = $e; return $this; }
    public function getInvitedBy(): User { return $this->invitedBy; }
    public function setInvitedBy(User $u): self { $this->invitedBy = $u; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $s): self { $this->status = $s; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'boardId' => $this->board->getId(), 'email' => $this->email,
            'invitedBy' => $this->invitedBy->toArray(), 'status' => $this->status,
            'createdAt' => $this->createdAt->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
