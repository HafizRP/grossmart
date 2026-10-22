<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsignmentSettlementItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'settlement_id',
        'product_id',
        'sold_quantity',
        'consignor_split_price',
        'selling_price_snapshot',
        'total_payable',
        'store_profit',
    ];

    protected $casts = [
        'sold_quantity' => 'float',
        'consignor_split_price' => 'integer',
        'selling_price_snapshot' => 'integer',
        'total_payable' => 'integer',
        'store_profit' => 'integer',
    ];

    public function settlement()
    {
        return $this->belongsTo(ConsignmentSettlement::class, 'settlement_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
