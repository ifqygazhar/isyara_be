<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role)
    {
        try {
            $user = $request->user();

            Log::debug('CheckRole middleware', [
                'has_user' => $user ? true : false,
                'user_id' => $user?->id,
                'user_role' => $user?->role,
                'required_role' => $role,
            ]);

            if (! $user || $user->role !== $role) {
                return response()->json(['message' => 'Unauthorized / Akses Ditolak'], 403);
            }

            return $next($request);
        } catch (\Throwable $e) {
            Log::error('CheckRole exception', ['exception' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json(['message' => 'Server error in role check'], 500);
        }
    }
}
