<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sale_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->enum('payment_method', ['CASH', 'TRANSFER', 'TEMPO']);
            $table->unsignedInteger('amount');
            $table->string('payment_reference')->nullable();
            $table->timestamps();

            $table->index('sale_id');
            $table->index('payment_method');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sale_payments');
    }
};