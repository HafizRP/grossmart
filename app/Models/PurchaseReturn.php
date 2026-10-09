<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseReturn extends Model
{
    use HasFactory;

    protected $fillable = [
        'return_number',
        'purchase_id',
        'supplier_id',
        'total_amount',
        'reason',
        'status',
        'created_by',
    ];

    protected $casts = [
        'total_amount' => 'integer',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseReturnItem::class, 'return_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}