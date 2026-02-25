@extends('layouts.admin')

@section('title', 'Dashboard')
@section('header', 'Ringkasan Dashboard')

@section('content')
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Users Card -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <i class="fas fa-users text-white text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600">Total Pengguna</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['users'] }}</p>
                </div>
            </div>
        </div>

        <!-- Letters Card -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <i class="fas fa-font text-white text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600">Huruf</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['letters'] }}</p>
                </div>
            </div>
        </div>

        <!-- Words Card -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <i class="fas fa-book text-white text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600">Kata</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['words'] }}</p>
                </div>
            </div>
        </div>

        <!-- Quiz Levels Card -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <i class="fas fa-layer-group text-white text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600">Level Kuis</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['levels'] }}</p>
                </div>
            </div>
        </div>

        <!-- Contact Messages Card -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0 bg-teal-500 rounded-md p-3">
                    <i class="fas fa-envelope text-white text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600">Total Pesan</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['messages'] }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activities -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Users -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h3 class="text-lg font-semibold">Pengguna Terbaru</h3>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    @forelse($recentUsers as $user)
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    @if($user->image_url)
                                        <img src="{{ $user->image_url }}" alt="{{ $user->name }}"
                                            class="w-10 h-10 rounded-full object-cover">
                                    @else
                                        <span class="text-indigo-600 font-semibold">{{ substr($user->name, 0, 1) }}</span>
                                    @endif
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-gray-900">{{ $user->name }}</p>
                                    <p class="text-xs text-gray-500">{{ $user->email }}</p>
                                </div>
                            </div>
                            <span class="text-xs text-gray-400">{{ $user->created_at->diffForHumans() }}</span>
                        </div>
                    @empty
                        <p class="text-gray-500 text-center py-4">Tidak ada pengguna terbaru</p>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Recent Contact Messages -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h3 class="text-lg font-semibold">Pesan Terbaru</h3>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    @forelse($recentMessages as $message)
                        <div class="border-l-4 border-indigo-500 pl-4">
                            <div class="flex justify-between">
                                <p class="text-sm font-medium text-gray-900">{{ $message->user->name ?? 'User' }}</p>
                                <span class="text-xs text-gray-400">{{ $message->created_at->diffForHumans() }}</span>
                            </div>
                            <p class="text-sm text-gray-600 mt-2">{{ Str::limit($message->message, 100) }}</p>
                        </div>
                    @empty
                        <p class="text-gray-500 text-center py-4">Tidak ada pesan terbaru</p>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
@endsection