<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consignment_settlement_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('settlement_id')->constrained('consignment_settlements')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->decimal('sold_quantity', 10, 2);
            $table->unsignedInteger('consignor_split_price');
            $table->unsignedInteger('selling_price_snapshot');
            $table->unsignedInteger('total_payable');
            $table->unsignedInteger('store_profit');

            $table->index('settlement_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consignment_settlement_items');
    }
};
