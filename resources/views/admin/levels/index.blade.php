@extends('layouts.admin')

@section('title', 'Level Management')

@section('content')
<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Quiz Level Management</h1>
    <button id="addLevelBtn" class="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Add Level
    </button>
</div>

<div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b border-gray-200">
        <input type="text" id="searchInput" placeholder="Search levels..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
    </div>
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level Number</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Questions</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created At</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody id="levelsTableBody" class="bg-white divide-y divide-gray-200">
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        <div class="flex items-center justify-center">
                            <svg class="animate-spin h-5 w-5 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Level Modal -->
<div id="levelModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 id="modalTitle" class="text-xl font-semibold text-gray-900">Add Level</h2>
            <button class="close text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
        </div>
        <div class="p-6">
            <form id="levelForm">
                <input type="hidden" id="levelId">
                
                <div class="mb-4">
                    <label for="levelNumber" class="block text-sm font-medium text-gray-700 mb-2">Level Number *</label>
                    <input type="number" id="levelNumber" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>

                <div class="mb-6">
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input type="text" id="title" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <p class="mt-1 text-xs text-gray-500">e.g., "Basic Letters", "Common Words", etc.</p>
                </div>

                <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button type="button" id="cancelBtn" class="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200">Cancel</button>
                    <button type="submit" id="saveBtn" class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Questions Modal -->
<div id="questionsModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 id="questionsModalTitle" class="text-xl font-semibold text-gray-900">Manage Questions</h2>
            <button class="close-questions text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
        </div>
        <div class="p-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 class="text-lg font-medium text-gray-900">Questions for <span id="levelTitle" class="text-indigo-600"></span></h3>
                <button id="addQuestionBtn" class="w-full sm:w-auto px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition duration-200">Add Question</button>
            </div>
            <div id="questionsContainer" class="space-y-4">
                <div class="flex items-center justify-center py-8 text-gray-500">
                    <svg class="animate-spin h-5 w-5 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading questions...
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Question Form Modal -->
<div id="questionModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 id="questionModalTitle" class="text-xl font-semibold text-gray-900">Add Question</h2>
            <button class="close-question text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
        </div>
        <div class="p-6">
            <form id="questionForm">
                <input type="hidden" id="questionId">
                <input type="hidden" id="questionLevelId">
                
                <div class="mb-4">
                    <label for="questionText" class="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                    <input type="text" id="questionText" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>

                <div class="mb-4">
                    <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                    <input type="url" id="imageUrl" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <p class="mt-1 text-xs text-gray-500">URL gambar soal (sign language)</p>
                </div>

                <div class="mb-6">
                    <label for="correctAnswer" class="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                    <input type="text" id="correctAnswer" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>

                <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button type="button" id="cancelQuestionBtn" class="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200">Cancel</button>
                    <button type="submit" id="saveQuestionBtn" class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/admin/levels.js') }}"></script>
@endpush
