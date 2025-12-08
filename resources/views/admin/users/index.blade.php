@extends('layouts.admin')

@section('title', 'Manajemen Pengguna')

@section('content')
<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
    <button class="cursor-pointer w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition" id="addUserBtn">
        <i class="fas fa-plus"></i>
        <span>Tambah Pengguna</span>
    </button>
</div>

<div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b">
        <input type="text" id="searchInput" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Cari pengguna...">
    </div>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Email</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Peran</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Gambar</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Dibuat</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                </tr>
            </thead>
            <tbody id="usersTableBody" class="bg-white divide-y divide-gray-200">
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                        <div class="flex items-center justify-center gap-2">
                            <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Memuat...</span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal -->
<div id="userModal" class="hidden shadow-xl fixed inset-0  bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b">
            <h2 id="modalTitle" class="text-xl font-semibold text-gray-900">Tambah Pengguna</h2>
            <button class="cursor-pointer text-gray-400 hover:text-gray-600 close">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
        <div class="p-6">
            <form id="userForm" class="space-y-4">
                <input type="hidden" id="userId">
                
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                    <input type="text" id="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Nama lengkap pengguna">
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" id="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="email@example.com">
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                        Kata Sandi <span id="passwordHint" class="text-gray-500 text-xs">(Kosongkan untuk tetap menggunakan yang sekarang)</span>
                    </label>
                    <input type="password" id="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Minimal 8 karakter">
                </div>

                <div>
                    <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Peran *</label>
                    <select id="role" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option value="user">Pengguna</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <!-- Image Upload Options -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Gambar Profil</label>
                    
                    <!-- Tab Buttons -->
                    <div class="flex rounded-lg border border-gray-300 mb-3">
                        <button type="button" id="uploadTabBtn" class="flex-1 px-4 py-2 text-sm font-medium rounded-l-lg bg-indigo-50 text-indigo-600 border-r border-gray-300">
                            <i class="fas fa-upload mr-1"></i> Upload Foto
                        </button>
                        <button type="button" id="urlTabBtn" class="flex-1 px-4 py-2 text-sm font-medium rounded-r-lg bg-white text-gray-700 hover:bg-gray-50">
                            <i class="fas fa-link mr-1"></i> Link Foto
                        </button>
                    </div>

                    <!-- Upload Tab Content -->
                    <div id="uploadTab" class="space-y-2">
                        <div class="flex items-center justify-center w-full">
                            <label for="imageFile" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                    <p class="mb-2 text-sm text-gray-500">
                                        <span class="font-semibold">Klik untuk upload</span> atau drag & drop
                                    </p>
                                    <p class="text-xs text-gray-500">PNG, JPG, GIF (MAX. 2MB)</p>
                                </div>
                                <input id="imageFile" type="file" class="hidden" accept="image/*">
                            </label>
                        </div>
                        <div id="imagePreview" class="hidden">
                            <img id="previewImg" src="" alt="Preview" class="w-full h-32 object-cover rounded-lg border-2 border-gray-300">
                            <button type="button" id="removeImageBtn" class="mt-2 text-sm text-red-600 hover:text-red-800">
                                <i class="fas fa-times mr-1"></i> Hapus Gambar
                            </button>
                        </div>
                    </div>

                    <!-- URL Tab Content -->
                    <div id="urlTab" class="hidden space-y-2">
                        <input type="url" id="imageUrl" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="https://example.com/image.jpg">
                        <p class="text-xs text-gray-500">
                            <i class="fas fa-info-circle"></i> Masukkan URL lengkap gambar profil
                        </p>
                        <div id="urlImagePreview" class="hidden mt-2">
                            <img id="urlPreviewImg" src="" alt="Preview" class="w-full h-32 object-cover rounded-lg border-2 border-gray-300">
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-4 border-t">
                    <button type="button" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition" id="cancelBtn">Batal</button>
                    <button type="submit" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition" id="saveBtn">Simpan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/admin/users.js') }}"></script>
@endpush