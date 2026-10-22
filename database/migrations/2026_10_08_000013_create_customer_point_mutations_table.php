<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_point_mutations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers');
            $table->unsignedBigInteger('sale_id')->nullable();
            $table->enum('type', ['EARN', 'REDEEM', 'ADJUSTMENT']);
            $table->integer('points_change');
            $table->unsignedInteger('points_balance_after');
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['customer_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_point_mutations');
    }
};
