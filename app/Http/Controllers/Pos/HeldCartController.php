<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\CashierShift;
use App\Models\HeldCart;
use App\Models\Sequence;
use Illuminate\Http\Request;

class HeldCartController extends Controller
{
    /**
     * Daftar keranjang belanja yang sedang diparkir
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $shift = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->first();

        if (! $shift) {
            return response()->json([], 200);
        }

        $heldCarts = HeldCart::with('customer')
            ->where('shift_id', $shift->id)
            ->latest('id')
            ->get();

        return response()->json($heldCarts);
    }

    /**
     * Parkirkan keranjang belanja
     */
    public function store(Request $request)
    {
        $request->validate([
            'cart_data' => 'required|array',
            'customer_id' => 'nullable|exists:customers,id',
            'notes' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $shift = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->firstOrFail();

        $holdCount = HeldCart::where('shift_id', $shift->id)->count() + 1;
        $holdNumber = 'HLD-' . str_pad((string)$holdCount, 2, '0', STR_PAD_LEFT);

        $heldCart = HeldCart::create([
            'hold_number' => $holdNumber,
            'cashier_id' => $user->id,
            'shift_id' => $shift->id,
            'customer_id' => $request->customer_id,
            'cart_data' => $request->cart_data,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => "Keranjang berhasil diparkir dengan nomor {$holdNumber}.",
            'held_cart' => $heldCart,
        ]);
    }

    /**
     * Panggil kembali (Resume) keranjang yang diparkir
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $shift = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->firstOrFail();

        $heldCart = HeldCart::where('id', $id)
            ->where('shift_id', $shift->id)
            ->firstOrFail();

        $cartData = $heldCart->cart_data;
        $customerId = $heldCart->customer_id;

        $heldCart->delete();

        return response()->json([
            'message' => 'Keranjang dipanggil kembali ke kasir.',
            'cart_data' => $cartData,
            'customer_id' => $customerId,
        ]);
    }
}
