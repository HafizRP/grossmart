<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'amount',
        'source',
        'shift_id',
        'note',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function shift()
    {
        return $this->belongsTo(CashierShift::class, 'shift_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
