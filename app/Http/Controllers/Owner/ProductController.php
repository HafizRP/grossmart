<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductPriceTier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Daftar Produk untuk Pemilik Toko (Termasuk HPP Modal & Tempat Sampah Terpadu)
     */
    public function index(Request $request): Response
    {
        $mapProduct = function ($prod) {
            $firstTier = $prod->priceTiers ? $prod->priceTiers->first() : null;

            return [
                'id' => $prod->id,
                'sku' => $prod->barcode ?? ('PRD-'.$prod->id),
                'barcode' => $prod->barcode,
                'name' => $prod->name,
                'category_id' => $prod->category_id,
                'category_name' => $prod->category ? $prod->category->name : 'Umum',
                'unit' => $prod->unit,
                'cost_price' => (int) $prod->cost_price,
                'selling_price' => (int) $prod->selling_price,
                'wholesale_price' => $firstTier ? (int) $firstTier->unit_price : null,
                'wholesale_min_qty' => $firstTier ? (float) $firstTier->min_quantity : null,
                'current_stock' => (float) $prod->current_stock,
                'min_stock_alert' => (int) $prod->min_stock_alert,
                'is_active' => (bool) $prod->is_active,
                'deleted_at' => $prod->deleted_at ? $prod->deleted_at->toIso8601String() : null,
            ];
        };

        $query = Product::with(['category', 'priceTiers']);
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = (clone $query)
            ->orderBy('name')
            ->get()
            ->map($mapProduct)
            ->all();

        $trashedProducts = Product::onlyTrashed()
            ->with(['category', 'priceTiers'])
            ->orderBy('name')
            ->get()
            ->map($mapProduct)
            ->all();
        $categories = Category::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Owner/Products/Index', [
            'products' => $products,
            'trashed_products' => $trashedProducts,
            'categories' => $categories,
            'user_name' => $request->user()->name,
        ]);
    }

    /**
     * Simpan Produk Baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'barcode' => 'nullable|string|max:255|unique:products,barcode',
            'category_id' => 'nullable|exists:categories,id',
            'product_type' => 'nullable|in:REGULAR,CONSIGNMENT,BUNDLE',
            'consignor_id' => 'nullable|exists:consignors,id',
            'consignor_split_price' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'selling_price' => 'required|integer|min:0',
            'cost_price' => 'nullable|integer|min:0',
            'current_stock' => 'nullable|numeric|min:0',
            'min_stock_alert' => 'nullable|integer|min:0',
            'wholesale_price' => 'nullable|integer|min:0',
            'wholesale_min_qty' => 'nullable|numeric|min:1',
            'expiry_date' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($request) {
            $product = Product::create([
                'name' => $request->name,
                'barcode' => $request->barcode,
                'category_id' => $request->category_id,
                'product_type' => $request->product_type ?? 'REGULAR',
                'consignor_id' => $request->consignor_id,
                'consignor_split_price' => $request->consignor_split_price,
                'unit' => $request->unit ?? 'pcs',
                'selling_price' => $request->selling_price,
                'cost_price' => $request->cost_price ?? 0,
                'current_stock' => $request->current_stock ?? 0,
                'min_stock_alert' => $request->min_stock_alert ?? 5,
                'expiry_date' => $request->expiry_date,
                'is_active' => true,
            ]);

            if ($request->wholesale_price && $request->wholesale_min_qty) {
                ProductPriceTier::create([
                    'product_id' => $product->id,
                    'min_quantity' => $request->wholesale_min_qty,
                    'unit_price' => $request->wholesale_price,
                ]);
            }

            AuditLog::log('CREATE', 'Product', $product->id, null, ['name' => $product->name]);

            return redirect()->route('owner.products.index')->with('success', "Produk {$product->name} berhasil ditambahkan.");
        });
    }

    /**
     * Perbarui Data Produk
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'barcode' => 'nullable|string|max:255|unique:products,barcode,'.$product->id,
            'category_id' => 'nullable|exists:categories,id',
            'unit' => 'nullable|string|max:50',
            'selling_price' => 'required|integer|min:0',
            'cost_price' => 'nullable|integer|min:0',
            'min_stock_alert' => 'nullable|integer|min:0',
            'wholesale_price' => 'nullable|integer|min:0',
            'wholesale_min_qty' => 'nullable|numeric|min:1',
            'expiry_date' => 'nullable|date',
            'is_active' => 'nullable|boolean',
        ]);

        $oldValues = $product->toArray();

        $product->update([
            'name' => $request->name,
            'barcode' => $request->barcode,
            'category_id' => $request->category_id,
            'unit' => $request->unit ?? $product->unit,
            'selling_price' => $request->selling_price,
            'cost_price' => $request->cost_price ?? $product->cost_price,
            'min_stock_alert' => $request->min_stock_alert ?? $product->min_stock_alert,
            'expiry_date' => $request->expiry_date,
            'is_active' => $request->is_active ?? true,
        ]);

        if ($request->has('wholesale_price') && $request->has('wholesale_min_qty')) {
            ProductPriceTier::where('product_id', $product->id)->delete();
            if ($request->wholesale_price && $request->wholesale_min_qty) {
                ProductPriceTier::create([
                    'product_id' => $product->id,
                    'min_quantity' => $request->wholesale_min_qty,
                    'unit_price' => $request->wholesale_price,
                ]);
            }
        }

        AuditLog::log('UPDATE', 'Product', $product->id, $oldValues, $product->toArray());

        return redirect()->route('owner.products.index')->with('success', "Data produk {$product->name} berhasil diperbarui.");
    }

    /**
     * Hapus Produk ke Tempat Sampah (Soft Delete)
     */
    public function destroy(Product $product)
    {
        $name = $product->name;
        $id = $product->id;

        $product->delete();

        AuditLog::log('DELETE', 'Product', $id, ['name' => $name], null);

        return redirect()->route('owner.products.index')->with('success', "Produk {$name} dipindahkan ke Tempat Sampah.");
    }

    /**
     * Tempat Sampah (Recycle Bin) untuk Pemulihan Data
     */
    public function recycleBin(Request $request)
    {
        return $this->index($request);
    }

    /**
     * Pulihkan Data dari Tempat Sampah
     */
    public function restore($id)
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();

        AuditLog::log('RESTORE', 'Product', $product->id, null, ['name' => $product->name]);

        return redirect()->back()->with('success', "Produk {$product->name} berhasil dipulihkan dari Tempat Sampah.");
    }
}
