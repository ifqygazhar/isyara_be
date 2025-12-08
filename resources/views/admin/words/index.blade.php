@extends('layouts.admin')

@section('title', 'Manajemen Kata')

@section('content')
<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Kamus - Kata</h1>
    <button id="addWordBtn" class="cursor-pointer w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Kata
    </button>
</div>

<div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b border-gray-200">
        <input type="text" id="searchInput" placeholder="Cari kata..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
    </div>
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kata</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Gambar</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Dibuat Tanggal</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
            </thead>
            <tbody id="wordsTableBody" class="bg-white divide-y divide-gray-200">
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                        <div class="flex items-center justify-center">
                            <svg class="animate-spin h-5 w-5 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memuat...
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal -->
<div id="wordModal" class="hidden shadow-xl fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 id="modalTitle" class="text-xl font-semibold text-gray-900">Tambah Kata</h2>
            <button class="close text-gray-400 hover:text-gray-600 text-2xl font-light cursor-pointer">&times;</button>
        </div>
        <div class="p-6">
            <form id="wordForm">
                <input type="hidden" id="wordId">
                
                <div class="mb-4">
                    <label for="kata" class="block text-sm font-medium text-gray-700 mb-2">Kata *</label>
                    <input type="text" id="kata" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Contoh: Halo">
                </div>

                <!-- Image Upload Options -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Gambar Kata *</label>
                    
                    <!-- Tab Buttons -->
                    <div class="flex rounded-lg border border-gray-300 mb-3">
                        <button type="button" id="uploadTabBtn" class="flex-1 px-4 py-2 text-sm font-medium rounded-l-lg bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-300">
                            <i class="fas fa-upload mr-1"></i> Upload File
                        </button>
                        <button type="button" id="urlTabBtn" class="flex-1 px-4 py-2 text-sm font-medium rounded-r-lg bg-indigo-50 text-indigo-600">
                            <i class="fas fa-link mr-1"></i> URL
                        </button>
                    </div>

                    <!-- Upload Tab Content -->
                    <div id="uploadTab" class="hidden space-y-2">
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
                            <button type="button" id="removeImageBtn" class="mt-2 text-sm text-red-600 hover:text-red-800 cursor-pointer">
                                <i class="fas fa-times mr-1"></i> Hapus Gambar
                            </button>
                        </div>
                    </div>

                    <!-- URL Tab Content -->
                    <div id="urlTab" class="space-y-2">
                        <input type="url" id="imageUrl" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="https://example.com/kata-halo.jpg">
                        <p class="text-xs text-gray-500">
                            <i class="fas fa-info-circle"></i> Masukkan URL lengkap gambar bahasa isyarat
                        </p>
                        <div id="urlImagePreview" class="hidden mt-2">
                            <img id="urlPreviewImg" src="" alt="Preview" class="w-full h-32 object-cover rounded-lg border-2 border-gray-300">
                        </div>
                    </div>
                </div>

                <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button type="button" id="cancelBtn" class="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 cursor-pointer">Batal</button>
                    <button type="submit" id="saveBtn" class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 cursor-pointer">Simpan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/admin/words.js') }}"></script>
@endpush