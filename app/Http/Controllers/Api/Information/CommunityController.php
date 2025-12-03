<?php

namespace App\Http\Controllers\Api\Information;

use App\Http\Controllers\Controller;
use App\Models\Community;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CommunityController extends Controller
{
    public function index()
    {
        $data = Community::all();

        if ($data->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'No communities found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Communities retrieved successfully', 'data' => $data], 200);
    }

    public function show($id)
    {
        $item = Community::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Community not found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Community retrieved successfully', 'data' => $item], 200);
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

        $item = Community::create([
            'title' => $request->input('title'),
            'image_url' => $imageUrl,
            'description' => $request->input('description'),
        ]);

        return response()->json(['status' => 'success', 'message' => 'New community added successfully', 'data' => $item], 201);
    }

    public function update(Request $request, $id)
    {
        $item = Community::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Community not found'], 404);
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

        return response()->json(['status' => 'success', 'message' => 'Community updated successfully', 'data' => $item], 200);
    }

    public function destroy($id)
    {
        $item = Community::find($id);

        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Community not found'], 404);
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

        return response()->json(['status' => 'success', 'message' => 'Community deleted successfully'], 200);
    }
}
