<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\Sequence;
use App\Models\StockConversion;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockConversionController extends Controller
{
    /**
     * Riwayat Konversi Stok (Pecah Dus ke Eceran)
     */
    public function index(): Response
    {
        $conversions = StockConversion::with(['sourceProduct', 'targetProduct', 'creator'])
            ->latest('id')
            ->paginate(15);

        $products = Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'unit', 'current_stock']);

        return Inertia::render('Owner/StockConversions/Index', [
            'conversions' => $conversions,
            'products' => $products,
        ]);
    }

    /**
     * Eksekusi Pecah Satuan Atomik
     */
    public function store(Request $request)
    {
        $request->validate([
            'source_product_id' => 'required|exists:products,id|different:target_product_id',
            'target_product_id' => 'required|exists:products,id',
            'source_quantity' => 'required|numeric|min:0.01',
            'conversion_ratio' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $sourceProduct = Product::where('id', $request->source_product_id)->lockForUpdate()->firstOrFail();
            $targetProduct = Product::where('id', $request->target_product_id)->lockForUpdate()->firstOrFail();

            $sourceQty = (float) $request->source_quantity;
            $ratio = (float) $request->conversion_ratio;
            $targetQty = (float) ($sourceQty * $ratio);

            if ($sourceProduct->current_stock < $sourceQty) {
                return redirect()->back()->withErrors([
                    'source_quantity' => "Stok asal ({$sourceProduct->name}) tidak cukup. Sisa stok: {$sourceProduct->current_stock}",
                ]);
            }

            $convNumber = Sequence::nextNumber('CNV');

            $conversion = StockConversion::create([
                'conversion_number' => $convNumber,
                'source_product_id' => $sourceProduct->id,
                'source_quantity' => $sourceQty,
                'target_product_id' => $targetProduct->id,
                'conversion_ratio' => $ratio,
                'target_quantity' => $targetQty,
                'notes' => $request->notes,
                'created_by' => $user->id,
            ]);

            // 1. Kurangi stok produk asal
            $srcBefore = $sourceProduct->current_stock;
            $sourceProduct->decrement('current_stock', $sourceQty);
            $srcAfter = $sourceProduct->current_stock;

            StockMutation::create([
                'product_id' => $sourceProduct->id,
                'type' => 'CONVERSION_OUT',
                'quantity_change' => -$sourceQty,
                'stock_before' => $srcBefore,
                'stock_after' => $srcAfter,
                'reference_number' => $convNumber,
                'note' => "Pecah satuan ke {$targetProduct->name} ({$targetQty} {$targetProduct->unit})",
                'created_by' => $user->id,
                'created_at' => now(),
            ]);

            // 2. Tambah stok produk tujuan
            $tgtBefore = $targetProduct->current_stock;
            $targetProduct->increment('current_stock', $targetQty);
            $tgtAfter = $targetProduct->current_stock;

            StockMutation::create([
                'product_id' => $targetProduct->id,
                'type' => 'CONVERSION_IN',
                'quantity_change' => $targetQty,
                'stock_before' => $tgtBefore,
                'stock_after' => $tgtAfter,
                'reference_number' => $convNumber,
                'note' => "Konversi masuk dari {$sourceProduct->name} ({$sourceQty} {$sourceProduct->unit})",
                'created_by' => $user->id,
                'created_at' => now(),
            ]);

            AuditLog::log('CREATE', 'StockConversion', $conversion->id, null, [
                'conversion_number' => $convNumber,
                'source' => $sourceProduct->name,
                'target' => $targetProduct->name,
            ]);

            return redirect()->route('owner.conversions.index')->with('success', "Konversi {$sourceQty} {$sourceProduct->unit} menjadi {$targetQty} {$targetProduct->unit} berhasil dieksekusi ({$convNumber}).");
        });
    }
}
