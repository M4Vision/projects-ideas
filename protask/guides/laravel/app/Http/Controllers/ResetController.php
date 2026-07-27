<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ResetController extends Controller
{
    public function reset(): JsonResponse
    {
        return response()->json(['error' => 'not implemented'], 501);
    }
}
