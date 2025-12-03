@extends('layouts.admin')

@section('title', 'Letter Management')

@section('content')
<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Dictionary - Letters</h1>
    <button class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition" id="addLetterBtn">
        <i class="fas fa-plus"></i>
        <span>Add Letter</span>
    </button>
</div>

<div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b">
        <input type="text" id="searchInput" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Search letters...">
    </div>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Letter</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Image</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Video</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody id="lettersTableBody" class="bg-white divide-y divide-gray-200">
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        <div class="flex items-center justify-center gap-2">
                            <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading...</span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal -->
<div id="letterModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b">
            <h2 id="modalTitle" class="text-xl font-semibold text-gray-900">Add Letter</h2>
            <button class="text-gray-400 hover:text-gray-600 close">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
        <div class="p-6">
            <form id="letterForm" class="space-y-4">
                <input type="hidden" id="letterId">
                
                <div>
                    <label for="huruf" class="block text-sm font-medium text-gray-700 mb-1">Letter *</label>
                    <input type="text" id="huruf" maxlength="1" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>

                <div>
                    <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                    <input type="url" id="imageUrl" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <p class="mt-1 text-xs text-gray-500">URL gambar huruf (sign language)</p>
                </div>

                <div>
                    <label for="videoUrl" class="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                    <input type="url" id="videoUrl" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <p class="mt-1 text-xs text-gray-500">URL video tutorial (optional)</p>
                </div>

                <div class="flex gap-3 pt-4 border-t">
                    <button type="button" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition" id="cancelBtn">Cancel</button>
                    <button type="submit" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition" id="saveBtn">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/admin/letters.js') }}"></script>
@endpush
