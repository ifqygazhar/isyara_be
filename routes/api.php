<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Dictionary\LetterController;
use App\Http\Controllers\Api\Dictionary\WordController;
use App\Http\Controllers\Api\Information\CommunityController;
use App\Http\Controllers\Api\Information\EventController;
use App\Http\Controllers\Api\Information\NewsController;
use App\Http\Controllers\Api\Quiz\LevelController;
use App\Http\Controllers\Api\Quiz\QuestionController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {

    // --- KHUSUS ADMIN ---
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Halo Admin!']);
        });

        Route::post('/dictionary/letters', [LetterController::class, 'store']);
        Route::put('/dictionary/letters/{id}', [LetterController::class, 'update']);
        Route::delete('/dictionary/letters/{id}', [LetterController::class, 'destroy']);

        Route::post('/dictionary/words', [WordController::class, 'store']);
        Route::put('/dictionary/words/{id}', [WordController::class, 'update']);
        Route::delete('/dictionary/words/{id}', [WordController::class, 'destroy']);

        // News
        Route::post('/information/news', [NewsController::class, 'store']);
        Route::put('/information/news/{id}', [NewsController::class, 'update']);
        Route::delete('/information/news/{id}', [NewsController::class, 'destroy']);

        // Events
        Route::post('/information/events', [EventController::class, 'store']);
        Route::put('/information/events/{id}', [EventController::class, 'update']);
        Route::delete('/information/events/{id}', [EventController::class, 'destroy']);

        // Community
        Route::post('/information/community', [CommunityController::class, 'store']);
        Route::put('/information/community/{id}', [CommunityController::class, 'update']);
        Route::delete('/information/community/{id}', [CommunityController::class, 'destroy']);

        // Levels (Admin only: create, update, delete)
        Route::post('/quiz/levels', [LevelController::class, 'store']);
        Route::put('/quiz/levels/{levelId}', [LevelController::class, 'update']);
        Route::delete('/quiz/levels/{levelId}', [LevelController::class, 'destroy']);

        // Questions (Admin only: create, update, delete)
        Route::post('/quiz/levels/{levelId}/questions', [QuestionController::class, 'store']);
        Route::put('/quiz/levels/{levelId}/questions/{questionId}', [QuestionController::class, 'update']);
        Route::delete('/quiz/levels/{levelId}/questions/{questionId}', [QuestionController::class, 'destroy']);
    });

    // --- Bisa Semua Role ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', function () {
        return auth()->user();
    });

    Route::get('/dictionary/letters', [LetterController::class, 'index']);
    Route::get('/dictionary/letters/{id}', [LetterController::class, 'show']);
    Route::get('/dictionary/words', [WordController::class, 'index']);
    Route::get('/dictionary/words/{id}', [WordController::class, 'show']);

    // News
    Route::get('/information/news', [NewsController::class, 'index']);
    Route::get('/information/news/{id}', [NewsController::class, 'show']);
    // Events
    Route::get('/information/events', [EventController::class, 'index']);
    Route::get('/information/events/{id}', [EventController::class, 'show']);
    // Community
    Route::get('/information/community', [CommunityController::class, 'index']);
    Route::get('/information/community/{id}', [CommunityController::class, 'show']);

    // Levels (Read)
    Route::get('/quiz/levels', [LevelController::class, 'index']);
    Route::get('/quiz/levels/{levelId}', [LevelController::class, 'show']);

    // Questions (Read)
    Route::get('/quiz/levels/{levelId}/questions', [QuestionController::class, 'index']);
    Route::get('/quiz/levels/{levelId}/questions/{questionId}', [QuestionController::class, 'show']);

    // Check Answer & Completion (User)
    Route::post('/quiz/levels/{levelId}/questions/{questionId}/answer', [QuestionController::class, 'checkAnswer']);
    Route::get('/quiz/levels/{levelId}/completion', [QuestionController::class, 'checkCompletion']);

});
