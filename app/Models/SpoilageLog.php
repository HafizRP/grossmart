<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpoilageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'spoilage_number',
        'product_id',
        'quantity',
        'cost_price_snapshot',
        'total_loss_amount',
        'reason',
        'shift_id',
        'created_by',
    ];

    protected $casts = [
        'quantity' => 'float',
        'cost_price_snapshot' => 'integer',
        'total_loss_amount' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function shift()
    {
        return $this->belongsTo(CashierShift::class, 'shift_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
