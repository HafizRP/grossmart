<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_price_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('min_quantity', 10, 2);
            $table->unsignedInteger('unit_price');
            $table->timestamps();

            $table->unique(['product_id', 'min_quantity']);
            $table->index('product_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('product_price_tiers');
    }
};