<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'barcode',
        'category_id',
        'product_type',
        'consignor_id',
        'consignor_split_price',
        'unit',
        'image_url',
        'selling_price',
        'cost_price',
        'current_stock',
        'min_stock_alert',
        'expiry_date',
        'is_active',
    ];

    protected $appends = [
        'sku',
    ];

    protected $casts = [
        'selling_price' => 'integer',
        'cost_price' => 'integer',
        'consignor_split_price' => 'integer',
        'current_stock' => 'float',
        'min_stock_alert' => 'integer',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function getSkuAttribute(): string
    {
        return $this->barcode ?? ('PRD-' . $this->id);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function consignor()
    {
        return $this->belongsTo(Consignor::class);
    }

    public function priceTiers()
    {
        return $this->hasMany(ProductPriceTier::class)->orderBy('min_quantity', 'asc');
    }

    public function unitConversions()
    {
        return $this->hasMany(ProductUnitConversion::class);
    }

    public function bundleComponents()
    {
        return $this->hasMany(ProductBundle::class, 'bundle_product_id');
    }

    public function stockMutations()
    {
        return $this->hasMany(StockMutation::class);
    }
}