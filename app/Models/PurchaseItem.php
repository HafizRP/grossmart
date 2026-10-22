<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'purchase_id',
        'product_id',
        'product_name_snapshot',
        'unit_snapshot',
        'cost_price',
        'quantity',
        'subtotal',
    ];

    protected $casts = [
        'cost_price' => 'integer',
        'quantity' => 'float',
        'subtotal' => 'integer',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
