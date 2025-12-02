<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Dictionary\LetterController;
use App\Http\Controllers\Api\Dictionary\WordController;
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

});
