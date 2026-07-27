<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Board;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function index(int $boardId): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        return response()->json(
            Invitation::where('board_id', $boardId)->get()->toArray()
        );
    }

    public function store(int $boardId, Request $request): JsonResponse
    {
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json(['error' => 'Email invalide.'], 400);
        }

        $userId = $request->attributes->get('_user_id');

        if ($board->owner_id === $userId) {
            $invitedUser = User::where('email', $email)->first();
            if ($invitedUser && $invitedUser->id === $userId) {
                return response()->json(['error' => 'Vous ne pouvez pas vous inviter vous-même.'], 400);
            }
        }

        $invitedUser = User::where('email', $email)->first();
        if (!$invitedUser) {
            return response()->json(['error' => 'Utilisateur non trouvé.'], 404);
        }

        $existing = Invitation::where('board_id', $boardId)
            ->where('email', $email)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['error' => 'Une invitation est déjà en attente pour cet email.'], 400);
        }

        $invitation = Invitation::create([
            'board_id' => $boardId,
            'email' => $email,
            'invited_by_id' => $userId,
            'status' => 'pending',
        ]);

        return response()->json($invitation->toArray(), 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $invitation = Invitation::find($id);

        if (!$invitation) {
            return response()->json(['error' => 'Invitation introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $status = $data['status'] ?? '';
        $userId = $request->attributes->get('_user_id');

        $invitedUser = User::where('email', $invitation->email)->first();

        if ($status === 'accepted' || $status === 'declined') {
            if (!$invitedUser || $invitedUser->id !== $userId) {
                return response()->json(['error' => 'Vous ne pouvez pas répondre à cette invitation.'], 403);
            }
        }

        if ($status === 'accepted') {
            $board = Board::find($invitation->board_id);
            if ($board) {
                $memberIds = $board->member_ids ?? [];
                if (!in_array($invitedUser->id, $memberIds)) {
                    $memberIds[] = $invitedUser->id;
                    $board->member_ids = $memberIds;
                    $board->save();
                }
            }
        }

        $invitation->status = $status;
        $invitation->save();

        return response()->json($invitation->toArray());
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $invitation = Invitation::find($id);

        if (!$invitation) {
            return response()->json(['error' => 'Invitation introuvable.'], 404);
        }

        $invitation->delete();
        return response()->json(null, 204);
    }

    public function removeMember(int $boardId, int $memberId, Request $request): JsonResponse
    {
        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board introuvable.'], 404);
        }

        $userId = $request->attributes->get('_user_id');

        if ($board->owner_id !== $userId) {
            return response()->json(['error' => 'Seul le propriétaire peut retirer un membre.'], 403);
        }

        $memberIds = $board->member_ids ?? [];
        $board->member_ids = array_values(array_filter($memberIds, fn($id) => $id != $memberId));
        $board->save();

        return response()->json(null, 204);
    }
}
