<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashierShift extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashier_id',
        'start_time',
        'end_time',
        'starting_cash',
        'total_cash_sales',
        'total_down_payment_cash',
        'total_transfer_sales',
        'total_receivable_cash_paid',
        'total_cash_expenses',
        'total_cash_drops',
        'total_supplier_paid_from_drawer',
        'total_cash_voided',
        'expected_cash_ending',
        'actual_cash_ending',
        'cash_difference',
        'denomination_details',
        'notes',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'starting_cash' => 'integer',
        'total_cash_sales' => 'integer',
        'total_down_payment_cash' => 'integer',
        'total_transfer_sales' => 'integer',
        'total_receivable_cash_paid' => 'integer',
        'total_cash_expenses' => 'integer',
        'total_cash_drops' => 'integer',
        'total_supplier_paid_from_drawer' => 'integer',
        'total_cash_voided' => 'integer',
        'expected_cash_ending' => 'integer',
        'actual_cash_ending' => 'integer',
        'cash_difference' => 'integer',
        'denomination_details' => 'array',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function cashDrops()
    {
        return $this->hasMany(CashDrop::class, 'shift_id');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'shift_id');
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class, 'shift_id');
    }

    public function calculateExpectedCashEnding(): int
    {
        return (int) (
            $this->starting_cash +
            $this->total_cash_sales +
            $this->total_down_payment_cash +
            $this->total_receivable_cash_paid -
            $this->total_cash_expenses -
            $this->total_cash_drops -
            $this->total_supplier_paid_from_drawer -
            $this->total_cash_voided
        );
    }
}
