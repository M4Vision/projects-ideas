<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Board extends Model
{
    protected $fillable = ['title', 'owner_id', 'description', 'color', 'categories', 'member_ids'];

    protected function casts(): array
    {
        return [
            'categories' => 'array',
            'member_ids' => 'array',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function columns(): HasMany
    {
        return $this->hasMany(ProjectColumn::class);
    }

    public function labels(): HasMany
    {
        return $this->hasMany(Label::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function isMember(int $userId): bool
    {
        return in_array($userId, $this->member_ids ?? []);
    }

    public function getMembers(): array
    {
        $members = [];
        $owner = User::find($this->owner_id);
        if ($owner) {
            $members[] = ['user' => $owner->toArray(), 'role' => 'owner'];
        }
        foreach ($this->member_ids ?? [] as $id) {
            $user = User::find($id);
            if ($user) {
                $members[] = ['user' => $user->toArray(), 'role' => 'member'];
            }
        }
        return $members;
    }

    public function toArray(): array
    {
        $data = parent::toArray();
        $data['createdAt'] = $this->created_at?->format('c');
        $data['categories'] = $this->categories ?? [];
        $data['memberIds'] = $this->member_ids ?? [];
        $data['cardCount'] = $this->columns->sum(fn($c) => $c->cards->count());
        return $data;
    }
}
