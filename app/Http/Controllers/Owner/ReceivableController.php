<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CashierShift;
use App\Models\CustomerReceivable;
use App\Models\ReceivablePayment;
use App\Models\Sequence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReceivableController extends Controller
{
    /**
     * Tampilkan Daftar Buku Bon Utang Pelanggan
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $query = CustomerReceivable::with(['customer', 'sale.cashier', 'payments.receiver'])
            ->latest('id');

        if ($status && in_array($status, ['UNPAID', 'PARTIAL', 'PAID'])) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $receivables = $query->paginate(20)->withQueryString();

        $totalOutstanding = (int) CustomerReceivable::whereIn('status', ['UNPAID', 'PARTIAL'])->sum('remaining_balance');
        $totalCustomersCount = CustomerReceivable::whereIn('status', ['UNPAID', 'PARTIAL'])->distinct('customer_id')->count('customer_id');
        $overdueCount = CustomerReceivable::whereIn('status', ['UNPAID', 'PARTIAL'])
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->count();

        return Inertia::render('Owner/Receivables/Index', [
            'receivables' => $receivables,
            'summary' => [
                'total_outstanding' => $totalOutstanding,
                'customers_count' => $totalCustomersCount,
                'overdue_count' => $overdueCount,
            ],
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Catat Setoran Cicilan / Pelunasan Bon Utang Pelanggan
     */
    public function pay(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
            'payment_method' => 'required|in:CASH,TRANSFER',
            'notes' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $id, $user) {
            $receivable = CustomerReceivable::with('customer')->lockForUpdate()->findOrFail($id);

            if ($receivable->status === 'PAID' || $receivable->remaining_balance <= 0) {
                return redirect()->back()->withErrors(['amount' => 'Bon utang ini sudah lunas.']);
            }

            $payAmount = (int) $request->amount;
            if ($payAmount > $receivable->remaining_balance) {
                return redirect()->back()->withErrors([
                    'amount' => "Nominal pembayaran (Rp {$payAmount}) melebihi sisa utang (Rp {$receivable->remaining_balance}).",
                ]);
            }

            $receiptNumber = Sequence::nextNumber('RCV');

            // Cek apakah kasir sedang memiliki shift aktif
            $activeShift = CashierShift::where('cashier_id', $user->id)
                ->where('status', 'open')
                ->first();

            $payment = ReceivablePayment::create([
                'receipt_number' => $receiptNumber,
                'receivable_id' => $receivable->id,
                'customer_id' => $receivable->customer_id,
                'amount' => $payAmount,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes ?? 'Pelunasan bon kasir',
                'received_by' => $user->id,
                'shift_id' => $activeShift ? $activeShift->id : null,
            ]);

            // Tambahkan kas ke laci kasir jika metode CASH & ada shift aktif
            if ($request->payment_method === 'CASH' && $activeShift) {
                $activeShift->increment('total_cash_sales', $payAmount);
            }

            $receivable->decrement('remaining_balance', $payAmount);
            $receivable->refresh();

            if ($receivable->remaining_balance <= 0) {
                $receivable->status = 'PAID';
            } else {
                $receivable->status = 'PARTIAL';
            }
            $receivable->save();

            AuditLog::log('PAYMENT', 'CustomerReceivable', $receivable->id, null, [
                'receipt_number' => $receiptNumber,
                'amount' => $payAmount,
                'customer' => $receivable->customer ? $receivable->customer->name : 'Pelanggan',
                'remaining' => $receivable->remaining_balance,
            ]);

            return redirect()->back()->with('success', 'Pembayaran bon sebesar Rp '.number_format($payAmount, 0, ',', '.')." berhasil dicatat dengan No. {$receiptNumber}.");
        });
    }
}
