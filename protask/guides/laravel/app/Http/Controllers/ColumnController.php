<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ColumnController extends Controller
{
    public function reorder(Request $request): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function index(string $board): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function store(Request $request, string $board): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function update(Request $request, string $column): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function destroy(string $column): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }
}
