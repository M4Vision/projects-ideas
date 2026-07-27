<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return response()->json(['error' => 'Champs requis : name, email, password.'], 400);
        }

        $existing = User::where('email', $data['email'])->first();
        if ($existing) {
            return response()->json(['error' => 'Cet email est déjà utilisé.'], 400);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'avatar' => $data['avatar'] ?? '',
        ]);

        return response()->json([
            'user' => $user->toArray(),
            'token' => 'token-' . $user->id,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password'])) {
            return response()->json(['error' => 'Email et mot de passe requis.'], 400);
        }

        $user = User::where('email', $data['email'])->first();

        if (!$user || $user->password !== $data['password']) {
            return response()->json(['error' => 'Email ou mot de passe incorrect.'], 401);
        }

        return response()->json([
            'user' => $user->toArray(),
            'token' => 'token-' . $user->id,
        ]);
    }

    public function logout(): JsonResponse
    {
        return response()->json(['success' => true]);
    }
}
