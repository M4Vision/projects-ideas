<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'Utilisateur introuvable.'], 404);
        }

        return response()->json($user->toArray());
    }

    public function updateMe(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('_user_id');
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'Utilisateur introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['avatar'])) $user->avatar = $data['avatar'];
        $user->save();

        return response()->json($user->toArray());
    }

    public function show(int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'Utilisateur introuvable.'], 404);
        }

        return response()->json($user->toArray());
    }
}
