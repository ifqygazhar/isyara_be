<?php

namespace App\Http\Controllers\Api\Information;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Utils\Utils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CommunityController extends Controller
{
    public function index()
    {
        $data = Community::orderBy('created_at', 'desc')->get();

        if ($data->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'Tidak ada komunitas ditemukan'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Komunitas berhasil diambil', 'data' => $data], 200);
    }

    public function show($id)
    {
        $item = Community::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Komunitas tidak ditemukan'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Komunitas berhasil diambil', 'data' => $item], 200);
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
            $path = $request->file('image')->store('communities', 'public');
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

        $item = Community::create([
            'title' => $request->input('title'),
            'image_url' => $imageUrl,
            'description' => $request->input('description'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Komunitas berhasil ditambahkan',
            'data' => $item,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $item = Community::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Komunitas tidak ditemukan'], 404);
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
            $path = $request->file('image')->store('communities', 'public');
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
            'message' => 'Komunitas berhasil diperbarui',
            'data' => $item,
        ], 200);
    }

    public function destroy($id)
    {
        $item = Community::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Komunitas tidak ditemukan'], 404);
        }

        // Delete image from storage if exists
        if ($item->image_url) {
            Utils::deleteImageFromStorage($item->image_url);
        }

        $item->delete();

        return response()->json(['status' => 'success', 'message' => 'Komunitas berhasil dihapus'], 200);
    }
}
