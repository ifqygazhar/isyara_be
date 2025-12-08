<?php

namespace App\Http\Controllers\Api\Information;

use App\Http\Controllers\Controller;
use App\Models\EventModel;
use App\Utils\Utils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index()
    {
        $data = EventModel::orderBy('date', 'desc')->get();

        if ($data->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'No events found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Events retrieved successfully', 'data' => $data], 200);
    }

    public function show($id)
    {
        $item = EventModel::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Event not found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Event retrieved successfully', 'data' => $item], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|min:5|max:255',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'description' => 'required|string|min:10',
            'date' => 'required|date',
            'location' => 'required|string|min:3|max:255',
        ]);

        // Handle image
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
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

        $item = EventModel::create([
            'title' => $request->input('title'),
            'image_url' => $imageUrl,
            'description' => $request->input('description'),
            'date' => $request->input('date'),
            'location' => $request->input('location'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Event added successfully',
            'data' => $item,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $item = EventModel::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Event not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|min:5|max:255',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'description' => 'required|string|min:10',
            'date' => 'required|date',
            'location' => 'required|string|min:3|max:255',
        ]);

        $imageUrl = $item->image_url; // Default: keep existing image
        $shouldDeleteOldImage = false;

        // Determine new image URL and if old image should be deleted
        if ($request->hasFile('image')) {
            // New file uploaded
            $path = $request->file('image')->store('events', 'public');
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
            'date' => $request->input('date'),
            'location' => $request->input('location'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Event updated successfully',
            'data' => $item,
        ], 200);
    }

    public function destroy($id)
    {
        $item = EventModel::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Event not found'], 404);
        }

        // Delete image from storage if exists
        if ($item->image_url) {
            Utils::deleteImageFromStorage($item->image_url);
        }

        $item->delete();

        return response()->json(['status' => 'success', 'message' => 'Event deleted successfully'], 200);
    }
}
