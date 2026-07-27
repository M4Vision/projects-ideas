<?php

namespace App\Http\Controllers;

use App\Models\ProjectColumn;
use App\Models\Board;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ColumnController extends Controller
{
    public function index(int $boardId): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $columns = ProjectColumn::where('board_id', $boardId)
            ->orderBy('order_column')
            ->get();

        return response()->json($columns->toArray());
    }

    public function store(int $boardId, Request $request): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        $maxOrder = ProjectColumn::where('board_id', $boardId)->max('order_column') ?? -1;

        $column = ProjectColumn::create([
            'title' => $data['title'] ?? '',
            'order_column' => $maxOrder + 1,
            'board_id' => $boardId,
            'color' => $data['color'] ?? '#6B7280',
            'description' => $data['description'] ?? '',
        ]);

        return response()->json($column->toArray(), 201);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return response()->json(['error' => 'Format invalide.'], 400);
        }

        foreach ($data as $item) {
            if (isset($item['id']) && isset($item['order'])) {
                ProjectColumn::where('id', $item['id'])->update(['order_column' => $item['order']]);
            }
        }

        $columns = ProjectColumn::orderBy('order_column')->get();
        return response()->json($columns->toArray());
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $column = ProjectColumn::find($id);

        if (!$column) {
            return response()->json(['error' => 'Colonne introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $column->title = $data['title'];
        if (isset($data['color'])) $column->color = $data['color'];
        if (isset($data['description'])) $column->description = $data['description'];
        $column->save();

        return response()->json($column->toArray());
    }

    public function destroy(int $id): JsonResponse
    {
        $column = ProjectColumn::find($id);

        if (!$column) {
            return response()->json(['error' => 'Colonne introuvable.'], 404);
        }

        $column->delete();
        return response()->json(null, 204);
    }
}
