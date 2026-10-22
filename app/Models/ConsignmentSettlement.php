<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsignmentSettlement extends Model
{
    use HasFactory;

    protected $fillable = [
        'settlement_number',
        'consignor_id',
        'start_date',
        'end_date',
        'total_sold_quantity',
        'total_payable_amount',
        'total_store_profit',
        'status',
        'paid_at',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_sold_quantity' => 'float',
        'total_payable_amount' => 'integer',
        'total_store_profit' => 'integer',
        'paid_at' => 'datetime',
    ];

    public function consignor()
    {
        return $this->belongsTo(Consignor::class);
    }

    public function items()
    {
        return $this->hasMany(ConsignmentSettlementItem::class, 'settlement_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
