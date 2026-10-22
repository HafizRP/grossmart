<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductUnitConversion extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'unit_name', 'multiplier', 'selling_price', 'barcode'];

    protected $casts = [
        'multiplier' => 'float',
        'selling_price' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
