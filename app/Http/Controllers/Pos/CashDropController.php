<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CashDrop;
use App\Models\CashierShift;
use App\Models\Sequence;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashDropController extends Controller
{
    /**
     * Tampilkan form setor kas ke brankas
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $activeShift = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->latest('id')
            ->firstOrFail();

        $owners = User::where('role', 'owner')->where('is_active', true)->get(['id', 'name']);

        return Inertia::render('POS/CashDrop', [
            'shift' => $activeShift,
            'owners' => $owners,
        ]);
    }

    /**
     * Simpan setoran uang laci ke brankas
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1000',
            'received_by' => 'required|exists:users,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $shift = CashierShift::where('cashier_id', $user->id)
                ->where('status', 'open')
                ->lockForUpdate()
                ->firstOrFail();

            $dropNumber = Sequence::nextNumber('DRP');

            $cashDrop = CashDrop::create([
                'drop_number' => $dropNumber,
                'shift_id' => $shift->id,
                'cashier_id' => $user->id,
                'amount' => $request->amount,
                'notes' => $request->notes,
                'received_by' => $request->received_by,
                'created_at' => now(),
            ]);

            $shift->increment('total_cash_drops', $request->amount);

            AuditLog::log('CASH_DROP', 'CashDrop', $cashDrop->id, null, [
                'drop_number' => $dropNumber,
                'amount' => $request->amount,
                'shift_id' => $shift->id,
                'cashier' => $user->name,
            ]);

            return redirect()->route('pos.index')->with('success', "Uang kas laci Rp " . number_format($request->amount, 0, ',', '.') . " berhasil disetor ke brankas ({$dropNumber}).");
        });
    }
}
