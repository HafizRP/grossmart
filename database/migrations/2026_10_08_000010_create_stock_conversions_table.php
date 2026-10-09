<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('stock_conversions', function (Blueprint $table) {
            $table->id();
            $table->string('conversion_number')->unique();
            $table->foreignId('source_product_id')->constrained('products');
            $table->decimal('source_quantity', 10, 2);
            $table->foreignId('target_product_id')->constrained('products');
            $table->decimal('conversion_ratio', 10, 2);
            $table->decimal('target_quantity', 10, 2);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index('source_product_id');
            $table->index('target_product_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('stock_conversions');
    }
};