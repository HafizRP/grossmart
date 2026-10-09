<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\CashierShift;
use App\Models\CustomerReceivable;
use App\Models\Expense;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Halaman Laporan Finansial & Operasional Terpadu (Owner/Reports/Index)
     */
    public function index(Request $request): Response
    {
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->toDateString();

        $grossSales = Sale::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->where('status', 'COMPLETED')
            ->sum('subtotal');

        $totalDiscount = Sale::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->where('status', 'COMPLETED')
            ->sum('discount');

        $netSales = Sale::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->where('status', 'COMPLETED')
            ->sum('final_amount');

        $totalCogs = Sale::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->where('status', 'COMPLETED')
            ->sum('total_cost_price');

        $grossProfit = max(0, $netSales - $totalCogs);

        $totalExpenses = Expense::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->sum('amount');

        $netProfit = $grossProfit - $totalExpenses;

        $totalReceivableOutstanding = CustomerReceivable::whereIn('status', ['UNPAID', 'PARTIAL'])
            ->sum('remaining_balance');

        $totalPayableOutstanding = Purchase::whereIn('status', ['UNPAID', 'PARTIAL'])
            ->sum('remaining_balance');

        $summary = [
            'gross_sales' => (int) $grossSales,
            'total_discount' => (int) $totalDiscount,
            'net_sales' => (int) $netSales,
            'total_cogs' => (int) $totalCogs,
            'gross_profit' => (int) $grossProfit,
            'total_expenses' => (int) $totalExpenses,
            'net_profit' => (int) $netProfit,
            'total_receivable_outstanding' => (int) $totalReceivableOutstanding,
            'total_payable_outstanding' => (int) $totalPayableOutstanding,
        ];

        // Daftar piutang pelanggan aktif
        $receivables = CustomerReceivable::with('customer')
            ->whereIn('status', ['UNPAID', 'PARTIAL'])
            ->orderByDesc('remaining_balance')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'customer_name' => $r->customer ? $r->customer->name : 'Pelanggan',
                    'phone' => $r->customer ? $r->customer->phone : null,
                    'total_debt' => (int) $r->remaining_balance,
                    'due_date' => $r->due_date ? $r->due_date->toDateString() : null,
                    'last_payment_date' => $r->updated_at ? $r->updated_at->toIso8601String() : null,
                ];
            })
            ->all();

        // Audit kas laci per shift
        $shifts = CashierShift::with('cashier')
            ->whereDate('start_time', '>=', $startDate)
            ->whereDate('start_time', '<=', $endDate)
            ->latest('id')
            ->take(30)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'cashier_name' => $s->cashier ? $s->cashier->name : 'Kasir',
                    'start_time' => $s->start_time->toIso8601String(),
                    'end_time' => $s->end_time ? $s->end_time->toIso8601String() : null,
                    'starting_cash' => (int) $s->starting_cash,
                    'total_cash_sales' => (int) $s->total_cash_sales,
                    'expected_cash' => (int) $s->expected_cash_ending,
                    'actual_cash' => $s->actual_cash_ending !== null ? (int) $s->actual_cash_ending : null,
                    'difference' => $s->cash_difference !== null ? (int) $s->cash_difference : null,
                ];
            })
            ->all();

        return Inertia::render('Owner/Reports/Index', [
            'summary' => $summary,
            'receivables' => $receivables,
            'shifts' => $shifts,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }

    public function sales(Request $request): Response
    {
        return $this->index($request);
    }

    public function profitLoss(Request $request): Response
    {
        return $this->index($request);
    }

    public function cashFlow(Request $request): Response
    {
        return $this->index($request);
    }
}
