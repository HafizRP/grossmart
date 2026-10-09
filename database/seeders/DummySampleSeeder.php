<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DummySampleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Kategori Sembako & Toko Kelontong
        $categories = [
            ['id' => 1, 'name' => 'Beras & Sembako Pokok'],
            ['id' => 2, 'name' => 'Minyak Goreng & Margarin'],
            ['id' => 3, 'name' => 'Gula & Bumbu Dapur'],
            ['id' => 4, 'name' => 'Mie Instan & Makanan Cepat Saji'],
            ['id' => 5, 'name' => 'Minuman, Kopi & Susu Kemasan'],
            ['id' => 6, 'name' => 'Sabun, Shampo & Perawatan Tubuh'],
            ['id' => 7, 'name' => 'Deterjen & Pembersih Rumah'],
            ['id' => 8, 'name' => 'Camilan & Biskuit'],
            ['id' => 9, 'name' => 'Titipan Kue & Makanan Warga (Konsinyasi)'],
        ];
        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(
                ['id' => $cat['id']],
                array_merge($cat, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        // 2. Penitip Barang Konsinyasi (Warga Sekitar)
        $consignors = [
            [
                'id' => 1,
                'name' => 'Bu Daryati (Kue Basah & Lemper)',
                'phone' => '081311223344',
                'address' => 'RT 02 / RW 01 Dusun Krajan',
                'is_active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Bu RT Sumirah (Peyek & Keripik Renyah)',
                'phone' => '081299887766',
                'address' => 'Rumah No. 12 Depan Pos Ronda',
                'is_active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Pak Wardi (Telur Asin Brebes Asli)',
                'phone' => '081577665544',
                'address' => 'Jl. Mawar No. 05 Sukamaju',
                'is_active' => true,
            ],
        ];
        foreach ($consignors as $consignor) {
            DB::table('consignors')->updateOrInsert(
                ['id' => $consignor['id']],
                array_merge($consignor, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // 3. Pemasok (Agen Grosir / Supplier)
        $suppliers = [
            [
                'id' => 1,
                'name' => 'Agen Sembako Makmur Jaya',
                'phone' => '081298765432',
                'address' => 'Pasar Induk Sembako Blok B1 No. 4',
                'is_active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Distributor Indofood Sukses Berkah',
                'phone' => '081345678901',
                'address' => 'Kawasan Pergudangan Niaga Kav. 18',
                'is_active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Grosir Unilever Harapan Kita',
                'phone' => '081123456789',
                'address' => 'Jl. Industri Raya No. 45 Jakarta Timur',
                'is_active' => true,
            ],
        ];
        foreach ($suppliers as $supp) {
            DB::table('suppliers')->updateOrInsert(
                ['id' => $supp['id']],
                array_merge($supp, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // 4. Pelanggan Tetap / Member
        $customers = [
            [
                'id' => 1,
                'name' => 'Bu Eni (Ketua PKK RW 02)',
                'phone' => '081288990011',
                'address' => 'Komplek Griya Indah Blok C3 No. 8',
                'credit_limit' => 500000,
                'loyalty_points' => 125,
                'is_active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Warung Kopi Bu Slamet',
                'phone' => '081377889900',
                'address' => 'Pertigaan Jalan Pasar Desa',
                'credit_limit' => 1000000,
                'loyalty_points' => 340,
                'is_active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Mas Agus Pelanggan Reguler',
                'phone' => '085611223344',
                'address' => 'Jl. Melati No. 14',
                'credit_limit' => null,
                'loyalty_points' => 45,
                'is_active' => true,
            ],
        ];
        foreach ($customers as $cust) {
            DB::table('customers')->updateOrInsert(
                ['id' => $cust['id']],
                array_merge($cust, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // 5. Produk Reguler & Konsinyasi
        $products = [
            [
                'id' => 1,
                'name' => 'Beras Rojolele Super 5kg',
                'barcode' => '8991234000018',
                'category_id' => 1,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'karung',
                'selling_price' => 68000,
                'cost_price' => 62000,
                'current_stock' => 45.00,
                'min_stock_alert' => 10,
                'expiry_date' => null,
                'is_active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Minyak Goreng Bimoli Spesial 2 Liter',
                'barcode' => '8991234000025',
                'category_id' => 2,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'pouch',
                'selling_price' => 36000,
                'cost_price' => 32500,
                'current_stock' => 60.00,
                'min_stock_alert' => 15,
                'expiry_date' => null,
                'is_active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Gula Pasir Gulaku Putih 1kg',
                'barcode' => '8991234000032',
                'category_id' => 3,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'bungkus',
                'selling_price' => 17500,
                'cost_price' => 15500,
                'current_stock' => 80.00,
                'min_stock_alert' => 20,
                'expiry_date' => null,
                'is_active' => true,
            ],
            [
                'id' => 4,
                'name' => 'Indomie Goreng Spesial 85g',
                'barcode' => '8998866200078',
                'category_id' => 4,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'bungkus',
                'selling_price' => 3100,
                'cost_price' => 2600,
                'current_stock' => 240.00,
                'min_stock_alert' => 40,
                'expiry_date' => now()->addMonths(8)->toDateString(),
                'is_active' => true,
            ],
            [
                'id' => 5,
                'name' => 'Indomie Kuah Ayam Bawang 69g',
                'barcode' => '8998866200085',
                'category_id' => 4,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'bungkus',
                'selling_price' => 3000,
                'cost_price' => 2500,
                'current_stock' => 160.00,
                'min_stock_alert' => 40,
                'expiry_date' => now()->addMonths(8)->toDateString(),
                'is_active' => true,
            ],
            [
                'id' => 6,
                'name' => 'Telur Ayam Negeri Segar 1kg',
                'barcode' => '2000001000009', // Prefix 20 untuk timbangan buah/telur EAN-13
                'category_id' => 1,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'kg',
                'selling_price' => 28000,
                'cost_price' => 25000,
                'current_stock' => 35.00,
                'min_stock_alert' => 10,
                'expiry_date' => now()->addDays(14)->toDateString(),
                'is_active' => true,
            ],
            [
                'id' => 7,
                'name' => 'Susu Kental Manis Frisian Flag Cokelat 370g',
                'barcode' => '8998866200108',
                'category_id' => 5,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'kaleng',
                'selling_price' => 12500,
                'cost_price' => 10800,
                'current_stock' => 50.00,
                'min_stock_alert' => 10,
                'expiry_date' => now()->addMonths(10)->toDateString(),
                'is_active' => true,
            ],
            [
                'id' => 8,
                'name' => 'Sabun Mandi Lifebuoy Merah 85g',
                'barcode' => '8999999000115',
                'category_id' => 6,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'batang',
                'selling_price' => 4500,
                'cost_price' => 3700,
                'current_stock' => 75.00,
                'min_stock_alert' => 15,
                'expiry_date' => null,
                'is_active' => true,
            ],
            [
                'id' => 9,
                'name' => 'Deterjen Bubuk Rinso Anti Noda 770g',
                'barcode' => '8999999000122',
                'category_id' => 7,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'bungkus',
                'selling_price' => 19500,
                'cost_price' => 17200,
                'current_stock' => 30.00,
                'min_stock_alert' => 8,
                'expiry_date' => null,
                'is_active' => true,
            ],
            [
                'id' => 10,
                'name' => 'Kopi Kapal Api Spesial Mix 10x24g',
                'barcode' => '8991001000139',
                'category_id' => 5,
                'product_type' => 'REGULAR',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'renceng',
                'selling_price' => 14000,
                'cost_price' => 12000,
                'current_stock' => 55.00,
                'min_stock_alert' => 10,
                'expiry_date' => now()->addMonths(12)->toDateString(),
                'is_active' => true,
            ],

            // Produk Konsinyasi Warga
            [
                'id' => 11,
                'name' => 'Lemper Ayam Spesial Bu Daryati',
                'barcode' => '8990001000011',
                'category_id' => 9,
                'product_type' => 'CONSIGNMENT',
                'consignor_id' => 1,
                'consignor_split_price' => 2500, // Setor penitip
                'unit' => 'biji',
                'selling_price' => 3000, // Eceran toko (laba toko Rp 500)
                'cost_price' => 2500,
                'current_stock' => 25.00,
                'min_stock_alert' => 5,
                'expiry_date' => now()->addDays(2)->toDateString(),
                'is_active' => true,
            ],
            [
                'id' => 12,
                'name' => 'Pastel Telur Sayur Bu Daryati',
                'barcode' => '8990001000028',
                'category_id' => 9,
                'product_type' => 'CONSIGNMENT',
                'consignor_id' => 1,
                'consignor_split_price' => 2500,
                'unit' => 'biji',
                'selling_price' => 3000,
                'cost_price' => 2500,
                'current_stock' => 20.00,
                'min_stock_alert' => 5,
                'expiry_date' => now()->addDays(2)->toDateString(),
                'is_active' => true,
            ],
            [
                'id' => 13,
                'name' => 'Peyek Kacang Gurih Bu RT',
                'barcode' => '8990002000018',
                'category_id' => 9,
                'product_type' => 'CONSIGNMENT',
                'consignor_id' => 2,
                'consignor_split_price' => 8000,
                'unit' => 'toples',
                'selling_price' => 10000, // Laba toko Rp 2.000
                'cost_price' => 8000,
                'current_stock' => 15.00,
                'min_stock_alert' => 3,
                'expiry_date' => now()->addMonths(1)->toDateString(),
                'is_active' => true,
            ],
            [
                'id' => 14,
                'name' => 'Telur Asin Masir Brebes Asli',
                'barcode' => '8990003000015',
                'category_id' => 9,
                'product_type' => 'CONSIGNMENT',
                'consignor_id' => 3,
                'consignor_split_price' => 3500,
                'unit' => 'butir',
                'selling_price' => 4500, // Laba toko Rp 1.000
                'cost_price' => 3500,
                'current_stock' => 40.00,
                'min_stock_alert' => 10,
                'expiry_date' => now()->addDays(20)->toDateString(),
                'is_active' => true,
            ],

            // Produk Paket Hemat (BUNDLE)
            [
                'id' => 15,
                'name' => 'Paket Sembako Berkah Hemat (Beras 5kg + Bimoli 2L + Gula 1kg)',
                'barcode' => '899BUNDLE00001',
                'category_id' => 1,
                'product_type' => 'BUNDLE',
                'consignor_id' => null,
                'consignor_split_price' => null,
                'unit' => 'paket',
                'selling_price' => 120000, // Total eceran normal Rp 121.500 (hemat Rp 1.500)
                'cost_price' => 110000,
                'current_stock' => 0.00, // Stok bundle dihitung dinamis dari komponennya
                'min_stock_alert' => 5,
                'expiry_date' => null,
                'is_active' => true,
            ],
        ];

        foreach ($products as $prod) {
            DB::table('products')->updateOrInsert(
                ['id' => $prod['id']],
                array_merge($prod, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // 6. Price Tiers (Grosir Bertingkat untuk Indomie Goreng)
        DB::table('product_price_tiers')->updateOrInsert(
            ['product_id' => 4, 'min_quantity' => 5.00],
            ['unit_price' => 3000, 'created_at' => now(), 'updated_at' => now()]
        );
        DB::table('product_price_tiers')->updateOrInsert(
            ['product_id' => 4, 'min_quantity' => 40.00],
            ['unit_price' => 2850, 'created_at' => now(), 'updated_at' => now()]
        );

        // 7. Multi-Satuan / Unit Conversion (Indomie Goreng: Dus = 40 Bungkus)
        DB::table('product_unit_conversions')->updateOrInsert(
            ['product_id' => 4, 'unit_name' => 'Dus'],
            [
                'multiplier' => 40.00,
                'selling_price' => 114000, // Rp 2.850 x 40
                'barcode' => '8998866200079',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 8. Komponen Bundle (Paket Sembako Berkah Hemat: ID 15)
        $bundleItems = [
            ['bundle_product_id' => 15, 'item_product_id' => 1, 'quantity' => 1.00], // Beras Rojolele 5kg
            ['bundle_product_id' => 15, 'item_product_id' => 2, 'quantity' => 1.00], // Bimoli 2L
            ['bundle_product_id' => 15, 'item_product_id' => 3, 'quantity' => 1.00], // Gula 1kg
        ];
        foreach ($bundleItems as $bItem) {
            DB::table('product_bundles')->updateOrInsert(
                ['bundle_product_id' => $bItem['bundle_product_id'], 'item_product_id' => $bItem['item_product_id']],
                array_merge($bItem, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // 9. Initial Sequences (Nomor Urut Dokumen Otomatis)
        $today = date('Ymd');
        $prefixes = ['TRX', 'HLD', 'DRP', 'SET', 'PO', 'KW-PIUT', 'KW-UTANG', 'RET', 'DMG', 'CNV'];
        foreach ($prefixes as $pfx) {
            DB::table('sequences')->updateOrInsert(
                ['prefix' => $pfx, 'current_date' => $today],
                ['last_number' => 0, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
