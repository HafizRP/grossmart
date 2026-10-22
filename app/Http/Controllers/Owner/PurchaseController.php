<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Sequence;
use App\Models\StockMutation;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    /**
     * Tampilkan Halaman Riwayat Kulakan / Penerimaan Barang Masuk
     */
    public function index(Request $request): Response
    {
        $purchases = Purchase::with(['supplier', 'items.product', 'creator'])
            ->latest('id')
            ->paginate(15);

        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $products = Product::where('is_active', true)
            ->where('product_type', '!=', 'BUNDLE')
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'cost_price', 'current_stock', 'barcode']);

        $currentMonth = now()->startOfMonth();
        $monthlyTotal = (int) Purchase::whereDate('purchase_date', '>=', $currentMonth)->sum('total_amount');
        $unpaidPayables = (int) Purchase::whereIn('status', ['UNPAID', 'PARTIAL'])->sum('remaining_balance');
        $totalPurchasesCount = Purchase::count();

        return Inertia::render('Owner/Purchases/Index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'products' => $products,
            'summary' => [
                'monthly_total' => $monthlyTotal,
                'unpaid_payables' => $unpaidPayables,
                'total_count' => $totalPurchasesCount,
            ],
        ]);
    }

    /**
     * Simpan Faktur Kulakan & Tambah Stok Rak Atomik
     */
    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'invoice_number' => 'nullable|string|max:100',
            'paid_amount' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.cost_price' => 'required|integer|min:0',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $invoiceNumber = $request->invoice_number ?: Sequence::nextNumber('KUL');
            $supplier = $request->supplier_id ? Supplier::find($request->supplier_id) : null;

            $totalAmount = 0;
            $preparedItems = [];

            foreach ($request->items as $item) {
                $qty = (float) $item['quantity'];
                $cost = (int) $item['cost_price'];
                $subtotal = (int) ($qty * $cost);
                $totalAmount += $subtotal;

                $product = Product::where('id', $item['product_id'])->lockForUpdate()->firstOrFail();
                $before = $product->current_stock;
                $product->increment('current_stock', $qty);
                $after = $product->current_stock;

                // Perbarui harga modal terbaru
                $product->update(['cost_price' => $cost]);

                StockMutation::create([
                    'product_id' => $product->id,
                    'type' => 'PURCHASE',
                    'quantity_change' => $qty,
                    'stock_before' => $before,
                    'stock_after' => $after,
                    'reference_number' => $invoiceNumber,
                    'note' => 'Penerimaan barang kulakan ('.($supplier ? $supplier->name : 'Supplier Umum').')',
                    'created_by' => $user->id,
                    'created_at' => now(),
                ]);

                $preparedItems[] = [
                    'product_id' => $product->id,
                    'product_name_snapshot' => $product->name,
                    'unit_snapshot' => $product->unit,
                    'cost_price' => $cost,
                    'quantity' => $qty,
                    'subtotal' => $subtotal,
                ];
            }

            $paidAmount = min((int) $request->paid_amount, $totalAmount);
            $remaining = max(0, $totalAmount - $paidAmount);
            $status = $remaining === 0 ? 'PAID' : ($paidAmount > 0 ? 'PARTIAL' : 'UNPAID');

            $purchase = Purchase::create([
                'invoice_number' => $invoiceNumber,
                'supplier_id' => $supplier ? $supplier->id : null,
                'purchase_date' => $request->purchase_date,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'remaining_balance' => $remaining,
                'status' => $status,
                'notes' => $request->notes,
                'created_by' => $user->id,
            ]);

            foreach ($preparedItems as $pItem) {
                $pItem['purchase_id'] = $purchase->id;
                PurchaseItem::create($pItem);
            }

            AuditLog::log('CREATE', 'Purchase', $purchase->id, null, [
                'invoice' => $invoiceNumber,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'supplier' => $supplier ? $supplier->name : 'Supplier Umum',
            ]);

            return redirect()->route('owner.purchases.index')->with('success', "Faktur kulakan {$invoiceNumber} berhasil dicatat dan stok barang bertambah.");
        });
    }

    /**
     * Tambah Data Pemasok / Distributor Cepat
     */
    public function storeSupplier(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
        ]);

        $supplier = Supplier::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', "Pemasok {$supplier->name} berhasil didaftarkan.");
    }
}
