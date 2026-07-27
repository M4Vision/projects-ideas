<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(string $board): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function store(Request $request, string $board): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function update(Request $request, string $label): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }

    public function destroy(string $label): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }
}
