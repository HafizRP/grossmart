<?php

namespace App\Http\Middleware;

use App\Models\CashierShift;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureShiftIsOpen
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $activeShift = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->latest('id')
            ->first();

        if (! $activeShift) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Shift kasir belum dibuka. Silakan isi modal awal untuk membuka kasir.',
                    'requires_shift_open' => true,
                ], 403);
            }

            return redirect()->route('pos.shifts.open');
        }

        // Attach active shift to request attributes for quick access in controllers
        $request->attributes->set('active_shift', $activeShift);

        return $next($request);
    }
}
