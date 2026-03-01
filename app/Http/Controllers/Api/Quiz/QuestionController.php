<?php

namespace App\Http\Controllers\Api\Quiz;

use App\Http\Controllers\Controller;
use App\Models\Level;
use App\Models\Question;
use App\Models\UserAnswer;
use App\Models\UserProgress;
use App\Utils\Utils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    public function index($levelId)
    {
        $questions = Question::where('level_id', $levelId)->orderBy('id')->get();

        if ($questions->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'Questions not found'], 404);
        }

        $totalQuestions = $questions->count();
        $questions = $questions->map(function ($question, $index) use ($totalQuestions) {
            return [
                'id' => $question->id,
                'level_id' => $question->level_id,
                'name' => 'Question '.($index + 1).' of '.$totalQuestions,
                'question' => $question->question,
                'correct_option' => $question->correct_option,
                'options' => $question->options,
                'image_url' => $question->image_url,
            ];
        });

        return response()->json(['status' => 'success', 'message' => 'Questions retrieved successfully', 'data' => $questions], 200);
    }

    public function show($levelId, $questionId)
    {
        $question = Question::where('level_id', $levelId)->where('id', $questionId)->first();

        if (! $question) {
            return response()->json(['status' => 'fail', 'message' => 'Question not found'], 404);
        }

        $allQuestions = Question::where('level_id', $levelId)->orderBy('id')->pluck('id');
        $totalQuestions = $allQuestions->count();
        $questionIndex = $allQuestions->search($questionId) + 1;

        $data = [
            'id' => $question->id,
            'level_id' => $question->level_id,
            'name' => "Question {$questionIndex} of {$totalQuestions}",
            'question' => $question->question,
            'correct_option' => $question->correct_option,
            'options' => $question->options,
            'image_url' => $question->image_url,
        ];

        return response()->json(['status' => 'success', 'message' => 'Question retrieved successfully', 'data' => $data], 200);
    }

    public function store(Request $request, $levelId)
    {
        $request->validate([
            'question' => 'required|string',
            'correct_option' => 'required|string|max:255',
            'options' => 'required|array',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
        ]);

        // Handle image
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('questions', 'public');
            $imageUrl = Storage::url($path);
        } elseif ($request->filled('image_url')) {
            $imageUrl = $request->input('image_url');
        }

        if (! $imageUrl) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Image or image URL is required',
            ], 422);
        }

        // Get next question ID for this level
        $maxId = Question::where('level_id', $levelId)->max('id') ?? 0;
        $nextId = $maxId + 1;

        $question = new Question;
        $question->id = $nextId;
        $question->level_id = $levelId;
        $question->question = $request->input('question');
        $question->correct_option = $request->input('correct_option');
        $question->options = $request->input('options');
        $question->image_url = $imageUrl;
        $question->save();

        $totalQuestions = Question::where('level_id', $levelId)->count();

        $data = [
            'id' => $question->id,
            'level_id' => $question->level_id,
            'name' => "Question {$nextId} of {$totalQuestions}",
            'question' => $question->question,
            'correct_option' => $question->correct_option,
            'options' => $question->options,
            'image_url' => $question->image_url,
        ];

        return response()->json(['status' => 'success', 'message' => 'Question created successfully', 'data' => $data], 201);
    }

    public function update(Request $request, $levelId, $questionId)
    {
        $question = Question::where('level_id', $levelId)->where('id', $questionId)->first();

        if (! $question) {
            return response()->json(['status' => 'fail', 'message' => 'Question not found'], 404);
        }

        $request->validate([
            'question' => 'required|string',
            'correct_option' => 'required|string|max:255',
            'options' => 'required|array',
            'image' => 'nullable|file|image|max:2048',
            'image_url' => 'nullable|string|url',
        ]);

        $imageUrl = $question->image_url; // Default: keep existing image
        $shouldDeleteOldImage = false;

        // Determine new image URL and if old image should be deleted
        if ($request->hasFile('image')) {
            // New file uploaded
            $path = $request->file('image')->store('questions', 'public');
            $imageUrl = Storage::url($path);
            $shouldDeleteOldImage = true;
        } elseif ($request->filled('image_url')) {
            // New URL provided
            $newImageUrl = $request->input('image_url');

            // Only delete old image if the URL is different
            if ($question->image_url !== $newImageUrl) {
                $imageUrl = $newImageUrl;
                $shouldDeleteOldImage = true;
            }
        }

        // Delete old image if it's from storage and we're replacing it
        if ($shouldDeleteOldImage && $question->image_url) {
            Utils::deleteImageFromStorage($question->image_url);
        }

        $question->update([
            'question' => $request->input('question'),
            'correct_option' => $request->input('correct_option'),
            'options' => $request->input('options'),
            'image_url' => $imageUrl,
        ]);

        $allQuestions = Question::where('level_id', $levelId)->orderBy('id')->pluck('id');
        $totalQuestions = $allQuestions->count();
        $questionIndex = $allQuestions->search($questionId) + 1;

        $data = [
            'id' => $question->id,
            'level_id' => $question->level_id,
            'name' => "Question {$questionIndex} of {$totalQuestions}",
            'question' => $question->question,
            'correct_option' => $question->correct_option,
            'options' => $question->options,
            'image_url' => $question->image_url,
        ];

        return response()->json(['status' => 'success', 'message' => 'Question updated successfully', 'data' => $data], 200);
    }

    public function destroy($levelId, $questionId)
    {
        $question = Question::where('level_id', $levelId)->where('id', $questionId)->first();

        if (! $question) {
            return response()->json(['status' => 'fail', 'message' => 'Question not found'], 404);
        }

        // Delete image from storage if exists
        if ($question->image_url) {
            Utils::deleteImageFromStorage($question->image_url);
        }

        $question->delete();

        return response()->json(['status' => 'success', 'message' => 'Question deleted successfully'], 200);
    }

    public function checkAnswer(Request $request, $levelId, $questionId)
    {
        $request->validate([
            'selected_option' => 'required|string',
        ]);

        $userId = auth()->id();
        $question = Question::where('level_id', $levelId)->where('id', $questionId)->first();

        if (! $question) {
            return response()->json(['status' => 'fail', 'message' => 'Question not found'], 404);
        }

        $isCorrect = $question->correct_option === $request->input('selected_option');

        UserAnswer::updateOrInsert(
            ['user_id' => $userId, 'question_id' => $questionId, 'level_id' => $levelId],
            ['is_correct' => $isCorrect]
        );

        // Update score in UserProgress immediately
        $questions = Question::where('level_id', $levelId)->pluck('id');
        $userAnswers = UserAnswer::where('user_id', $userId)
            ->where('level_id', $levelId)
            ->whereIn('question_id', $questions)->get();

        $totalQuestions = $questions->count();
        $correctAnswers = $userAnswers->where('is_correct', true)->count();
        $score = $totalQuestions > 0 ? round(($correctAnswers / $totalQuestions) * 100) : 0;
        $allCorrect = $totalQuestions > 0 && $correctAnswers === $totalQuestions;
        $status = $allCorrect ? 'completed' : 'in_progress';

        UserProgress::updateOrCreate(
            ['user_id' => $userId, 'level_id' => $levelId],
            [
                'status' => $status,
                'score' => $score,
                'correct_answers' => $correctAnswers,
                'total_questions' => $totalQuestions
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => $isCorrect ? 'Correct answer' : 'Wrong answer',
            'isCorrect' => $isCorrect,
            'score' => $score // Optionally return the updated score
        ], 200);
    }

    public function checkCompletion($levelId)
    {
        $userId = auth()->id();

        $questions = Question::where('level_id', $levelId)->pluck('id');

        if ($questions->isEmpty()) {
            return response()->json(['status' => 'fail', 'message' => 'No questions found for this level'], 404);
        }

        $userAnswers = UserAnswer::where('user_id', $userId)
            ->where('level_id', $levelId)
            ->whereIn('question_id', $questions)
            ->get();

        $totalQuestions = $questions->count();
        $correctAnswers = $userAnswers->where('is_correct', true)->count();
        $score = $totalQuestions > 0 ? round(($correctAnswers / $totalQuestions) * 100) : 0;

        $allCorrect = $totalQuestions > 0 && $correctAnswers === $totalQuestions;

        $status = $allCorrect ? 'completed' : 'in_progress';

        UserProgress::updateOrCreate(
            ['user_id' => $userId, 'level_id' => $levelId],
            [
                'status' => $status,
                'score' => $score,
                'correct_answers' => $correctAnswers,
                'total_questions' => $totalQuestions
            ]
        );

        $level = Level::find($levelId);

        if (! $level) {
            return response()->json(['status' => 'fail', 'message' => 'Level not found'], 404);
        }

        if ($allCorrect) {
            $message = "Congrats! Kamu telah menyelesaikan quiz {$level->name}. Silahkan lanjutkan perjalanan mu!";
            $imageUrl = 'https://storage.googleapis.com/isyara-storage/Quiz/Smile.png';
        } else {
            $message = 'Failed. Oh tidak, kamu gagal menjawab semua pertanyaan dengan benar.';
            $imageUrl = 'https://storage.googleapis.com/isyara-storage/Quiz/Sad.png';
        }

        return response()->json([
            'status' => 'success',
            'message' => $message,
            'imageUrl' => $imageUrl,
        ], 200);
    }
}
