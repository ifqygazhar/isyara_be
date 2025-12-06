<?php

namespace App\Http\Controllers\Api\Quiz;

use App\Http\Controllers\Controller;
use App\Models\Level;
use App\Models\UserProgress;
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
            'image' => 'required_without:image_url|file|image|max:2048',
            'image_url' => 'required_without:image|string|url',
            'description' => 'required|string',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
            $imageUrl = Storage::url($path);
        } else {
            $imageUrl = $request->input('image_url');
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

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
            $imageUrl = Storage::url($path);
        } elseif ($request->filled('image_url')) {
            $imageUrl = $request->input('image_url');
        } else {
            $imageUrl = $level->image_url;
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

        $imageUrl = $level->image_url;
        if ($imageUrl && preg_match('#/storage/(.*)$#', $imageUrl, $m)) {
            $path = $m[1];
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $level->delete();

        return response()->json(['status' => 'success', 'message' => 'Level deleted successfully'], 200);
    }
}
