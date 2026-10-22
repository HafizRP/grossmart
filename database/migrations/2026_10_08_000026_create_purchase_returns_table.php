<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique();
            $table->foreignId('purchase_id')->constrained('purchases');
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->unsignedInteger('total_amount');
            $table->text('reason');
            $table->enum('status', ['PENDING', 'COMPLETED'])->default('COMPLETED');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index('purchase_id');
            $table->index('supplier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_returns');
    }
};
