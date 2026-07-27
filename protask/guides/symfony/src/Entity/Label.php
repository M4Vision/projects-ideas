<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'labels')]
class Label
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 100)] private string $name;
    #[ORM\Column(length: 7)] private string $color;
    #[ORM\ManyToOne(targetEntity: Board::class, inversedBy: 'labels'), ORM\JoinColumn(nullable: false)]
    private Board $board;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $n): self { $this->name = $n; return $this; }
    public function getColor(): string { return $this->color; }
    public function setColor(string $c): self { $this->color = $c; return $this; }
    public function getBoard(): Board { return $this->board; }
    public function setBoard(Board $b): self { $this->board = $b; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'name' => $this->name, 'color' => $this->color,
            'boardId' => $this->board->getId(), 'description' => $this->description ?? '',
        ];
    }
}
