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
        $data = $q->orderBy('huruf', 'asc')->get();

        if ($data->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'Tidak ada data ditemukan'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Huruf berhasil diambil', 'data' => $data], 200);
    }

    public function show($id)
    {
        $item = KamusHuruf::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Huruf tidak ditemukan'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Huruf berhasil diambil', 'data' => $item], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'huruf' => ['required', 'string', 'max:10', Rule::unique('kamus_hurufs', 'huruf')],
            'image_url' => 'required|string|max:255|url',
        ]);

        $item = KamusHuruf::create([
            'image_url' => $validated['image_url'],
            'huruf' => strtoupper($validated['huruf']),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Huruf berhasil ditambahkan',
            'data' => $item,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $item = KamusHuruf::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Huruf tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'huruf' => ['required', 'string', 'max:10', Rule::unique('kamus_hurufs', 'huruf')->ignore($item->id)],
            'image_url' => 'required|string|max:255|url',
        ]);

        $item->update([
            'image_url' => $validated['image_url'],
            'huruf' => strtoupper($validated['huruf']),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Huruf berhasil diperbarui',
            'data' => $item,
        ], 200);
    }

    public function destroy($id)
    {
        $item = KamusHuruf::find($id);
        if (! $item) {
            return response()->json(['status' => 'fail', 'message' => 'Huruf tidak ditemukan'], 404);
        }

        $imageUrl = $item->image_url;
        if ($imageUrl && preg_match('#/storage/(.*)$#', $imageUrl, $m)) {
            $path = $m[1];
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $item->delete();

        return response()->json(['status' => 'success', 'message' => 'Huruf berhasil dihapus'], 200);
    }
}
