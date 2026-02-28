<?php

namespace App\Http\Controllers\Api\Quiz;

use App\Http\Controllers\Controller;
use App\Models\UserProgress;
use Illuminate\Http\Request;

class ScoreController extends Controller
{
    /**
     * Get all quiz scores for the authenticated user.
     */
    public function index()
    {
        $userId = auth()->id();

        $scores = UserProgress::with('level:id,name,title')
            ->where('user_id', $userId)
            ->whereNotNull('score')
            ->get();

        if ($scores->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'No scores found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Scores retrieved successfully',
            'data' => $scores
        ], 200);
    }

    /**
     * Get specific level score for the authenticated user.
     */
    public function show($levelId)
    {
        $userId = auth()->id();

        $score = UserProgress::with('level:id,name,title')
            ->where('user_id', $userId)
            ->where('level_id', $levelId)
            ->first();

        if (!$score || is_null($score->score)) {
            return response()->json(['status' => 'fail', 'message' => 'Score not found for this level'], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Score retrieved successfully',
            'data' => $score
        ], 200);
    }
}
