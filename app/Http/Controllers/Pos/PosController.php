<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\AuditLog;
use App\Models\CashierShift;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerPointMutation;
use App\Models\CustomerReceivable;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\Sequence;
use App\Models\StockMutation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    /**
     * Halaman Utama Kasir (POS)
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $shift = CashierShift::where('cashier_id', $user->id)
            ->where('status', 'open')
            ->latest('id')
            ->firstOrFail();

        $products = Product::with(['category', 'priceTiers', 'unitConversions', 'bundleComponents.itemProduct'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Keamanan Server-Side: Sembunyikan HPP dari kasir
        if (! $user->isOwner()) {
            $products->makeHidden(['cost_price']);
            foreach ($products as $prod) {
                if ($prod->bundleComponents) {
                    foreach ($prod->bundleComponents as $bc) {
                        if ($bc->itemProduct) {
                            $bc->itemProduct->makeHidden(['cost_price']);
                        }
                    }
                }
            }
        }

        $categories = Category::where('is_active', true)->orderBy('name')->get();
        $customers = Customer::where('is_active', true)->orderBy('name')->get();
        $settings = AppSetting::pluck('value', 'key')->all();

        return Inertia::render('POS/Index', [
            'shift' => [
                'id' => $shift->id,
                'start_time' => $shift->start_time,
                'starting_cash' => $shift->starting_cash,
                'cashier_name' => $user->name,
            ],
            'products' => $products,
            'categories' => $categories,
            'customers' => $customers,
            'settings' => $settings,
            'owners' => User::where('role', 'owner')->where('is_active', true)->get(['id', 'name']),
        ]);
    }

    /**
     * Checkout Penjualan Kasir (Atomic Concurrency Locking)
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_name' => 'nullable|string',
            'items.*.selling_price' => 'required|integer|min:0',
            'customer_id' => 'nullable|exists:customers,id',
            'discount' => 'nullable|integer|min:0',
            'points_redeemed' => 'nullable|integer|min:0',
            'rounding_amount' => 'nullable|integer',
            'payments' => 'required|array|min:1',
            'payments.*.payment_method' => 'required|in:CASH,TRANSFER,TEMPO',
            'payments.*.amount' => 'required|integer|min:0',
            'payments.*.payment_reference' => 'nullable|string',
            'cash_received' => 'nullable|integer|min:0',
            'tempo_due_date' => 'nullable|date',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $shift = CashierShift::where('cashier_id', $user->id)
                ->where('status', 'open')
                ->lockForUpdate()
                ->firstOrFail();

            $customer = $request->customer_id ? Customer::lockForUpdate()->find($request->customer_id) : null;

            $invoiceNumber = Sequence::nextNumber('TRX');
            $subtotal = 0;
            $totalCostPrice = 0;
            $preparedItems = [];

            foreach ($request->items as $itemData) {
                // Kunci baris produk serentak anti-minus
                $product = Product::where('id', $itemData['product_id'])->lockForUpdate()->firstOrFail();
                $qty = (float) $itemData['quantity'];
                $unitPrice = (int) $itemData['selling_price'];
                $itemSubtotal = (int) ($unitPrice * $qty);

                // Periksa kecukupan stok
                if ($product->product_type === 'BUNDLE') {
                    // Cek dan kurangi komponen bundle
                    $bundleItems = $product->bundleComponents()->with('itemProduct')->get();
                    foreach ($bundleItems as $bItem) {
                        $comp = Product::where('id', $bItem->item_product_id)->lockForUpdate()->firstOrFail();
                        $neededQty = $qty * (float) $bItem->quantity;

                        if ($comp->current_stock < $neededQty) {
                            throw new \Exception("Stok komponen bundle ({$comp->name}) tidak mencukupi. Sisa: {$comp->current_stock}");
                        }

                        $before = $comp->current_stock;
                        $comp->decrement('current_stock', $neededQty);
                        $after = $comp->current_stock;

                        StockMutation::create([
                            'product_id' => $comp->id,
                            'type' => 'SALE',
                            'quantity_change' => -$neededQty,
                            'stock_before' => $before,
                            'stock_after' => $after,
                            'reference_number' => $invoiceNumber,
                            'note' => "Penjualan paket hemat ({$product->name})",
                            'created_by' => $user->id,
                            'created_at' => now(),
                        ]);

                        $totalCostPrice += (int) ($comp->cost_price * $neededQty);
                    }
                } else {
                    if ($product->current_stock < $qty) {
                        throw new \Exception("Stok tidak mencukupi untuk: {$product->name}. Sisa stok di rak: {$product->current_stock}");
                    }

                    $stockBefore = $product->current_stock;
                    $product->decrement('current_stock', $qty);
                    $stockAfter = $product->current_stock;

                    StockMutation::create([
                        'product_id' => $product->id,
                        'type' => 'SALE',
                        'quantity_change' => -$qty,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_number' => $invoiceNumber,
                        'created_by' => $user->id,
                        'created_at' => now(),
                    ]);

                    $totalCostPrice += (int) ($product->cost_price * $qty);
                }

                $subtotal += $itemSubtotal;
                $preparedItems[] = [
                    'product_id' => $product->id,
                    'product_name_snapshot' => $product->name,
                    'unit_snapshot' => $itemData['unit_name'] ?? $product->unit,
                    'cost_price_snapshot' => $product->cost_price,
                    'selling_price_snapshot' => $unitPrice,
                    'quantity' => $qty,
                    'discount' => $itemData['discount'] ?? 0,
                    'subtotal' => $itemSubtotal,
                ];
            }

            // Hitung kalkulasi diskon, poin, pembulatan
            $discount = (int) ($request->discount ?? 0);
            $pointsRedeemed = (int) ($request->points_redeemed ?? 0);
            $pointsDiscountAmount = $pointsRedeemed * (int) AppSetting::get('points_redeem_value', '100');

            if ($pointsRedeemed > 0 && $customer) {
                if ($customer->loyalty_points < $pointsRedeemed) {
                    throw new \Exception('Poin pelanggan tidak mencukupi untuk ditukarkan.');
                }
            }

            $roundingAmount = (int) ($request->rounding_amount ?? 0);
            $grandTotal = max(0, $subtotal - $discount - $pointsDiscountAmount);
            $finalAmount = (int) ($grandTotal + $roundingAmount);

            // Hitung poin yang didapat dari transaksi ini
            $pointsEarnPer = (int) AppSetting::get('points_earn_per_amount', '10000');
            $pointsEarned = ($customer && $pointsEarnPer > 0) ? (int) floor($finalAmount / $pointsEarnPer) : 0;

            // Hitung pembayaran kas & kembalian
            $totalPaid = 0;
            $cashPortion = 0;
            $transferPortion = 0;
            $tempoPortion = 0;

            foreach ($request->payments as $pm) {
                $pAmount = (int) $pm['amount'];
                $totalPaid += $pAmount;
                if ($pm['payment_method'] === 'CASH') {
                    $cashPortion += $pAmount;
                } elseif ($pm['payment_method'] === 'TRANSFER') {
                    $transferPortion += $pAmount;
                } elseif ($pm['payment_method'] === 'TEMPO') {
                    $tempoPortion += $pAmount;
                }
            }

            $cashReceived = (int) ($request->cash_received ?? $cashPortion);
            $cashChange = max(0, $cashReceived - $cashPortion);

            // Simpan data penjualan
            $sale = Sale::create([
                'invoice_number' => $invoiceNumber,
                'cashier_id' => $user->id,
                'customer_id' => $customer ? $customer->id : null,
                'shift_id' => $shift->id,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'points_discount_amount' => $pointsDiscountAmount,
                'points_redeemed' => $pointsRedeemed,
                'points_earned' => $pointsEarned,
                'rounding_amount' => $roundingAmount,
                'grand_total' => $grandTotal,
                'final_amount' => $finalAmount,
                'total_cost_price' => $totalCostPrice,
                'cash_received' => $cashReceived,
                'cash_change' => $cashChange,
                'status' => 'COMPLETED',
            ]);

            // Simpan item belanja
            foreach ($preparedItems as $pi) {
                $pi['sale_id'] = $sale->id;
                SaleItem::create($pi);
            }

            // Simpan baris metode pembayaran
            foreach ($request->payments as $pm) {
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'payment_method' => $pm['payment_method'],
                    'amount' => $pm['amount'],
                    'payment_reference' => $pm['payment_reference'] ?? null,
                ]);
            }

            // Jika ada tempo, catat piutang pelanggan
            if ($tempoPortion > 0) {
                if (! $customer) {
                    throw new \Exception('Pembayaran tempo (bon) wajib memilih data pelanggan.');
                }

                CustomerReceivable::create([
                    'sale_id' => $sale->id,
                    'customer_id' => $customer->id,
                    'total_amount' => $finalAmount,
                    'down_payment' => $cashPortion + $transferPortion,
                    'remaining_balance' => $tempoPortion,
                    'status' => 'UNPAID',
                    'due_date' => $request->tempo_due_date ?? now()->addDays(14)->toDateString(),
                ]);
            }

            // Mutasi poin loyalitas
            if ($customer) {
                if ($pointsRedeemed > 0) {
                    $customer->decrement('loyalty_points', $pointsRedeemed);
                    CustomerPointMutation::create([
                        'customer_id' => $customer->id,
                        'sale_id' => $sale->id,
                        'type' => 'REDEEM',
                        'points_change' => -$pointsRedeemed,
                        'points_balance_after' => $customer->loyalty_points,
                        'notes' => "Tukar poin pada transaksi {$invoiceNumber}",
                        'created_at' => now(),
                    ]);
                }

                if ($pointsEarned > 0) {
                    $customer->increment('loyalty_points', $pointsEarned);
                    CustomerPointMutation::create([
                        'customer_id' => $customer->id,
                        'sale_id' => $sale->id,
                        'type' => 'EARN',
                        'points_change' => $pointsEarned,
                        'points_balance_after' => $customer->loyalty_points,
                        'notes' => "Bonus poin belanja {$invoiceNumber}",
                        'created_at' => now(),
                    ]);
                }
            }

            // Perbarui akumulasi uang laci pada shift kasir (cegah double count DP)
            if ($tempoPortion > 0) {
                if ($cashPortion > 0) {
                    $shift->increment('total_down_payment_cash', $cashPortion);
                }
            } else {
                if ($cashPortion > 0) {
                    $shift->increment('total_cash_sales', $cashPortion);
                }
            }
            if ($transferPortion > 0) {
                $shift->increment('total_transfer_sales', $transferPortion);
            }

            AuditLog::log('SALE', 'Sale', $sale->id, null, [
                'invoice' => $invoiceNumber,
                'final_amount' => $finalAmount,
                'items_count' => count($preparedItems),
                'cashier' => $user->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil!',
                'invoice_number' => $invoiceNumber,
                'sale' => $sale->load(['items', 'payments', 'customer']),
            ]);
        });
    }

    /**
     * Tampilkan struk cetak / e-receipt
     */
    public function receipt($invoice)
    {
        $sale = Sale::with(['items', 'payments', 'customer', 'cashier'])
            ->where('invoice_number', $invoice)
            ->firstOrFail();

        $settings = AppSetting::pluck('value', 'key')->all();

        return Inertia::render('POS/Receipt', [
            'sale' => $sale,
            'settings' => $settings,
        ]);
    }
}
