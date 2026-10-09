<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeldCart extends Model
{
    use HasFactory;

    protected $fillable = [
        'hold_number',
        'cashier_id',
        'shift_id',
        'customer_id',
        'cart_data',
        'notes',
    ];

    protected $casts = [
        'cart_data' => 'array',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function shift()
    {
        return $this->belongsTo(CashierShift::class, 'shift_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}