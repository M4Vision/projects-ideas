<?php
namespace App\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'boards')]
class Board
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 200)] private string $title;
    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false)] private User $owner;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;
    #[ORM\Column(length: 7, nullable: true)] private ?string $color = null;
    #[ORM\Column(type: 'json', nullable: true)] private ?array $categories = [];
    #[ORM\Column(name: 'created_at')] private \DateTimeImmutable $createdAt;
    #[ORM\OneToMany(targetEntity: ProjectColumn::class, mappedBy: 'board', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['order' => 'ASC'])] private Collection $columns;
    #[ORM\OneToMany(targetEntity: Label::class, mappedBy: 'board', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $labels;
    #[ORM\OneToMany(targetEntity: Invitation::class, mappedBy: 'board', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $invitations;
    #[ORM\Column(type: 'json')] private array $memberIds = [];

    public function __construct() {
        $this->createdAt = new \DateTimeImmutable();
        $this->columns = new ArrayCollection();
        $this->labels = new ArrayCollection();
        $this->invitations = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $title): self { $this->title = $title; return $this; }
    public function getOwner(): User { return $this->owner; }
    public function setOwner(User $owner): self { $this->owner = $owner; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }
    public function getColor(): ?string { return $this->color; }
    public function setColor(?string $color): self { $this->color = $color; return $this; }
    public function getCategories(): ?array { return $this->categories; }
    public function setCategories(?array $c): self { $this->categories = $c; return $this; }
    public function getMemberIds(): array { return $this->memberIds; }
    public function setMemberIds(array $ids): self { $this->memberIds = $ids; return $this; }
    public function getColumns(): Collection { return $this->columns; }
    public function getLabels(): Collection { return $this->labels; }
    public function getInvitations(): Collection { return $this->invitations; }

    public function isMember(int $userId): bool {
        return $this->owner->getId() === $userId || in_array($userId, $this->memberIds);
    }

    // Used by controllers to build member list with roles
    public function getMembers(array $users): array
    {
        $members = [];
        $ownerArr = ['id' => $this->owner->getId(), 'name' => $this->owner->getName(),
            'email' => $this->owner->getEmail(), 'avatar' => $this->owner->getAvatar() ?? '',
            'createdAt' => $this->owner->getCreatedAt()->format('Y-m-d\TH:i:s\Z'), 'role' => 'owner'];
        $members[] = $ownerArr;
        foreach ($users as $user) {
            if (in_array($user->getId(), $this->memberIds)) {
                $arr = $user->toArray();
                $arr['role'] = 'member';
                $members[] = $arr;
            }
        }
        return $members;
    }
}
