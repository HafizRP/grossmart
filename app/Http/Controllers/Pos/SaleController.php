<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CashierShift;
use App\Models\Customer;
use App\Models\CustomerPointMutation;
use App\Models\CustomerReceivable;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    /**
     * Tampilkan Riwayat Penjualan / Nota Kasir
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Sale::with(['cashier', 'customer', 'items', 'payments'])
            ->latest('id');

        // Jika bukan owner, hanya bisa melihat transaksi shift-nya sendiri
        if (! $user->isOwner()) {
            $activeShift = CashierShift::where('cashier_id', $user->id)
                ->where('status', 'open')
                ->latest('id')
                ->first();

            if ($activeShift) {
                $query->where('shift_id', $activeShift->id);
            } else {
                $query->where('cashier_id', $user->id);
            }
        }

        $salesPaginated = $query->paginate(20)->withQueryString();

        $formattedSales = collect($salesPaginated->items())->map(function ($sale) {
            $primaryPayment = $sale->payments->first();
            $paymentMethod = $primaryPayment ? $primaryPayment->payment_method : 'CASH';

            return [
                'id' => $sale->id,
                'invoice_number' => $sale->invoice_number,
                'cashier_name' => $sale->cashier ? $sale->cashier->name : 'Kasir',
                'customer_name' => $sale->customer ? $sale->customer->name : null,
                'customer_phone' => $sale->customer ? $sale->customer->phone : null,
                'total_amount' => (int) $sale->final_amount,
                'payment_method' => $paymentMethod,
                'cash_paid' => (int) $sale->cash_received,
                'change_due' => (int) $sale->cash_change,
                'created_at' => $sale->created_at->toIso8601String(),
                'status' => $sale->status === 'VOID' ? 'VOIDED' : 'COMPLETED',
                'void_reason' => $sale->void_reason,
                'items' => $sale->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_name' => $item->product_name_snapshot,
                        'quantity' => (float) $item->quantity,
                        'unit' => $item->unit_snapshot,
                        'unit_price' => (int) $item->selling_price_snapshot,
                        'discount_amount' => (int) $item->discount,
                        'subtotal' => (int) $item->subtotal,
                    ];
                })->all(),
            ];
        })->all();

        return Inertia::render('Sales/Index', [
            'sales' => $formattedSales,
            'is_owner' => $user->isOwner(),
        ]);
    }

    /**
     * Batalkan Nota Transaksi (Void Penjualan) - Khusus Pemilik Toko
     */
    public function void(Request $request, $id)
    {
        $user = $request->user();

        if (! $user->isOwner()) {
            return redirect()->back()->withErrors(['message' => 'Hanya Pemilik Toko yang berhak membatalkan nota belanja.']);
        }

        $request->validate([
            'reason' => 'required|string|min:3|max:255',
        ]);

        return DB::transaction(function () use ($request, $id, $user) {
            $sale = Sale::with(['items', 'payments'])->lockForUpdate()->findOrFail($id);

            if ($sale->status === 'VOID') {
                return redirect()->back()->withErrors(['message' => 'Nota ini sudah dibatalkan sebelumnya.']);
            }

            // Kunci proteksi transaksi > 30 hari tidak bisa divoid
            if ($sale->created_at->diffInDays(now()) > 30) {
                return redirect()->back()->withErrors(['message' => 'Transaksi yang berusia lebih dari 30 hari tidak dapat dibatalkan.']);
            }

            // 1. Rollback Stok Produk (Mutasi SALE_VOID)
            foreach ($sale->items as $item) {
                $product = Product::where('id', $item->product_id)->lockForUpdate()->first();
                if ($product) {
                    if ($product->product_type === 'BUNDLE') {
                        $bundleItems = $product->bundleComponents()->get();
                        foreach ($bundleItems as $bItem) {
                            $comp = Product::where('id', $bItem->item_product_id)->lockForUpdate()->first();
                            if ($comp) {
                                $qtyReturn = (float) $item->quantity * (float) $bItem->quantity;
                                $before = $comp->current_stock;
                                $comp->increment('current_stock', $qtyReturn);
                                $after = $comp->current_stock;

                                StockMutation::create([
                                    'product_id' => $comp->id,
                                    'type' => 'SALE_VOID',
                                    'quantity_change' => $qtyReturn,
                                    'stock_before' => $before,
                                    'stock_after' => $after,
                                    'reference_number' => $sale->invoice_number,
                                    'note' => "Pembatalan nota {$sale->invoice_number} (Komponen bundle)",
                                    'created_by' => $user->id,
                                    'created_at' => now(),
                                ]);
                            }
                        }
                    } else {
                        $before = $product->current_stock;
                        $product->increment('current_stock', (float) $item->quantity);
                        $after = $product->current_stock;

                        StockMutation::create([
                            'product_id' => $product->id,
                            'type' => 'SALE_VOID',
                            'quantity_change' => (float) $item->quantity,
                            'stock_before' => $before,
                            'stock_after' => $after,
                            'reference_number' => $sale->invoice_number,
                            'note' => "Pembatalan nota {$sale->invoice_number}",
                            'created_by' => $user->id,
                            'created_at' => now(),
                        ]);
                    }
                }
            }

            // 2. Sesuaikan Kas Shift Jika Shift Terkait Masih Terbuka
            if ($sale->shift_id) {
                $shift = CashierShift::lockForUpdate()->find($sale->shift_id);
                if ($shift && $shift->status === 'open') {
                    $cashPaid = (int) $sale->payments()->where('payment_method', 'CASH')->sum('amount');
                    if ($cashPaid > 0) {
                        $shift->increment('total_cash_voided', $cashPaid);
                    }
                }
            }

            // 3. Rollback Poin & Piutang Pelanggan
            if ($sale->customer_id) {
                $customer = Customer::lockForUpdate()->find($sale->customer_id);
                if ($customer) {
                    // Kembalikan poin yang ditukar
                    if ($sale->points_redeemed > 0) {
                        $customer->increment('loyalty_points', $sale->points_redeemed);
                        CustomerPointMutation::create([
                            'customer_id' => $customer->id,
                            'sale_id' => $sale->id,
                            'type' => 'ADJUSTMENT',
                            'points_change' => $sale->points_redeemed,
                            'points_balance_after' => $customer->loyalty_points,
                            'notes' => "Pengembalian poin karena nota {$sale->invoice_number} dibatalkan",
                            'created_at' => now(),
                        ]);
                    }
                    // Tarik kembali poin yang didapat
                    if ($sale->points_earned > 0) {
                        $customer->decrement('loyalty_points', $sale->points_earned);
                        CustomerPointMutation::create([
                            'customer_id' => $customer->id,
                            'sale_id' => $sale->id,
                            'type' => 'ADJUSTMENT',
                            'points_change' => -$sale->points_earned,
                            'points_balance_after' => $customer->loyalty_points,
                            'notes' => "Pembatalan bonus poin nota {$sale->invoice_number}",
                            'created_at' => now(),
                        ]);
                    }
                }

                // Batalkan piutang tempo jika ada
                CustomerReceivable::where('sale_id', $sale->id)->update([
                    'status' => 'CANCELLED',
                ]);
            }

            // 4. Ubah status penjualan menjadi VOID
            $sale->update([
                'status' => 'VOID',
                'void_reason' => $request->reason,
                'voided_at' => now(),
                'voided_by' => $user->id,
            ]);

            AuditLog::log('VOID', 'Sale', $sale->id, null, [
                'invoice' => $sale->invoice_number,
                'reason' => $request->reason,
                'owner' => $user->name,
            ]);

            return redirect()->back()->with('success', "Nota {$sale->invoice_number} berhasil dibatalkan dan stok dikembalikan.");
        });
    }
}
