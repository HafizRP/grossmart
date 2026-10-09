<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('barcode')->nullable()->unique();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->enum('product_type', ['REGULAR', 'CONSIGNMENT', 'BUNDLE'])->default('REGULAR');
            $table->foreignId('consignor_id')->nullable()->constrained('consignors')->nullOnDelete();
            $table->unsignedInteger('consignor_split_price')->nullable();
            $table->string('unit')->default('pcs');
            $table->string('image_url')->nullable();
            $table->unsignedInteger('selling_price');
            $table->unsignedInteger('cost_price');
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->unsignedInteger('min_stock_alert')->default(5);
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('name');
            $table->index('barcode');
            $table->index('category_id');
            $table->index('product_type');
            $table->index('expiry_date');
        });
    }

    public function down(): void {
        Schema::dropIfExists('products');
    }
};