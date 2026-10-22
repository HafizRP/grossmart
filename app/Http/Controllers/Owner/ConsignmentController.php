<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ConsignmentSettlement;
use App\Models\ConsignmentSettlementItem;
use App\Models\Consignor;
use App\Models\Product;
use App\Models\SaleItem;
use App\Models\Sequence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConsignmentController extends Controller
{
    /**
     * Tampilkan Halaman Rekonsiliasi Makanan Titipan Warga (Konsinyasi)
     */
    public function index(Request $request): Response
    {
        $settlements = ConsignmentSettlement::with(['consignor', 'items.product', 'creator'])
            ->latest('id')
            ->paginate(15);

        $consignors = Consignor::with(['products' => function ($q) {
            $q->where('product_type', 'CONSIGNMENT')->where('is_active', true);
        }])->where('is_active', true)->get();

        $activeConsignorsCount = Consignor::where('is_active', true)->count();
        $consignmentProductsCount = Product::where('product_type', 'CONSIGNMENT')->where('is_active', true)->count();
        $totalPaidOut = (int) ConsignmentSettlement::where('status', 'PAID')->sum('total_payable_amount');
        $totalStoreProfit = (int) ConsignmentSettlement::where('status', 'PAID')->sum('total_store_profit');

        return Inertia::render('Owner/Consignments/Index', [
            'settlements' => $settlements,
            'consignors' => $consignors,
            'summary' => [
                'consignors_count' => $activeConsignorsCount,
                'products_count' => $consignmentProductsCount,
                'total_paid' => $totalPaidOut,
                'total_profit' => $totalStoreProfit,
            ],
        ]);
    }

    /**
     * Tambah Data Penitip Baru (Warga Pembuat Makanan)
     */
    public function storeConsignor(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
        ]);

        $consignor = Consignor::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', "Data warga penitip {$consignor->name} berhasil disimpan.");
    }

    /**
     * Rekonsiliasi Bagi Hasil Titipan (Settlement)
     */
    public function storeSettlement(Request $request)
    {
        $request->validate([
            'consignor_id' => 'required|exists:consignors,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $consignor = Consignor::with('products')->findOrFail($request->consignor_id);
            $consignorProductIds = $consignor->products->pluck('id')->all();

            if (empty($consignorProductIds)) {
                return redirect()->back()->withErrors(['consignor_id' => 'Warga ini belum memiliki produk titipan terdaftar.']);
            }

            // Hitung penjualan riil dalam rentang tanggal
            $saleItems = SaleItem::whereIn('product_id', $consignorProductIds)
                ->whereHas('sale', function ($q) use ($request) {
                    $q->where('status', 'COMPLETED')
                        ->whereDate('created_at', '>=', $request->start_date)
                        ->whereDate('created_at', '<=', $request->end_date);
                })
                ->get();

            $grouped = $saleItems->groupBy('product_id');

            $totalSoldQty = 0;
            $totalPayable = 0;
            $totalStoreProfit = 0;
            $preparedItems = [];

            foreach ($consignor->products as $product) {
                $itemsForProduct = $grouped->get($product->id, collect());
                $soldQty = (float) $itemsForProduct->sum('quantity');

                if ($soldQty > 0) {
                    $splitPrice = (int) ($product->consignor_split_price ?? $product->cost_price);
                    $sellingPrice = (int) $product->selling_price;
                    $payable = (int) ($soldQty * $splitPrice);
                    $profit = (int) ($soldQty * ($sellingPrice - $splitPrice));

                    $totalSoldQty += $soldQty;
                    $totalPayable += $payable;
                    $totalStoreProfit += $profit;

                    $preparedItems[] = [
                        'product_id' => $product->id,
                        'sold_quantity' => $soldQty,
                        'consignor_split_price' => $splitPrice,
                        'selling_price_snapshot' => $sellingPrice,
                        'total_payable' => $payable,
                        'store_profit' => $profit,
                    ];
                }
            }

            if (empty($preparedItems)) {
                return redirect()->back()->withErrors([
                    'consignor_id' => 'Tidak ditemukan penjualan produk titipan pada rentang tanggal tersebut.',
                ]);
            }

            $settlementNumber = Sequence::nextNumber('TIT');

            $settlement = ConsignmentSettlement::create([
                'settlement_number' => $settlementNumber,
                'consignor_id' => $consignor->id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'total_sold_quantity' => $totalSoldQty,
                'total_payable_amount' => $totalPayable,
                'total_store_profit' => $totalStoreProfit,
                'status' => 'PAID',
                'paid_at' => now(),
                'notes' => $request->notes,
                'created_by' => $user->id,
            ]);

            foreach ($preparedItems as $pItem) {
                $pItem['settlement_id'] = $settlement->id;
                ConsignmentSettlementItem::create($pItem);
            }

            AuditLog::log('SETTLEMENT', 'ConsignmentSettlement', $settlement->id, null, [
                'number' => $settlementNumber,
                'consignor' => $consignor->name,
                'total_payable' => $totalPayable,
            ]);

            return redirect()->back()->with('success', "Bagi hasil {$settlementNumber} berhasil dibukukan: Rp ".number_format($totalPayable, 0, ',', '.')." untuk {$consignor->name}.");
        });
    }
}
