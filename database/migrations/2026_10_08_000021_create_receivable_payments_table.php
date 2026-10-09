<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('receivable_payments', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number')->unique();
            $table->foreignId('receivable_id')->constrained('customer_receivables');
            $table->foreignId('customer_id')->constrained('customers');
            $table->unsignedInteger('amount');
            $table->enum('payment_method', ['CASH', 'TRANSFER'])->default('CASH');
            $table->text('notes')->nullable();
            $table->foreignId('received_by')->constrained('users');
            $table->foreignId('shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
            $table->timestamps();

            $table->index('receivable_id');
            $table->index('shift_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('receivable_payments');
    }
};