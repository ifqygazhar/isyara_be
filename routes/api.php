<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactUsController;
use App\Http\Controllers\Api\Dictionary\LetterController;
use App\Http\Controllers\Api\Dictionary\WordController;
use App\Http\Controllers\Api\Information\CommunityController;
use App\Http\Controllers\Api\Information\EventController;
use App\Http\Controllers\Api\Information\NewsController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\Quiz\LevelController;
use App\Http\Controllers\Api\Quiz\QuestionController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/contact', [ContactUsController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {

    // --- KHUSUS ADMIN ---
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Halo Admin!']);
        });

        Route::post('/dictionary/letters', [LetterController::class, 'store']);
        Route::post('/dictionary/letters/{id}', [LetterController::class, 'update']);
        Route::delete('/dictionary/letters/{id}', [LetterController::class, 'destroy']);

        Route::post('/dictionary/words', [WordController::class, 'store']);
        Route::post('/dictionary/words/{id}', [WordController::class, 'update']);
        Route::delete('/dictionary/words/{id}', [WordController::class, 'destroy']);

        // News
        Route::post('/information/news', [NewsController::class, 'store']);
        Route::post('/information/news/{id}', [NewsController::class, 'update']);
        Route::delete('/information/news/{id}', [NewsController::class, 'destroy']);

        // Events
        Route::post('/information/events', [EventController::class, 'store']);
        Route::post('/information/events/{id}', [EventController::class, 'update']);
        Route::delete('/information/events/{id}', [EventController::class, 'destroy']);

        // Community
        Route::post('/information/community', [CommunityController::class, 'store']);
        Route::post('/information/community/{id}', [CommunityController::class, 'update']);
        Route::delete('/information/community/{id}', [CommunityController::class, 'destroy']);

        // Levels (Admin only: create, update, delete)
        Route::post('/quiz/levels', [LevelController::class, 'store']);
        Route::post('/quiz/levels/{levelId}', [LevelController::class, 'update']);
        Route::delete('/quiz/levels/{levelId}', [LevelController::class, 'destroy']);

        // Questions (Admin only: create, update, delete)
        Route::post('/quiz/levels/{levelId}/questions', [QuestionController::class, 'store']);
        Route::post('/quiz/levels/{levelId}/questions/{questionId}', [QuestionController::class, 'update']);
        Route::delete('/quiz/levels/{levelId}/questions/{questionId}', [QuestionController::class, 'destroy']);

        // Contact Us (Admin: view all, view single, delete)
        Route::get('/contact', [ContactUsController::class, 'index']);
        Route::get('/contact/{id}', [ContactUsController::class, 'show']);
        Route::delete('/contact/{id}', [ContactUsController::class, 'destroy']);

        // User Management (Admin only)
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::post('/users/{id}', [UserManagementController::class, 'update']); // Accept POST with _method=PUT
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
    });

    // --- Bisa Semua Role ---
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

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

    Route::post('/contact', [ContactUsController::class, 'store']);
});
