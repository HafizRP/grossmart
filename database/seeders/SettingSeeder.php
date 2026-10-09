<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'store_name', 'value' => 'Toko Kelontong Berkah Grossmart'],
            ['key' => 'store_tagline', 'value' => 'Sedia Sembako, Kebutuhan Rumah Tangga & Titipan Warga'],
            ['key' => 'store_address', 'value' => 'Jl. Pasar Tradisional No. 18, RT 03/RW 02, Sukamaju'],
            ['key' => 'store_phone', 'value' => '081234567890'],
            ['key' => 'receipt_footer', 'value' => 'Terima kasih telah berbelanja di Grossmart! Semoga rezeki Anda lancar & berkah.'],
            ['key' => 'thermal_paper_width', 'value' => '58mm'],
            ['key' => 'sound_enabled', 'value' => 'true'],
            ['key' => 'cashier_idle_timeout_minutes', 'value' => '45'],
            ['key' => 'cash_rounding_unit', 'value' => '100'],
            ['key' => 'points_earn_per_amount', 'value' => '10000'], // Tiap belanja Rp 10.000 dapat 1 poin
            ['key' => 'points_redeem_value', 'value' => '100'],      // 1 poin bernilai Rp 100 diskon
            ['key' => 'auto_backup_enabled', 'value' => 'true'],
            ['key' => 'auto_backup_time', 'value' => '23:00'],
        ];

        foreach ($settings as $setting) {
            DB::table('app_settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
