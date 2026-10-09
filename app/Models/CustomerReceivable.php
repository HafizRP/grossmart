<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerReceivable extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'customer_id',
        'total_amount',
        'down_payment',
        'remaining_balance',
        'status',
        'due_date',
    ];

    protected $casts = [
        'total_amount' => 'integer',
        'down_payment' => 'integer',
        'remaining_balance' => 'integer',
        'due_date' => 'date',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function payments()
    {
        return $this->hasMany(ReceivablePayment::class, 'receivable_id');
    }
}