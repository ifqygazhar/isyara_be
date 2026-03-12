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
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->foreign('level_id')->references('id')->on('levels')->onUpdate('cascade')->onDelete('cascade');
        });

        Schema::table('user_answers', function (Blueprint $table) {
            $table->dropForeign(['question_id', 'level_id']);
            $table->foreign(['question_id', 'level_id'])->references(['id', 'level_id'])->on('questions')->onUpdate('cascade')->onDelete('cascade');
        });

        Schema::table('user_progress', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->foreign('level_id')->references('id')->on('levels')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting back to restrict on update (default without cascade)
        Schema::table('user_progress', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->foreign('level_id')->references('id')->on('levels')->onDelete('cascade');
        });

        Schema::table('user_answers', function (Blueprint $table) {
            $table->dropForeign(['question_id', 'level_id']);
            $table->foreign(['question_id', 'level_id'])->references(['id', 'level_id'])->on('questions')->onDelete('cascade');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->foreign('level_id')->references('id')->on('levels')->onDelete('cascade');
        });
    }
};
