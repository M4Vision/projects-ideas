<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Card;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(int $cardId): JsonResponse
    {
        $card = Card::find($cardId);
        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        return response()->json(
            Comment::where('card_id', $cardId)->with('author')->get()->toArray()
        );
    }

    public function store(int $cardId, Request $request): JsonResponse
    {
        $card = Card::find($cardId);
        if (!$card) {
            return response()->json(['error' => 'Carte introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['text'])) {
            return response()->json(['error' => 'Le texte est requis.'], 400);
        }

        $userId = $request->attributes->get('_user_id');

        $comment = Comment::create([
            'text' => $data['text'],
            'author_id' => $userId,
            'card_id' => $cardId,
        ]);

        return response()->json($comment->load('author')->toArray(), 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['error' => 'Commentaire introuvable.'], 404);
        }

        $comment->delete();
        return response()->json(null, 204);
    }
}
