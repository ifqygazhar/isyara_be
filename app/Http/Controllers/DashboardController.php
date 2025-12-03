<?php

namespace App\Http\Controllers;

use App\Models\Community;
use App\Models\ContactUs;
use App\Models\EventModel;
use App\Models\KamusHuruf;
use App\Models\KamusKata;
use App\Models\Level;
use App\Models\News;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'users' => User::count(),
            'letters' => KamusKata::count(),
            'words' => KamusHuruf::count(),
            'news' => News::count(),
            'events' => EventModel::count(),
            'communities' => Community::count(),
            'levels' => Level::count(),
            'contacts' => ContactUs::count(),
        ];

        $recentUsers = User::latest()->take(5)->get();
        $recentContacts = ContactUs::latest('created_at')->take(5)->get();

        return view('admin.dashboard', compact('stats', 'recentUsers', 'recentContacts'));
    }

    public function logout(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')->with('success', 'Logged out successfully');
    }
}
