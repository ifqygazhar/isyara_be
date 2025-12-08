<?php

namespace App\Http\Controllers\Api\Quiz;

use App\Http\Controllers\Controller;
use App\Models\Level;
use App\Models\UserProgress;
use App\Utils\Utils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LevelController extends Controller
{
    public function index()
    {
        $data = Level::withCount('questions')->get();

        if ($data->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'Levels not found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Levels retrieved successfully', 'data' => $data], 200);
    }

    public function show($levelId)
    {
        $level = Level::withCount('questions')->find($levelId);

        if (! $level) {
            return response()->json(['status' => 'fail', 'message' => 'Level not found'], 404);
        }

        $userId = auth()->id();

        // Check if previous level is completed (if levelId > 1)
        if ($levelId > 1) {
            $previousLevelId = $levelId - 1;
            $progress = UserProgress::where('user_id', $userId)
                ->where('level_id', $previousLevelId)
                ->where('status', 'completed')
                ->first();

            if (! $progress) {
                return response()->json([
                    'status' => 'fail',
                    'message' => "You must complete level {$previousLevelId} before accessing this level.",
                ], 403);
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Level retrieved successfully', 'data' => $level], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'title' => 'required|string|max:255',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'description' => 'required|string',
        ]);

        // Handle image
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('levels', 'public');
            $imageUrl = Storage::url($path);
        } elseif ($request->filled('image_url')) {
            $imageUrl = $request->input('image_url');
        }

        if (! $imageUrl) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Image or image URL is required',
            ], 422);
        }

        $level = Level::create([
            'name' => $request->input('name'),
            'title' => $request->input('title'),
            'image_url' => $imageUrl,
            'description' => $request->input('description'),
        ]);

        // Load questions count
        $level->loadCount('questions');

        return response()->json(['status' => 'success', 'message' => 'Level created successfully', 'data' => $level], 201);
    }

    public function update(Request $request, $levelId)
    {
        $level = Level::find($levelId);

        if (! $level) {
            return response()->json(['status' => 'fail', 'message' => 'Level not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:100',
            'title' => 'required|string|max:255',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'description' => 'required|string',
        ]);

        $imageUrl = $level->image_url; // Default: keep existing image
        $shouldDeleteOldImage = false;

        // Determine new image URL and if old image should be deleted
        if ($request->hasFile('image')) {
            // New file uploaded
            $path = $request->file('image')->store('levels', 'public');
            $imageUrl = Storage::url($path);
            $shouldDeleteOldImage = true;
        } elseif ($request->filled('image_url')) {
            // New URL provided
            $newImageUrl = $request->input('image_url');

            // Only delete old image if the URL is different
            if ($level->image_url !== $newImageUrl) {
                $imageUrl = $newImageUrl;
                $shouldDeleteOldImage = true;
            }
        }

        // Delete old image if it's from storage and we're replacing it
        if ($shouldDeleteOldImage && $level->image_url) {
            Utils::deleteImageFromStorage($level->image_url);
        }

        $level->update([
            'name' => $request->input('name'),
            'title' => $request->input('title'),
            'image_url' => $imageUrl,
            'description' => $request->input('description'),
        ]);

        // Load questions count
        $level->loadCount('questions');

        return response()->json(['status' => 'success', 'message' => 'Level updated successfully', 'data' => $level], 200);
    }

    public function destroy($levelId)
    {
        $level = Level::find($levelId);

        if (! $level) {
            return response()->json(['status' => 'fail', 'message' => 'Level not found'], 404);
        }

        // Delete image from storage if exists
        if ($level->image_url) {
            Utils::deleteImageFromStorage($level->image_url);
        }

        $level->delete();

        return response()->json(['status' => 'success', 'message' => 'Level deleted successfully'], 200);
    }
}
