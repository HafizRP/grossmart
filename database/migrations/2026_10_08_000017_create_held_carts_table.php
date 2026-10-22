<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('held_carts', function (Blueprint $table) {
            $table->id();
            $table->string('hold_number')->unique();
            $table->foreignId('cashier_id')->constrained('users');
            $table->foreignId('shift_id')->constrained('cashier_shifts');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->json('cart_data');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['cashier_id', 'shift_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('held_carts');
    }
};
