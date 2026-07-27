<?php

namespace App\Http\Controllers;

use App\Models\Label;
use App\Models\Board;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(int $boardId): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        return response()->json(Label::where('board_id', $boardId)->get()->toArray());
    }

    public function store(int $boardId, Request $request): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['name'])) {
            return response()->json(['error' => 'Le nom est requis.'], 400);
        }

        $label = Label::create([
            'name' => $data['name'],
            'color' => $data['color'] ?? '#3B82F6',
            'board_id' => $boardId,
            'description' => $data['description'] ?? '',
        ]);

        return response()->json($label->toArray(), 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $label = Label::find($id);

        if (!$label) {
            return response()->json(['error' => 'Label introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) $label->name = $data['name'];
        if (isset($data['color'])) $label->color = $data['color'];
        if (isset($data['description'])) $label->description = $data['description'];
        $label->save();

        return response()->json($label->toArray());
    }

    public function destroy(int $id): JsonResponse
    {
        $label = Label::find($id);

        if (!$label) {
            return response()->json(['error' => 'Label introuvable.'], 404);
        }

        $label->delete();
        return response()->json(null, 204);
    }
}
