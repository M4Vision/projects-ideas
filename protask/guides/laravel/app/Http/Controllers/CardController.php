<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\ProjectColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function index(int $columnId): JsonResponse
    {
        $column = ProjectColumn::find($columnId);
        if (!$column) {
            return response()->json(['error' => 'Colonne introuvable.'], 404);
        }

        $cards = Card::where('column_id', $columnId)
            ->with('assignee', 'comments.author')
            ->orderBy('order_column')
            ->get();

        return response()->json($cards->toArray());
    }

    public function store(int $columnId, Request $request): JsonResponse
    {
        $column = ProjectColumn::find($columnId);
        if (!$column) {
            return response()->json(['error' => 'Colonne introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['title'])) {
            return response()->json(['error' => 'Le titre est requis.'], 400);
        }

        $maxOrder = Card::where('column_id', $columnId)->max('order_column') ?? -1;

        $card = Card::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'order_column' => $maxOrder + 1,
            'column_id' => $columnId,
            'due_date' => $data['dueDate'] ?? null,
            'assignee_id' => $data['assigneeId'] ?? null,
            'label_ids' => $data['labelIds'] ?? [],
        ]);

        return response()->json($card->load('assignee', 'comments.author')->toArray(), 201);
    }

    public function show(int $id): JsonResponse
    {
        $card = Card::with('assignee', 'comments.author')->find($id);

        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        return response()->json($card->toArray());
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $card = Card::with('assignee', 'comments.author')->find($id);

        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $card->title = $data['title'];
        if (isset($data['description'])) $card->description = $data['description'];
        if (isset($data['dueDate'])) $card->due_date = $data['dueDate'];
        if (isset($data['assigneeId'])) $card->assignee_id = $data['assigneeId'];
        if (isset($data['labelIds'])) $card->label_ids = $data['labelIds'];
        $card->save();

        return response()->json($card->fresh()->load('assignee', 'comments.author')->toArray());
    }

    public function destroy(int $id): JsonResponse
    {
        $card = Card::find($id);

        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        $card->delete();
        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return response()->json(['error' => 'Format invalide.'], 400);
        }

        foreach ($data as $item) {
            if (isset($item['id']) && isset($item['order'])) {
                Card::where('id', $item['id'])->update(['order_column' => $item['order']]);
            }
        }

        return response()->json(['success' => true]);
    }

    public function move(int $id, Request $request): JsonResponse
    {
        $card = Card::find($id);

        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['columnId'])) {
            $card->column_id = $data['columnId'];
        }

        if (isset($data['order'])) {
            $card->order_column = $data['order'];
        }

        $card->save();

        return response()->json($card->load('assignee', 'comments.author')->toArray());
    }
}
