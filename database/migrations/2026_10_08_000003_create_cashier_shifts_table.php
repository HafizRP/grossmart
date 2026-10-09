<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('cashier_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_id')->constrained('users');
            $table->timestamp('start_time')->useCurrent();
            $table->timestamp('end_time')->nullable();
            $table->unsignedInteger('starting_cash')->default(0);
            $table->unsignedInteger('total_cash_sales')->default(0);
            $table->unsignedInteger('total_down_payment_cash')->default(0);
            $table->unsignedInteger('total_transfer_sales')->default(0);
            $table->unsignedInteger('total_receivable_cash_paid')->default(0);
            $table->unsignedInteger('total_cash_expenses')->default(0);
            $table->unsignedInteger('total_cash_drops')->default(0);
            $table->unsignedInteger('total_supplier_paid_from_drawer')->default(0);
            $table->unsignedInteger('total_cash_voided')->default(0);
            $table->unsignedInteger('expected_cash_ending')->default(0);
            $table->unsignedInteger('actual_cash_ending')->nullable();
            $table->integer('cash_difference')->nullable();
            $table->json('denomination_details')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();

            $table->index(['cashier_id', 'status']);
            $table->index('start_time');
        });
    }

    public function down(): void {
        Schema::dropIfExists('cashier_shifts');
    }
};