<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'address',
        'credit_limit',
        'loyalty_points',
        'is_active',
    ];

    protected $casts = [
        'credit_limit' => 'integer',
        'loyalty_points' => 'integer',
        'is_active' => 'boolean',
    ];

    public function pointMutations()
    {
        return $this->hasMany(CustomerPointMutation::class);
    }

    public function receivables()
    {
        return $this->hasMany(CustomerReceivable::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}