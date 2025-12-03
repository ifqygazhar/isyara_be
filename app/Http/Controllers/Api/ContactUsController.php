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
            'message' => 'Your message has been sent successfully',
            'data' => $contact,
        ], 201);
    }

    public function index()
    {
        $contacts = ContactUs::orderBy('created_at', 'desc')->get();

        if ($contacts->isEmpty()) {
            return response()->json([
                'status' => 'fail',
                'message' => 'No contact messages found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Contact messages retrieved successfully',
            'data' => $contacts,
        ], 200);
    }

    public function show($id)
    {
        $contact = ContactUs::find($id);

        if (! $contact) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Contact message not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Contact message retrieved successfully',
            'data' => $contact,
        ], 200);
    }

    public function destroy($id)
    {
        $contact = ContactUs::find($id);

        if (! $contact) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Contact message not found',
            ], 404);
        }

        $contact->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Contact message deleted successfully',
        ], 200);
    }
}
