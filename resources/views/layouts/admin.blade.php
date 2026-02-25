<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard Admin') - Isyara</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="bg-gray-100">
    <div class="min-h-screen flex relative">
        <!-- Sidebar -->
        <aside id="sidebar"
            class="fixed inset-y-0 left-0 z-50 w-64 bg-indigo-700 text-white transform -translate-x-full lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out">
            <div class="p-6">
                <h1 class="text-2xl font-bold">Admin Isyara</h1>
            </div>
            <nav class="mt-6">
                <a href="{{ route('admin.dashboard') }}"
                    class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.dashboard') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-home mr-2"></i> Dashboard
                </a>
                <a href="{{ route('admin.users') }}"
                    class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.users*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-users mr-2"></i> Pengguna
                </a>
                <a href="{{ route('admin.letters') }}"
                    class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.letters*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-font mr-2"></i> Huruf
                </a>
                <a href="{{ route('admin.words') }}"
                    class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.words*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-book mr-2"></i> Kata
                </a>
                <a href="{{ route('admin.levels') }}"
                    class="block px-6 py-3 hover:bg-indigo-600 {{ request()->routeIs('admin.levels*') ? 'bg-indigo-600' : '' }}">
                    <i class="fas fa-layer-group mr-2"></i> Level Kuis
                </a>
                <form action="{{ route('admin.logout') }}" method="POST" class="px-6 py-3">
                    @csrf
                    <button type="submit" class="w-full text-left hover:bg-indigo-600 px-0">
                        <i class="fas fa-sign-out-alt mr-2"></i> Keluar
                    </button>
                </form>
            </nav>
        </aside>

        <!-- Overlay for mobile -->
        <div id="sidebarOverlay" class="fixed inset-0  lg:hidden hidden"></div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col w-full lg:w-auto">
            <!-- Header -->
            <header class="bg-white shadow-sm">
                <div class="px-4 lg:px-6 py-4 flex justify-between items-center">
                    <!-- Hamburger Button -->
                    <button id="sidebarToggle" class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>

                    <div class="flex items-center gap-4 lg:w-full lg:justify-between">
                        <h2 class="text-lg lg:text-xl font-semibold text-gray-800 hidden lg:block">
                            @yield('header', 'Dashboard')</h2>
                        <div class="flex items-center space-x-2 lg:space-x-4">
                            <span
                                class="text-sm lg:text-base text-gray-600 hidden sm:inline">{{ auth()->user()->name }}</span>
                            <span
                                class="px-2 lg:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs lg:text-sm">Admin</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <main class="flex-1 p-4 lg:p-6 overflow-auto">
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

    <!-- Store auth token -->
    @if(session('auth_token'))
        <script>
            localStorage.setItem('auth_token', '{{ session('auth_token') }}');
        </script>
    @endif

    <!-- API Client -->
    <script src="{{ asset('js/admin/api-client.js') }}"></script>

    <!-- Sidebar Toggle Script -->
    <script>
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        function openSidebar() {
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }

        sidebarToggle?.addEventListener('click', () => {
            if (sidebar.classList.contains('-translate-x-full')) {
                openSidebar();
            } else {
                closeSidebar();
            }
        });

        sidebarOverlay?.addEventListener('click', closeSidebar);

        // Close sidebar when clicking on a link (mobile only)
        const sidebarLinks = sidebar.querySelectorAll('a, button[type="submit"]');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    closeSidebar();
                }
            });
        });

        // Close sidebar on window resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                closeSidebar();
            }
        });
    </script>

    <!-- Page Specific Scripts -->
    @stack('scripts')
</body>

</html>