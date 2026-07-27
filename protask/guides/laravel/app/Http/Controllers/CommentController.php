<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(string $card): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function store(Request $request, string $card): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function destroy(string $comment): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }
}
