<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceivablePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_number',
        'receivable_id',
        'customer_id',
        'amount',
        'payment_method',
        'notes',
        'received_by',
        'shift_id',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function receivable()
    {
        return $this->belongsTo(CustomerReceivable::class, 'receivable_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function shift()
    {
        return $this->belongsTo(CashierShift::class, 'shift_id');
    }
}