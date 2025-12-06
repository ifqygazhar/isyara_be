<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactUs;
use Illuminate\Http\Request;

class ContactUsController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'message' => 'required|string',
        ]);

        $contact = ContactUs::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'message' => $request->input('message'),
            'created_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan Anda berhasil dikirim',
            'data' => $contact,
        ], 201);
    }

    public function index()
    {
        $contacts = ContactUs::orderBy('created_at', 'desc')->get();

        if ($contacts->isEmpty()) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Tidak ada pesan kontak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan kontak berhasil diambil',
            'data' => $contacts,
        ], 200);
    }

    public function show($id)
    {
        $contact = ContactUs::find($id);

        if (! $contact) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Pesan kontak tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan kontak berhasil diambil',
            'data' => $contact,
        ], 200);
    }

    public function destroy($id)
    {
        $contact = ContactUs::find($id);

        if (! $contact) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Pesan kontak tidak ditemukan',
            ], 404);
        }

        $contact->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan kontak berhasil dihapus',
        ], 200);
    }
}
