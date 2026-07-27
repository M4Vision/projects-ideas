<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function login(Request $request): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function logout(): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }
}
