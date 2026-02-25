<?php

namespace App\Http\Controllers\Api\Dictionary;

use App\Http\Controllers\Controller;
use App\Models\KamusKata;
use App\Utils\Utils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class WordController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $q = KamusKata::query();
        if ($search) {
            $q->where('kata', 'like', "%{$search}%");
        }

        if ($request->has('is_bisindo')) {
            $isBisindo = filter_var($request->query('is_bisindo'), FILTER_VALIDATE_BOOLEAN);
            $q->where('is_bisindo', $isBisindo);
        }
        $data = $q->orderBy('kata', 'asc')->get();

        if ($data->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'No data found'], 404);
        }

        $user = Auth::guard('sanctum')->user();
        $knownIds = [];
        if ($user) {
            $knownIds = $user->kamusKatas()->wherePivot('is_knowing', true)->pluck('kamus_katas.id')->toArray();
        }

        $data->transform(function ($item) use ($knownIds) {
            $item->is_knowing = in_array($item->id, $knownIds);
            return $item;
        });

        return response()->json(['status' => 'success', 'message' => 'Words retrieved successfully', 'data' => $data], 200);
    }

    public function show($id)
    {
        $item = KamusKata::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Word not found'], 404);
        }

        $user = Auth::guard('sanctum')->user();
        $item->is_knowing = false;
        if ($user) {
            $item->is_knowing = $user->kamusKatas()->where('kamus_kata_id', $item->id)->wherePivot('is_knowing', true)->exists();
        }

        return response()->json(['status' => 'success', 'message' => 'Word retrieved successfully', 'data' => $item], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kata' => ['required', 'string', 'max:50', Rule::unique('kamus_katas', 'kata')],
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'is_bisindo' => 'nullable|boolean',
        ]);

        // Handle image
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('words', 'public');
            $imageUrl = Storage::url($path);
        } elseif ($request->filled('image_url')) {
            $imageUrl = $request->input('image_url');
        }

        if (! $imageUrl) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Gambar atau URL gambar wajib diisi',
            ], 422);
        }

        $item = KamusKata::create([
            'image_url' => $imageUrl,
            'kata' => $request->input('kata'),
            'is_bisindo' => $request->input('is_bisindo', false),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Word added successfully', 'data' => $item], 201);
    }

    public function update(Request $request, $id)
    {
        $item = KamusKata::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Word not found'], 404);
        }

        $request->validate([
            'kata' => ['required', 'string', 'max:50', Rule::unique('kamus_katas', 'kata')->ignore($item->id)],
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'is_bisindo' => 'nullable|boolean',
        ]);

        $imageUrl = $item->image_url; // Default: keep existing image
        $shouldDeleteOldImage = false;

        // Determine new image URL and if old image should be deleted
        if ($request->hasFile('image')) {
            // New file uploaded
            $path = $request->file('image')->store('words', 'public');
            $imageUrl = Storage::url($path);
            $shouldDeleteOldImage = true;
        } elseif ($request->filled('image_url')) {
            // New URL provided
            $newImageUrl = $request->input('image_url');

            // Only delete old image if the URL is different
            if ($item->image_url !== $newImageUrl) {
                $imageUrl = $newImageUrl;
                $shouldDeleteOldImage = true;
            }
        }

        // Delete old image if it's from storage and we're replacing it
        if ($shouldDeleteOldImage && $item->image_url) {
            Utils::deleteImageFromStorage($item->image_url);
        }

        $item->update([
            'image_url' => $imageUrl,
            'kata' => $request->input('kata'),
            'is_bisindo' => $request->input('is_bisindo', $item->is_bisindo),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Word updated successfully', 'data' => $item], 200);
    }

    public function destroy($id)
    {
        $item = KamusKata::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Word not found'], 404);
        }

        // Delete image from storage if exists
        if ($item->image_url) {
            Utils::deleteImageFromStorage($item->image_url);
        }

        $item->delete();

        return response()->json(['status' => 'success', 'message' => 'Word deleted successfully'], 200);
    }

    public function toggleLearningStatus(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['status' => 'fail', 'message' => 'Unauthorized'], 401);
        }

        $item = KamusKata::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Word not found'], 404);
        }

        $request->validate([
            'is_knowing' => 'required|boolean'
        ]);

        $isKnowing = $request->input('is_knowing');

        // Update or insert pivot
        $user->kamusKatas()->syncWithoutDetaching([
            $item->id => ['is_knowing' => $isKnowing]
        ]);

        return response()->json([
            'status' => 'success', 
            'message' => 'Learning status updated successfully', 
            'data' => [
                'kamus_kata_id' => $item->id,
                'is_knowing' => $isKnowing
            ]
        ], 200);
    }
}
