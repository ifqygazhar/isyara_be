<?php

namespace App\Http\Controllers\Api\Dictionary;

use App\Http\Controllers\Controller;
use App\Models\KamusHuruf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LetterController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $q = KamusHuruf::query();
        if ($search) {
            $q->where('huruf', 'like', "%{$search}%");
        }
        $data = $q->get();

        if ($data->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'No data found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Letters retrieved successfully', 'data' => $data], 200);
    }

    public function show($id)
    {
        $item = KamusHuruf::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Letter not found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Letter retrieved successfully', 'data' => $item], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required_without:image_url|file|image|max:2048',
            'image_url' => 'required_without:image|string|max:255|url',
            'huruf' => ['required', 'string', 'max:10', Rule::unique('kamus_hurufs', 'huruf')],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
            $imageUrl = Storage::url($path);
        } else {
            $imageUrl = $request->input('image_url');
        }

        $item = KamusHuruf::create([
            'image_url' => $imageUrl,
            'huruf' => $request->input('huruf'),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Letter added successfully', 'data' => $item], 201);
    }

    public function update(Request $request, $id)
    {
        $item = KamusHuruf::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Letter not found'], 404);
        }

        $request->validate([
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|max:255|url',
            'huruf' => ['required', 'string', 'max:10', Rule::unique('kamus_hurufs', 'huruf')->ignore($item->id)],
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
            'huruf' => $request->input('huruf'),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Letter updated successfully', 'data' => $item], 200);
    }

    public function destroy($id)
    {
        $item = KamusHuruf::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Letter not found'], 404);
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

        return response()->json(['status' => 'success', 'message' => 'Letter deleted successfully'], 200);
    }
}
