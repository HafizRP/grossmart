<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('supplier_payable_payments', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number')->unique();
            $table->foreignId('purchase_id')->constrained('purchases');
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->unsignedInteger('amount');
            $table->enum('payment_method', ['CASH', 'TRANSFER'])->default('CASH');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
            $table->timestamps();

            $table->index('purchase_id');
            $table->index('shift_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('supplier_payable_payments');
    }
};