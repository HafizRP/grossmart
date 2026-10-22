<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'sale_id',
        'product_id',
        'product_name_snapshot',
        'unit_snapshot',
        'cost_price_snapshot',
        'selling_price_snapshot',
        'quantity',
        'discount',
        'subtotal',
    ];

    protected $casts = [
        'cost_price_snapshot' => 'integer',
        'selling_price_snapshot' => 'integer',
        'quantity' => 'float',
        'discount' => 'integer',
        'subtotal' => 'integer',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
