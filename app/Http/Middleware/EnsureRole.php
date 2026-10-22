<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if (! $user->is_active) {
            auth()->logout();

            return redirect()->route('login')->withErrors(['username' => 'Akun Anda dinonaktifkan. Hubungi pemilik toko.']);
        }

        // Owner can access everything, cashier can only access cashier routes
        if ($role === 'owner' && ! $user->isOwner()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Akses khusus Pemilik Toko.'], 403);
            }

            return redirect()->route('pos.index')->with('error', 'Hanya Pemilik Toko yang berhak mengakses menu tersebut.');
        }

        return $next($request);
    }
}
