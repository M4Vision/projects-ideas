<?php
namespace App\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'project_columns')]
class ProjectColumn
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 200)] private string $title;
    #[ORM\Column(name: '`order`', type: 'integer')] private int $order;
    #[ORM\ManyToOne(targetEntity: Board::class, inversedBy: 'columns'), ORM\JoinColumn(nullable: false)]
    private Board $board;
    #[ORM\Column(length: 7, nullable: true)] private ?string $color = null;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;
    #[ORM\OneToMany(targetEntity: Card::class, mappedBy: 'column', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['order' => 'ASC'])] private Collection $cards;

    public function __construct() { $this->cards = new ArrayCollection(); }

    public function getId(): ?int { return $this->id; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $t): self { $this->title = $t; return $this; }
    public function getOrder(): int { return $this->order; }
    public function setOrder(int $o): self { $this->order = $o; return $this; }
    public function getBoard(): Board { return $this->board; }
    public function setBoard(Board $b): self { $this->board = $b; return $this; }
    public function getColor(): ?string { return $this->color; }
    public function setColor(?string $c): self { $this->color = $c; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }
    public function getCards(): Collection { return $this->cards; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'title' => $this->title, 'order' => $this->order,
            'boardId' => $this->board->getId(), 'color' => $this->color ?? '',
            'description' => $this->description ?? '',
        ];
    }
}
