<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierPayablePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_number',
        'purchase_id',
        'supplier_id',
        'amount',
        'payment_method',
        'notes',
        'created_by',
        'shift_id',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function shift()
    {
        return $this->belongsTo(CashierShift::class, 'shift_id');
    }
}