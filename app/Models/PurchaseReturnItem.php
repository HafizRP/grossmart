<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseReturnItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'return_id',
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

    public function purchaseReturn()
    {
        return $this->belongsTo(PurchaseReturn::class, 'return_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
