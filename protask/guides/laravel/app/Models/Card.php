<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Card extends Model
{
    protected $fillable = ['title', 'description', 'order_column', 'column_id', 'due_date', 'assignee_id', 'label_ids'];

    protected function casts(): array
    {
        return ['label_ids' => 'array'];
    }

    public function column(): BelongsTo
    {
        return $this->belongsTo(ProjectColumn::class, 'column_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description ?? '',
            'order' => $this->order_column,
            'columnId' => $this->column_id,
            'dueDate' => $this->due_date,
            'assigneeId' => $this->assignee_id,
            'labelIds' => $this->label_ids ?? [],
            'assignee' => $this->assignee?->toArray(),
            'labels' => $this->label_ids ? Label::whereIn('id', $this->label_ids)->get()->toArray() : [],
            'comments' => $this->comments->map(fn($c) => $c->toArray()),
        ];
    }
}
