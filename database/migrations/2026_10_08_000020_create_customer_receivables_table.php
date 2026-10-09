<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('customer_receivables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->unique()->constrained('sales');
            $table->foreignId('customer_id')->constrained('customers');
            $table->unsignedInteger('total_amount');
            $table->unsignedInteger('down_payment');
            $table->unsignedInteger('remaining_balance');
            $table->enum('status', ['UNPAID', 'PARTIAL', 'PAID', 'CANCELLED'])->default('UNPAID');
            $table->date('due_date')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('customer_receivables');
    }
};