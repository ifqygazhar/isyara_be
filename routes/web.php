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

        // CRUD Routes untuk manage data
        Route::get('users', function () {
            return view('admin.users.index');
        })->name('users');
        Route::get('letters', function () {
            return view('admin.letters.index');
        })->name('letters');
        Route::get('words', function () {
            return view('admin.words.index');
        })->name('words');
        Route::get('news', function () {
            return view('admin.news.index');
        })->name('news');
        Route::get('events', function () {
            return view('admin.events.index');
        })->name('events');
        Route::get('community', function () {
            return view('admin.community.index');
        })->name('community');
        Route::get('levels', function () {
            return view('admin.levels.index');
        })->name('levels');
        Route::get('contact', function () {
            return view('admin.contact.index');
        })->name('contact');
    });
});
