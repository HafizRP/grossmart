<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductPriceTier extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'min_quantity', 'unit_price'];

    protected $casts = [
        'min_quantity' => 'float',
        'unit_price' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}