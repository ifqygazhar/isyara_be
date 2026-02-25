<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin/login');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('login', [AuthController::class, 'login'])->name('login.post');

    Route::middleware('admin')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::post('logout', [DashboardController::class, 'logout'])->name('logout');

        // Management Pages (View only - CRUD via API)
        Route::get('users', fn () => view('admin.users.index'))->name('users');
        Route::get('letters', fn () => view('admin.letters.index'))->name('letters');
        Route::get('words', fn () => view('admin.words.index'))->name('words');
        Route::get('levels', fn () => view('admin.levels.index'))->name('levels');
    });
});
