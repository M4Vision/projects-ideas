<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Label extends Model
{
    protected $fillable = ['name', 'color', 'board_id', 'description'];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color,
            'boardId' => $this->board_id,
            'description' => $this->description ?? '',
        ];
    }
}
