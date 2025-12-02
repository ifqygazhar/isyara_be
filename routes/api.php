<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/profile', function () {
        return auth()->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // --- KHUSUS ADMIN ---
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Halo Admin!']);
        });
    });
});
