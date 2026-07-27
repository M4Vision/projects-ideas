<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity, ORM\Table(name: 'comments')]
class Comment
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column] private ?int $id = null;
    #[ORM\Column(type: 'text')] private string $text;
    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false)] private User $author;
    #[ORM\ManyToOne(targetEntity: Card::class, inversedBy: 'comments'), ORM\JoinColumn(nullable: false)]
    private Card $card;
    #[ORM\Column(name: 'created_at')] private \DateTimeImmutable $createdAt;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }

    public function getId(): ?int { return $this->id; }
    public function getText(): string { return $this->text; }
    public function setText(string $t): self { $this->text = $t; return $this; }
    public function getAuthor(): User { return $this->author; }
    public function setAuthor(User $a): self { $this->author = $a; return $this; }
    public function getCard(): Card { return $this->card; }
    public function setCard(Card $c): self { $this->card = $c; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id, 'text' => $this->text, 'author' => $this->author->toArray(),
            'cardId' => $this->card->getId(),
            'createdAt' => $this->createdAt->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
