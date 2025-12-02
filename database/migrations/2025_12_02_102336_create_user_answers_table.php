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
        Schema::create('user_answers', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('level_id');
            $table->unsignedBigInteger('question_id');
            $table->boolean('is_correct');
            $table->primary(['user_id', 'question_id', 'level_id']);

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // composite foreign key to questions(id, level_id)
            $table->foreign(['question_id', 'level_id'])->references(['id', 'level_id'])->on('questions')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_answers');
    }
};
