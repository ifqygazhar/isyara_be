<?php

namespace App\Http\Controllers\Api\Information;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Utils\Utils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    public function index()
    {
        $data = News::orderBy('created_at', 'desc')->get();

        if ($data->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'No news found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'News retrieved successfully', 'data' => $data], 200);
    }

    public function show($id)
    {
        $item = News::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'News not found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'News retrieved successfully', 'data' => $item], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|min:5|max:255',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'description' => 'required|string|min:10',
        ]);

        // Handle image
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news', 'public');
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

        $item = News::create([
            'title' => $request->input('title'),
            'image_url' => $imageUrl,
            'description' => $request->input('description'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'News added successfully',
            'data' => $item,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $item = News::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'News not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|min:5|max:255',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'description' => 'required|string|min:10',
        ]);

        $imageUrl = $item->image_url; // Default: keep existing image
        $shouldDeleteOldImage = false;

        // Determine new image URL and if old image should be deleted
        if ($request->hasFile('image')) {
            // New file uploaded
            $path = $request->file('image')->store('news', 'public');
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
            'title' => $request->input('title'),
            'image_url' => $imageUrl,
            'description' => $request->input('description'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'News updated successfully',
            'data' => $item,
        ], 200);
    }

    public function destroy($id)
    {
        $item = News::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'News not found'], 404);
        }

        // Delete image from storage if exists
        if ($item->image_url) {
            Utils::deleteImageFromStorage($item->image_url);
        }

        $item->delete();

        return response()->json(['status' => 'success', 'message' => 'News deleted successfully'], 200);
    }
}
