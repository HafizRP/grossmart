<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('cashier_id')->constrained('users');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('points_discount_amount')->default(0);
            $table->unsignedInteger('points_redeemed')->default(0);
            $table->unsignedInteger('points_earned')->default(0);
            $table->integer('rounding_amount')->default(0);
            $table->unsignedInteger('grand_total');
            $table->unsignedInteger('final_amount');
            $table->unsignedInteger('total_cost_price');
            $table->unsignedInteger('cash_received')->default(0);
            $table->unsignedInteger('cash_change')->default(0);
            $table->enum('status', ['COMPLETED', 'VOID'])->default('COMPLETED');
            $table->text('void_reason')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('invoice_number');
            $table->index('cashier_id');
            $table->index('shift_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
