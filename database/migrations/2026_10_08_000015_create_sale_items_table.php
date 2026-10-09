<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->string('product_name_snapshot');
            $table->string('unit_snapshot');
            $table->unsignedInteger('cost_price_snapshot');
            $table->unsignedInteger('selling_price_snapshot');
            $table->decimal('quantity', 10, 2);
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('subtotal');

            $table->index('sale_id');
            $table->index('product_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sale_items');
    }
};