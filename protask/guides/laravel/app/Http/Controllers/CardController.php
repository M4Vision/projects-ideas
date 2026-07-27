<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function reorder(Request $request): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function move(Request $request, string $card): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function index(string $column): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function store(Request $request, string $column): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function show(string $card): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function update(Request $request, string $card): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function destroy(string $card): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }
}
