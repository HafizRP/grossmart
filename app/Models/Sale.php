<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'cashier_id',
        'customer_id',
        'shift_id',
        'subtotal',
        'discount',
        'points_discount_amount',
        'points_redeemed',
        'points_earned',
        'rounding_amount',
        'grand_total',
        'final_amount',
        'total_cost_price',
        'cash_received',
        'cash_change',
        'status',
        'void_reason',
        'voided_at',
        'voided_by',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'discount' => 'integer',
        'points_discount_amount' => 'integer',
        'points_redeemed' => 'integer',
        'points_earned' => 'integer',
        'rounding_amount' => 'integer',
        'grand_total' => 'integer',
        'final_amount' => 'integer',
        'total_cost_price' => 'integer',
        'cash_received' => 'integer',
        'cash_change' => 'integer',
        'voided_at' => 'datetime',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function shift()
    {
        return $this->belongsTo(CashierShift::class, 'shift_id');
    }

    public function voidedByUser()
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments()
    {
        return $this->hasMany(SalePayment::class);
    }

    public function receivable()
    {
        return $this->hasOne(CustomerReceivable::class);
    }
}