<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'id' => 1,
                'username' => 'owner',
                'name' => 'Pak Haji Sulaiman (Pemilik Toko)',
                'email' => 'owner@grossmart.id',
                'password' => Hash::make('password'),
                'role' => 'owner',
                'is_active' => true,
            ],
            [
                'id' => 2,
                'username' => 'cashier1',
                'name' => 'Mbak Siti Rahma (Kasir 1)',
                'email' => 'cashier1@grossmart.id',
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'is_active' => true,
            ],
            [
                'id' => 3,
                'username' => 'cashier2',
                'name' => 'Mas Joko Susilo (Kasir 2)',
                'email' => 'cashier2@grossmart.id',
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'is_active' => true,
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['id' => $user['id']],
                array_merge($user, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
