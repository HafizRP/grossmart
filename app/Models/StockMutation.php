<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMutation extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'type',
        'quantity_change',
        'stock_before',
        'stock_after',
        'reference_number',
        'note',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'quantity_change' => 'float',
        'stock_before' => 'float',
        'stock_after' => 'float',
        'created_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}