<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CashierShift;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    /**
     * Tampilkan Riwayat Biaya Operasional Toko
     */
    public function index(Request $request): Response
    {
        $category = $request->query('category');
        $source = $request->query('source');

        $query = Expense::with(['shift.cashier', 'creator'])->latest('id');

        if ($category) {
            $query->where('category', $category);
        }
        if ($source && in_array($source, ['CASHIER_DRAWER', 'OWNER_FUNDS', 'DRAWER', 'OWNER'])) {
            $dbSource = in_array($source, ['DRAWER', 'CASHIER_DRAWER']) ? 'CASHIER_DRAWER' : 'OWNER_FUNDS';
            $query->where('source', $dbSource);
        }
        $expenses = $query->paginate(20)->withQueryString();

        $startOfMonth = now()->startOfMonth();
        $monthlyTotal = (int) Expense::where('created_at', '>=', $startOfMonth)->sum('amount');
        $drawerTotal = (int) Expense::where('source', 'CASHIER_DRAWER')->where('created_at', '>=', $startOfMonth)->sum('amount');
        $ownerTotal = (int) Expense::where('source', 'OWNER_FUNDS')->where('created_at', '>=', $startOfMonth)->sum('amount');

        $categories = [
            'Listrik & Air Token',
            'Kantong Kresek & Plastik',
            'Iuran Kebersihan & Keamanan',
            'Transportasi & Bensin Kulakan',
            'Konsumsi & Makan Kasir',
            'Alat Tulis & Lakban',
            'Lain-lain',
        ];

        return Inertia::render('Owner/Expenses/Index', [
            'expenses' => $expenses,
            'summary' => [
                'monthly_total' => $monthlyTotal,
                'drawer_total' => $drawerTotal,
                'owner_total' => $ownerTotal,
            ],
            'categories' => $categories,
            'filters' => [
                'category' => $category,
                'source' => $source,
            ],
        ]);
    }

    /**
     * Simpan Pengeluaran Operasional Baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:100',
            'amount' => 'required|integer|min:1',
            'source' => 'required|in:DRAWER,OWNER,CASHIER_DRAWER,OWNER_FUNDS',
            'note' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $shiftId = null;

            $isDrawer = in_array($request->source, ['DRAWER', 'CASHIER_DRAWER']);
            $dbSource = $isDrawer ? 'CASHIER_DRAWER' : 'OWNER_FUNDS';

            // Jika pengeluaran diambil dari kas laci toko, kaitkan ke shift aktif
            if ($isDrawer) {
                $activeShift = CashierShift::where('status', 'open')->latest('id')->first();
                if ($activeShift) {
                    $shiftId = $activeShift->id;
                }
            }

            $expense = Expense::create([
                'category' => $request->category,
                'amount' => $request->amount,
                'source' => $dbSource,
                'shift_id' => $shiftId,
                'note' => $request->note ?? '-',
                'created_by' => $user->id,
            ]);

            AuditLog::log('CREATE', 'Expense', $expense->id, null, [
                'category' => $expense->category,
                'amount' => $expense->amount,
                'source' => $expense->source,
            ]);

            return redirect()->back()->with('success', 'Biaya operasional sebesar Rp '.number_format($expense->amount, 0, ',', '.').' berhasil dicatat.');
        });
    }

    /**
     * Hapus Catatan Biaya
     */
    public function destroy(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);
        $amount = $expense->amount;
        $category = $expense->category;

        $expense->delete();

        AuditLog::log('DELETE', 'Expense', $id, [
            'category' => $category,
            'amount' => $amount,
        ], null);

        return redirect()->back()->with('success', "Catatan pengeluaran {$category} berhasil dihapus.");
    }
}
