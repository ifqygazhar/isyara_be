<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show()
    {
        $user = auth()->user();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile retrieved successfully',
            'data' => $user,
        ], 200);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Handle image upload or URL
        if ($request->hasFile('image')) {
            // Delete old image if exists and is from storage
            if ($user->image_url && preg_match('#/storage/(.*)$#', $user->image_url, $m)) {
                $oldPath = $m[1];
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('image')->store('profiles', 'public');
            $imageUrl = Storage::url($path);
        } elseif ($request->filled('image_url')) {
            $imageUrl = $request->input('image_url');
        } else {
            $imageUrl = $user->image_url;
        }

        // Update user data
        $updateData = [
            'image_url' => $imageUrl,
        ];

        if ($request->filled('name')) {
            $updateData['name'] = $request->input('name');
        }

        if ($request->filled('email')) {
            $updateData['email'] = $request->input('email');
        }

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->input('password'));
        }

        $user->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => $user->fresh(),
        ], 200);
    }

    public function destroy()
    {
        $user = auth()->user();

        // Delete profile image if exists
        if ($user->image_url && preg_match('#/storage/(.*)$#', $user->image_url, $m)) {
            $path = $m[1];
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        // Delete all user tokens
        $user->tokens()->delete();

        // Delete user
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Account deleted successfully',
        ], 200);
    }
}
