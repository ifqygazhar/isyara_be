<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\KamusHuruf;
use App\Models\KamusKata;
use App\Models\Level;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'users' => User::count(),
            'letters' => KamusHuruf::count(),
            'words' => KamusKata::count(),
            'messages' => Message::count(),
            'levels' => Level::count(),
        ];

        $recentUsers = User::latest()->take(5)->get();
        $recentMessages = Message::latest('created_at')->take(5)->get();

        return view('admin.dashboard', compact('stats', 'recentUsers', 'recentMessages'));
    }

    public function logout(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')->with('success', 'Logged out successfully');
    }
}
