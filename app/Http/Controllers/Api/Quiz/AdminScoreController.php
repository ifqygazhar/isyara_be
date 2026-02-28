<?php

namespace App\Http\Controllers\Api\Quiz;

use App\Http\Controllers\Controller;
use App\Models\UserProgress;
use Illuminate\Http\Request;

class AdminScoreController extends Controller
{
    /**
     * Get all quiz scores of all users for Admin.
     */
    public function index()
    {
        $scores = UserProgress::with(['user:id,name,email', 'level:id,name,title'])
            ->whereNotNull('score')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'All user scores retrieved successfully',
            'data' => $scores
        ], 200);
    }

    /**
     * Reset/Delete a user's progress and score.
     */
    public function destroy($userId, $levelId)
    {
        $progress = UserProgress::where('user_id', $userId)
            ->where('level_id', $levelId)
            ->first();

        if (!$progress) {
            return response()->json(['status' => 'fail', 'message' => 'Score record not found'], 404);
        }

        // Delete progress
        $progress->delete();

        // Optionally delete the user answers for this level
        \App\Models\UserAnswer::where('user_id', $userId)
            ->where('level_id', $levelId)
            ->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Score and progress reset successfully'
        ], 200);
    }
}
