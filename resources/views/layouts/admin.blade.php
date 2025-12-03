<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin Dashboard') - Isyara</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-indigo-700 text-white flex-shrink-0">
            <div class="p-6">
                <h1 class="text-2xl font-bold">Isyara Admin</h1>
            </div>
            <nav class="mt-6">
                <a href="{{ route('admin.dashboard') }}" class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.dashboard') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-home mr-2"></i> Dashboard
                </a>
                <a href="{{ route('admin.users') }}" class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.users*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-users mr-2"></i> Users
                </a>
                <a href="{{ route('admin.letters') }}" class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.letters*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-font mr-2"></i> Letters
                </a>
                <a href="{{ route('admin.words') }}" class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.words*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-book mr-2"></i> Words
                </a>
                <a href="{{ route('admin.news') }}" class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.news*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-newspaper mr-2"></i> News
                </a>
                <a href="{{ route('admin.events') }}" class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.events*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-calendar mr-2"></i> Events
                </a>
                <a href="{{ route('admin.community') }}" class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.community*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-people-group mr-2"></i> Community
                </a>
                <a href="{{ route('admin.levels') }}" class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.levels*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-layer-group mr-2"></i> Quiz Levels
                </a>
                <a href="{{ route('admin.contact') }}" class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.contact*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-envelope mr-2"></i> Contact Messages
                </a>
                <form action="{{ route('admin.logout') }}" method="POST" class="px-6 py-3">
                    @csrf
                    <button type="submit" class="w-full text-left hover:bg-indigo-600 px-0">
                        <i class="fas fa-sign-out-alt mr-2"></i> Logout
                    </button>
                </form>
            </nav>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col">
            <!-- Header -->
            <header class="bg-white shadow-sm">
                <div class="px-6 py-4 flex justify-between items-center">
                    <h2 class="text-xl font-semibold text-gray-800">@yield('header', 'Dashboard')</h2>
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-600">{{ auth()->user()->name }}</span>
                        <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">Admin</span>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <main class="flex-1 p-6 overflow-auto">
                @if(session('success'))
                    <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                        {{ session('success') }}
                    </div>
                @endif

                @if(session('error'))
                    <div class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {{ session('error') }}
                    </div>
                @endif

                @yield('content')
            </main>
        </div>
    </div>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</body>
</html>