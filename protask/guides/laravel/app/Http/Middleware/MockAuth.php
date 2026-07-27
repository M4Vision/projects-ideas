<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MockAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $auth = $request->header('Authorization', '');

        if (!str_starts_with($auth, 'Bearer token-')) {
            return response()->json(['error' => 'Token manquant ou invalide.'], 401);
        }

        $userId = (int) substr($auth, strlen('Bearer token-'));

        if ($userId <= 0) {
            return response()->json(['error' => 'Token invalide.'], 401);
        }

        $request->attributes->set('_user_id', $userId);
        return $next($request);
    }
}
