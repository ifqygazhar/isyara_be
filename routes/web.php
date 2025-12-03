<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

// Admin Auth Routes
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
        Route::get('news', fn () => view('admin.news.index'))->name('news');
        Route::get('events', fn () => view('admin.events.index'))->name('events');
        Route::get('community', fn () => view('admin.community.index'))->name('community');
        Route::get('levels', fn () => view('admin.levels.index'))->name('levels');
        Route::get('contact', fn () => view('admin.contact.index'))->name('contact');
    });
});
