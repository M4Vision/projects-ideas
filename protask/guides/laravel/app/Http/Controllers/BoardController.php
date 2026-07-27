<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function show(string $board): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function update(Request $request, string $board): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function destroy(string $board): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }
}
