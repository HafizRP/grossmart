<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consignment_settlements', function (Blueprint $table) {
            $table->id();
            $table->string('settlement_number')->unique();
            $table->foreignId('consignor_id')->constrained('consignors');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_sold_quantity', 10, 2);
            $table->unsignedInteger('total_payable_amount');
            $table->unsignedInteger('total_store_profit');
            $table->enum('status', ['UNPAID', 'PAID'])->default('PAID');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index('consignor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consignment_settlements');
    }
};
