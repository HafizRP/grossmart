<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\CustomerReceivable;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dashboard Ringkasan Finansial & Operasional Pemilik Toko
     */
    public function index(Request $request): Response
    {
        $today = now()->toDateString();

        $todaySales = Sale::whereDate('created_at', $today)
            ->where('status', 'COMPLETED')
            ->sum('final_amount');

        $todayCost = Sale::whereDate('created_at', $today)
            ->where('status', 'COMPLETED')
            ->sum('total_cost_price');

        $todayProfit = max(0, $todaySales - $todayCost);

        $todayCount = Sale::whereDate('created_at', $today)
            ->where('status', 'COMPLETED')
            ->count();

        $unpaidPayables = Purchase::whereIn('status', ['UNPAID', 'PARTIAL'])->sum('remaining_balance');
        $unpaidReceivables = CustomerReceivable::whereIn('status', ['UNPAID', 'PARTIAL'])->sum('remaining_balance');

        $lowStockProducts = Product::where('is_active', true)
            ->whereColumn('current_stock', '<=', 'min_stock_alert')
            ->where('product_type', '!=', 'BUNDLE')
            ->take(8)
            ->get();

        $expiringProducts = Product::where('is_active', true)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', now()->addDays(30)->toDateString())
            ->orderBy('expiry_date')
            ->take(8)
            ->get();

        // Tren omzet 7 hari terakhir
        $weeklySales = Sale::selectRaw('DATE(created_at) as date, SUM(final_amount) as total')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->where('status', 'COMPLETED')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Owner/Dashboard', [
            'metrics' => [
                'today_sales' => (int) $todaySales,
                'today_gross_profit' => (int) $todayProfit,
                'today_transactions' => $todayCount,
                'unpaid_payables' => (int) $unpaidPayables,
                'unpaid_receivables' => (int) $unpaidReceivables,
            ],
            'low_stock_products' => $lowStockProducts,
            'expiring_products' => $expiringProducts,
            'weekly_sales' => $weeklySales,
        ]);
    }
}
