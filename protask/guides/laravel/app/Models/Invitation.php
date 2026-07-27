<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invitation extends Model
{
    protected $fillable = ['board_id', 'email', 'invited_by_id', 'status'];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_id');
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'boardId' => $this->board_id,
            'email' => $this->email,
            'invitedById' => $this->invited_by_id,
            'status' => $this->status,
            'createdAt' => $this->created_at?->format('c'),
        ];
    }
}
