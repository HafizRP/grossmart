<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockConversion extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversion_number',
        'source_product_id',
        'source_quantity',
        'target_product_id',
        'conversion_ratio',
        'target_quantity',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'source_quantity' => 'float',
        'conversion_ratio' => 'float',
        'target_quantity' => 'float',
    ];

    public function sourceProduct()
    {
        return $this->belongsTo(Product::class, 'source_product_id');
    }

    public function targetProduct()
    {
        return $this->belongsTo(Product::class, 'target_product_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
