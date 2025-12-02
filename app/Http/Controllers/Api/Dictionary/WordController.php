<?php

namespace App\Http\Controllers\Api\Dictionary;

use App\Http\Controllers\Controller;
use App\Models\KamusKata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class WordController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $q = KamusKata::query();
        if ($search) {
            $q->where('kata', 'like', "%{$search}%");
        }
        $data = $q->get();

        if ($data->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'No data found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Words retrieved successfully', 'data' => $data], 200);
    }

    public function show($id)
    {
        $item = KamusKata::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Word not found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Word retrieved successfully', 'data' => $item], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required_without:image_url|file|image|max:2048',
            'image_url' => 'required_without:image|string|max:255|url',
            'kata' => ['required', 'string', 'max:50', Rule::unique('kamus_katas', 'kata')],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
            $imageUrl = Storage::url($path);
        } else {
            $imageUrl = $request->input('image_url');
        }

        $item = KamusKata::create([
            'image_url' => $imageUrl,
            'kata' => $request->input('kata'),
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
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|max:255|url',
            'kata' => ['required', 'string', 'max:50', Rule::unique('kamus_katas', 'kata')->ignore($item->id)],
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
            'image_url' => $imageUrl,
            'kata' => $request->input('kata'),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Word updated successfully', 'data' => $item], 200);
    }

    public function destroy($id)
    {
        $item = KamusKata::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Word not found'], 404);
        }

        // jika image berasal dari storage/public (Storage::url), hapus file fisiknya
        $imageUrl = $item->image_url;
        if ($imageUrl) {
            if (preg_match('#/storage/(.*)$#', $imageUrl, $m)) {
                $path = $m[1]; // path relatif pada disk "public"
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $item->delete();

        return response()->json(['status' => 'success', 'message' => 'Word deleted successfully'], 200);
    }
}
