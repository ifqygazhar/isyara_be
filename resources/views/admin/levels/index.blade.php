@extends('layouts.admin')

@section('title', 'Manajemen Level')

@section('content')
<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Level Kuis</h1>
        <p class="text-sm text-gray-600 mt-1">Kelola level dan pertanyaan kuis bahasa isyarat</p>
    </div>
    <button id="addLevelBtn" class="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Level Baru
    </button>
</div>

<!-- Info Card -->
<div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
    <div class="flex">
        <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        </div>
        <div class="ml-3">
            <p class="text-sm text-blue-700">
                <strong>Cara Kerja:</strong> 
                <span class="block mt-1">1. Klik <strong>"Tambah Level Baru"</strong> untuk membuat level kuis</span>
                <span class="block">2. Setelah level dibuat, klik tombol <strong class="text-indigo-600">"Kelola Pertanyaan"</strong> untuk menambah soal ke level tersebut</span>
            </p>
        </div>
    </div>
</div>

<div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b border-gray-200">
        <input type="text" id="searchInput" placeholder="Cari level..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
    </div>
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Gambar</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Jumlah Soal</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Dibuat</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
            </thead>
            <tbody id="levelsTableBody" class="bg-white divide-y divide-gray-200">
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-500">
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

<!-- Level Modal -->
<div id="levelModal" class="hidden fixed inset-0  bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
                <h2 id="modalTitle" class="text-xl font-semibold text-gray-900">Tambah Level</h2>
                <p class="text-sm text-gray-500 mt-1">Buat level kuis baru</p>
            </div>
            <button class="close text-gray-400 hover:text-gray-600 text-2xl font-light cursor-pointer">&times;</button>
        </div>
        <div class="p-6">
            <form id="levelForm">
                <input type="hidden" id="levelId">
                
                <div class="mb-4">
                    <label for="levelNumber" class="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Level *
                        <span class="text-xs text-gray-500 font-normal">(1, 2, 3, ...)</span>
                    </label>
                    <input type="number" id="levelNumber" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Contoh: 1">
                </div>

                <div class="mb-4">
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                        Judul Level *
                    </label>
                    <input type="text" id="title" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Contoh: Huruf Dasar A-E">
                    <p class="mt-1 text-xs text-gray-500">Berikan nama yang mendeskripsikan materi level ini</p>
                </div>

                <!-- Image Upload Options -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Gambar Level *</label>
                    
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
                            <img id="previewImg" src="" alt="Preview" class="w-full h-48 object-cover rounded-lg border-2 border-gray-300">
                            <button type="button" id="removeImageBtn" class="mt-2 text-sm text-red-600 hover:text-red-800 cursor-pointer">
                                <i class="fas fa-times mr-1"></i> Hapus Gambar
                            </button>
                        </div>
                    </div>

                    <!-- URL Tab Content -->
                    <div id="urlTab" class="space-y-2">
                        <input type="url" id="imageUrl" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="https://example.com/level.jpg">
                        <p class="text-xs text-gray-500">
                            <i class="fas fa-info-circle"></i> Masukkan URL lengkap gambar level
                        </p>
                        <div id="urlImagePreview" class="hidden mt-2">
                            <img id="urlPreviewImg" src="" alt="Preview" class="w-full h-48 object-cover rounded-lg border-2 border-gray-300">
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi *
                    </label>
                    <textarea id="description" rows="3" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Jelaskan materi yang akan dipelajari di level ini..."></textarea>
                    <p class="mt-1 text-xs text-gray-500">Deskripsi singkat tentang level ini</p>
                </div>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-yellow-700">
                                <strong>Catatan:</strong> Setelah level dibuat, Anda bisa menambahkan pertanyaan dengan klik tombol "Kelola Pertanyaan"
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button type="button" id="cancelBtn" class="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 cursor-pointer">Batal</button>
                    <button type="submit" id="saveBtn" class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 cursor-pointer">Simpan Level</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Questions Modal -->
<div id="questionsModal" class="hidden fixed inset-0  bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div>
                <h2 class="text-xl font-semibold text-white">Kelola Pertanyaan</h2>
                <p class="text-sm text-indigo-100 mt-1">Level: <span id="levelTitle" class="font-semibold"></span></p>
            </div>
            <button class="close-questions text-white hover:text-gray-200 text-2xl font-light cursor-pointer">&times;</button>
        </div>
        <div class="p-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div class="text-sm text-gray-600">
                    <i class="fas fa-info-circle text-blue-500"></i>
                    Tambahkan soal-soal kuis untuk level ini
                </div>
                <button id="addQuestionBtn" class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Tambah Pertanyaan
                </button>
            </div>
            <div id="questionsContainer" class="space-y-4">
                <div class="flex items-center justify-center py-8 text-gray-500">
                    <svg class="animate-spin h-5 w-5 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memuat pertanyaan...
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Question Form Modal -->
<div id="questionModal" class="hidden fixed inset-0  bg-opacity-50 z-[60] flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
                <h2 id="questionModalTitle" class="text-xl font-semibold text-gray-900">Tambah Pertanyaan</h2>
                <p class="text-sm text-gray-500 mt-1">Buat soal kuis baru</p>
            </div>
            <button class="close-question text-gray-400 hover:text-gray-600 text-2xl font-light cursor-pointer">&times;</button>
        </div>
        <div class="p-6">
            <form id="questionForm">
                <input type="hidden" id="questionId">
                <input type="hidden" id="questionLevelId">
                
                <div class="mb-4">
                    <label for="questionText" class="block text-sm font-medium text-gray-700 mb-2">
                        Pertanyaan *
                    </label>
                    <input type="text" id="questionText" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Contoh: Apa huruf ini dalam bahasa isyarat?">
                </div>

                <!-- Image Upload Options for Question -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Gambar Soal *</label>
                    
                    <!-- Tab Buttons -->
                    <div class="flex rounded-lg border border-gray-300 mb-3">
                        <button type="button" id="questionUploadTabBtn" class="flex-1 px-4 py-2 text-sm font-medium rounded-l-lg bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-300">
                            <i class="fas fa-upload mr-1"></i> Upload File
                        </button>
                        <button type="button" id="questionUrlTabBtn" class="flex-1 px-4 py-2 text-sm font-medium rounded-r-lg bg-indigo-50 text-indigo-600">
                            <i class="fas fa-link mr-1"></i> URL
                        </button>
                    </div>

                    <!-- Upload Tab Content -->
                    <div id="questionUploadTab" class="hidden space-y-2">
                        <div class="flex items-center justify-center w-full">
                            <label for="questionImageFile" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                    <p class="mb-2 text-sm text-gray-500">
                                        <span class="font-semibold">Klik untuk upload</span> atau drag & drop
                                    </p>
                                    <p class="text-xs text-gray-500">PNG, JPG, GIF (MAX. 2MB)</p>
                                </div>
                                <input id="questionImageFile" type="file" class="hidden" accept="image/*">
                            </label>
                        </div>
                        <div id="questionImagePreview" class="hidden">
                            <img id="questionPreviewImg" src="" alt="Preview" class="w-full h-48 object-cover rounded-lg border-2 border-gray-300">
                            <button type="button" id="removeQuestionImageBtn" class="mt-2 text-sm text-red-600 hover:text-red-800 cursor-pointer">
                                <i class="fas fa-times mr-1"></i> Hapus Gambar
                            </button>
                        </div>
                    </div>

                    <!-- URL Tab Content -->
                    <div id="questionUrlTab" class="space-y-2">
                        <input type="url" id="questionImageUrl" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="https://example.com/soal.jpg">
                        <p class="text-xs text-gray-500">
                            <i class="fas fa-info-circle"></i> Masukkan URL lengkap gambar soal
                        </p>
                        <div id="questionUrlImagePreview" class="hidden mt-2">
                            <img id="questionUrlPreviewImg" src="" alt="Preview" class="w-full h-48 object-cover rounded-lg border-2 border-gray-300">
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <label for="correctAnswer" class="block text-sm font-medium text-gray-700 mb-2">
                        Jawaban Benar *
                    </label>
                    <input type="text" id="correctAnswer" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Contoh: A">
                    <p class="mt-1 text-xs text-gray-500">
                        <i class="fas fa-check-circle text-green-500"></i>
                        Jawaban yang benar untuk soal ini
                    </p>
                </div>

                <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button type="button" id="cancelQuestionBtn" class="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 cursor-pointer">Batal</button>
                    <button type="submit" id="saveQuestionBtn" class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 cursor-pointer">Simpan Pertanyaan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/admin/levels.js') }}"></script>
@endpush