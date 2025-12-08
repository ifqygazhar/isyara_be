<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Utils\Utils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Filter by role if provided
        if ($request->has('role')) {
            $query->where('role', $request->input('role'));
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        if ($users->isEmpty()) {
            return response()->json([
                'status' => 'fail',
                'message' => 'No users found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Users retrieved successfully',
            'data' => $users,
        ], 200);
    }

    public function show($id)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'status' => 'fail',
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'User retrieved successfully',
            'data' => $user,
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,user',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
        ]);

        // Handle image
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('profiles', 'public');
            $imageUrl = Storage::url($path);
        } elseif ($request->filled('image_url')) {
            $imageUrl = $request->input('image_url');
        }

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role' => $request->input('role'),
            'image_url' => $imageUrl,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully',
            'data' => $user,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'status' => 'fail',
                'message' => 'User not found',
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($id)],
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:admin,user',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
        ]);

        $imageUrl = $user->image_url; // Default: keep existing image
        $shouldDeleteOldImage = false;

        // Determine new image URL and if old image should be deleted
        if ($request->hasFile('image')) {
            // New file uploaded
            $path = $request->file('image')->store('profiles', 'public');
            $imageUrl = Storage::url($path);
            $shouldDeleteOldImage = true;
        } elseif ($request->filled('image_url')) {
            // New URL provided
            $newImageUrl = $request->input('image_url');

            // Only delete old image if the URL is different
            if ($user->image_url !== $newImageUrl) {
                $imageUrl = $newImageUrl;
                $shouldDeleteOldImage = true;
            }
        }

        // Delete old image if it's from storage and we're replacing it
        if ($shouldDeleteOldImage && $user->image_url) {
            Utils::deleteImageFromStorage($user->image_url);
        }

        $updateData = [
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'role' => $request->input('role'),
            'image_url' => $imageUrl,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->input('password'));
        }

        $user->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully',
            'data' => $user->fresh(),
        ], 200);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'status' => 'fail',
                'message' => 'User not found',
            ], 404);
        }

        // Prevent deleting own account
        if ($user->id === auth()->id()) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Cannot delete your own account',
            ], 403);
        }

        // Delete profile image if from storage
        if ($user->image_url) {
            Utils::deleteImageFromStorage($user->image_url);
        }

        // Delete all user tokens
        $user->tokens()->delete();

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully',
        ], 200);
    }
}
