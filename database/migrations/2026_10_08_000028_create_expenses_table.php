<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->unsignedInteger('amount');
            $table->enum('source', ['CASHIER_DRAWER', 'OWNER_FUNDS'])->default('CASHIER_DRAWER');
            $table->foreignId('shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
            $table->text('note');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index('shift_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
