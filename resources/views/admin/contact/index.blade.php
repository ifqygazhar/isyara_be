@extends('layouts.admin')

@section('title', 'Contact Messages')

@section('content')
<div class="mb-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Contact Messages</h1>
</div>

<div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b border-gray-200">
        <input type="text" id="searchInput" placeholder="Search messages..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
    </div>
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Subject</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created At</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody id="contactTableBody" class="bg-white divide-y divide-gray-200">
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

<!-- Detail Modal -->
<div id="contactModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Message Detail</h2>
            <button class="close text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
        </div>
        <div class="p-6">
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Name</label>
                    <p id="detailName" class="text-gray-900"></p>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <p id="detailEmail" class="text-gray-900"></p>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                    <p id="detailSubject" class="text-gray-900"></p>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Message</label>
                    <div id="detailMessage" class="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap"></div>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Received</label>
                    <p id="detailDate" class="text-gray-900"></p>
                </div>
            </div>
            <div class="flex flex-col-reverse sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
                <button type="button" id="closeBtn" class="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200">Close</button>
                <button type="button" id="deleteDetailBtn" class="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">Delete</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/admin/contact.js') }}"></script>
@endpush
