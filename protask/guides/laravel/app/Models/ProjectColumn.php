<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectColumn extends Model
{
    protected $fillable = ['title', 'order_column', 'board_id', 'color', 'description'];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function cards(): HasMany
    {
        return $this->hasMany(Card::class, 'column_id');
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'order' => $this->order_column,
            'boardId' => $this->board_id,
            'color' => $this->color,
            'description' => $this->description ?? '',
        ];
    }
}
