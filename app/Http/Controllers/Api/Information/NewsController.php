<?php

namespace App\Http\Controllers\Api\Information;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    public function index()
    {
        $data = News::all();

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
            'title' => 'required|string|min:5',
            'image' => 'required_without:image_url|file|image|max:2048',
            'image_url' => 'required_without:image|string|url',
            'description' => 'required|string|min:10',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
            $imageUrl = Storage::url($path);
        } else {
            $imageUrl = $request->input('image_url');
        }

        $item = News::create([
            'title' => $request->input('title'),
            'image_url' => $imageUrl,
            'description' => $request->input('description'),
        ]);

        return response()->json(['status' => 'success', 'message' => 'New news added successfully', 'data' => $item], 201);
    }

    public function update(Request $request, $id)
    {
        $item = News::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'News not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|min:5',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'description' => 'required|string|min:10',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
            $imageUrl = Storage::url($path);
        } elseif ($request->filled('image_url')) {
            $imageUrl = $request->input('image_url');
        } else {
            $imageUrl = $item->image_url;
        }

        $item->update([
            'title' => $request->input('title'),
            'image_url' => $imageUrl,
            'description' => $request->input('description'),
        ]);

        return response()->json(['status' => 'success', 'message' => 'News updated successfully', 'data' => $item], 200);
    }

    public function destroy($id)
    {
        $item = News::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'News not found'], 404);
        }

        $imageUrl = $item->image_url;
        if ($imageUrl) {
            if (preg_match('#/storage/(.*)$#', $imageUrl, $m)) {
                $path = $m[1];
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $item->delete();

        return response()->json(['status' => 'success', 'message' => 'News deleted successfully'], 200);
    }
}
