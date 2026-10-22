<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CashierShift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierShiftController extends Controller
{
    /**
     * Tampilkan halaman buka kasir (Input modal awal)
     */
    public function openForm(Request $request)
    {
        $user = $request->user();
        $activeShift = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->latest('id')
            ->first();

        if ($activeShift) {
            return redirect()->route('pos.index');
        }

        return Inertia::render('POS/ShiftOpen', [
            'cashier' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
            ],
        ]);
    }

    /**
     * Buka shift kasir
     */
    public function open(Request $request)
    {
        $request->validate([
            'starting_cash' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Cek shift aktif ganda
        $existing = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return redirect()->route('pos.index')->with('info', 'Anda sudah memiliki shift yang masih aktif.');
        }

        $shift = CashierShift::create([
            'cashier_id' => $user->id,
            'start_time' => now(),
            'starting_cash' => $request->starting_cash,
            'expected_cash_ending' => $request->starting_cash,
            'status' => 'open',
            'notes' => $request->notes,
        ]);

        AuditLog::log('SHIFT_OPEN', 'CashierShift', $shift->id, null, [
            'starting_cash' => $shift->starting_cash,
            'cashier' => $user->name,
        ]);

        return redirect()->route('pos.index')->with('success', 'Shift kasir berhasil dibuka! Selamat bertransaksi.');
    }

    /**
     * Halaman Tutup Shift (Blind Cash-Up: Sembunyikan expected_cash_ending)
     */
    public function closeForm(Request $request)
    {
        $user = $request->user();
        $activeShift = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->latest('id')
            ->firstOrFail();

        return Inertia::render('POS/ShiftClose', [
            'shift' => [
                'id' => $activeShift->id,
                'start_time' => $activeShift->start_time,
                'cashier_name' => $user->name,
                // PERHATIAN: expected_cash_ending SENGAJA TIDAK DIKIRIM (BLIND CASH-UP)
            ],
            'isClosed' => false,
            'summary' => null,
        ]);
    }

    /**
     * Tutup shift kasir & buka hitungan selisih
     */
    public function close(Request $request)
    {
        $request->validate([
            'actual_cash_ending' => 'required|integer|min:0',
            'denomination_details' => 'nullable|array',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $shift = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->latest('id')
            ->firstOrFail();

        $expected = $shift->calculateExpectedCashEnding();
        $actual = (int) $request->actual_cash_ending;
        $difference = $actual - $expected;

        $shift->update([
            'end_time' => now(),
            'expected_cash_ending' => $expected,
            'actual_cash_ending' => $actual,
            'cash_difference' => $difference,
            'denomination_details' => $request->denomination_details,
            'notes' => $request->notes,
            'status' => 'closed',
        ]);

        AuditLog::log('SHIFT_CLOSE', 'CashierShift', $shift->id, null, [
            'expected_cash_ending' => $expected,
            'actual_cash_ending' => $actual,
            'cash_difference' => $difference,
            'cashier' => $user->name,
        ]);

        return Inertia::render('POS/ShiftClose', [
            'shift' => [
                'id' => $shift->id,
                'start_time' => $shift->start_time,
                'cashier_name' => $user->name,
            ],
            'isClosed' => true,
            'summary' => [
                'id' => $shift->id,
                'start_time' => $shift->start_time,
                'end_time' => $shift->end_time,
                'starting_cash' => $shift->starting_cash,
                'total_cash_sales' => $shift->total_cash_sales,
                'total_down_payment_cash' => $shift->total_down_payment_cash,
                'total_receivable_cash_paid' => $shift->total_receivable_cash_paid,
                'total_cash_expenses' => $shift->total_cash_expenses,
                'total_cash_drops' => $shift->total_cash_drops,
                'total_supplier_paid_from_drawer' => $shift->total_supplier_paid_from_drawer,
                'total_cash_voided' => $shift->total_cash_voided,
                'expected_cash_ending' => $expected,
                'actual_cash_ending' => $actual,
                'cash_difference' => $difference,
                'notes' => $shift->notes,
            ],
        ]);
    }
}
