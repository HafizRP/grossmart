<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_drops', function (Blueprint $table) {
            $table->id();
            $table->string('drop_number')->unique();
            $table->foreignId('shift_id')->constrained('cashier_shifts');
            $table->foreignId('cashier_id')->constrained('users');
            $table->unsignedInteger('amount');
            $table->text('notes')->nullable();
            $table->foreignId('received_by')->constrained('users');
            $table->timestamp('created_at')->useCurrent();

            $table->index('shift_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_drops');
    }
};
