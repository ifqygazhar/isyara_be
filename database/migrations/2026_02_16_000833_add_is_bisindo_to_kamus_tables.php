<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('kamus_hurufs', function (Blueprint $table) {
            $table->boolean('is_bisindo')->default(false)->after('huruf');
        });

        Schema::table('kamus_katas', function (Blueprint $table) {
            $table->boolean('is_bisindo')->default(false)->after('kata');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kamus_hurufs', function (Blueprint $table) {
            $table->dropColumn('is_bisindo');
        });

        Schema::table('kamus_katas', function (Blueprint $table) {
            $table->dropColumn('is_bisindo');
        });
    }
};
