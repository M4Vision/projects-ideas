<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function me(): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function updateMe(Request $request): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }
}
