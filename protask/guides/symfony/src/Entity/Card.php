<?php
namespace App\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'cards')]
class Card
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 200)] private string $title;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;
    #[ORM\Column(name: '`order`', type: 'integer')] private int $order;
    #[ORM\ManyToOne(targetEntity: ProjectColumn::class, inversedBy: 'cards'), ORM\JoinColumn(nullable: false)]
    private ProjectColumn $column;
    #[ORM\Column(type: 'date', nullable: true)] private ?\DateTimeInterface $dueDate = null;
    #[ORM\ManyToOne, ORM\JoinColumn(nullable: true)] private ?User $assignee = null;
    #[ORM\Column(type: 'json')] private array $labelIds = [];
    #[ORM\OneToMany(targetEntity: Comment::class, mappedBy: 'card', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $comments;

    public function __construct() { $this->comments = new ArrayCollection(); }

    public function getId(): ?int { return $this->id; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $t): self { $this->title = $t; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }
    public function getOrder(): int { return $this->order; }
    public function setOrder(int $o): self { $this->order = $o; return $this; }
    public function getColumn(): ProjectColumn { return $this->column; }
    public function setColumn(ProjectColumn $c): self { $this->column = $c; return $this; }
    public function getDueDate(): ?\DateTimeInterface { return $this->dueDate; }
    public function setDueDate(?\DateTimeInterface $d): self { $this->dueDate = $d; return $this; }
    public function getAssignee(): ?User { return $this->assignee; }
    public function setAssignee(?User $a): self { $this->assignee = $a; return $this; }
    public function getLabelIds(): array { return $this->labelIds; }
    public function setLabelIds(array $ids): self { $this->labelIds = $ids; return $this; }
    public function getComments(): Collection { return $this->comments; }
}
