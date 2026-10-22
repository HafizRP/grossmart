<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Sequence extends Model
{
    use HasFactory;

    protected $fillable = ['prefix', 'current_date', 'last_number'];

    protected $casts = [
        'last_number' => 'integer',
    ];

    /**
     * Generate atomik reference / invoice number.
     * Example: TRX-20261008-0001
     */
    public static function nextNumber(string $prefix, ?string $date = null, int $digits = 4): string
    {
        $date = $date ?? date('Ymd');

        return DB::transaction(function () use ($prefix, $date, $digits) {
            $seq = self::where('prefix', $prefix)
                ->where('current_date', $date)
                ->lockForUpdate()
                ->first();

            if (! $seq) {
                $seq = self::create([
                    'prefix' => $prefix,
                    'current_date' => $date,
                    'last_number' => 0,
                ]);
            }

            $seq->increment('last_number');
            $padded = str_pad((string) $seq->last_number, $digits, '0', STR_PAD_LEFT);

            return "{$prefix}-{$date}-{$padded}";
        });
    }
}
