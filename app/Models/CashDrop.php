<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashDrop extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'drop_number',
        'shift_id',
        'cashier_id',
        'amount',
        'notes',
        'received_by',
        'created_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'created_at' => 'datetime',
    ];

    public function shift()
    {
        return $this->belongsTo(CashierShift::class, 'shift_id');
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
