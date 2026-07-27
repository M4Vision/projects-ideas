<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\ProjectColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $boards = Board::where('owner_id', $userId)
            ->orWhereJsonContains('member_ids', $userId)
            ->with('columns.cards')
            ->get();

        return response()->json($boards->toArray());
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $data = json_decode($request->getContent(), true);

        $board = Board::create([
            'title' => $data['title'] ?? '',
            'owner_id' => $userId,
            'description' => $data['description'] ?? '',
            'color' => $data['color'] ?? '#3B82F6',
            'categories' => $data['categories'] ?? [],
            'member_ids' => [],
        ]);

        ProjectColumn::create(['title' => 'Backlog', 'order_column' => 0, 'board_id' => $board->id, 'color' => '#6B7280']);
        ProjectColumn::create(['title' => 'En cours', 'order_column' => 1, 'board_id' => $board->id, 'color' => '#3B82F6']);
        ProjectColumn::create(['title' => 'Terminé', 'order_column' => 2, 'board_id' => $board->id, 'color' => '#10B981']);

        return response()->json($board->fresh()->toArray(), 201);
    }

    public function show(int $id): JsonResponse
    {
        $board = Board::with('columns.cards.comments', 'columns.cards.assignee')->find($id);

        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = $board->toArray();
        $data['columns'] = $board->columns->sortBy('order_column')->values()->map(fn($c) => $c->toArray());
        $data['members'] = $board->getMembers();

        return response()->json($data);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $board = Board::find($id);

        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $board->title = $data['title'];
        if (isset($data['description'])) $board->description = $data['description'];
        if (isset($data['color'])) $board->color = $data['color'];
        if (isset($data['categories'])) $board->categories = $data['categories'];
        $board->save();

        return response()->json($board->fresh()->toArray());
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $board = Board::find($id);

        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $userId = $request->attributes->get('_user_id');
        if ($board->owner_id !== $userId) {
            return response()->json(['error' => 'Seul le propriétaire peut supprimer ce board.'], 403);
        }

        $board->delete();
        return response()->json(null, 204);
    }
}
