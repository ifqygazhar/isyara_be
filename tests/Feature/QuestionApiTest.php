<?php

namespace Tests\Feature;

use App\Models\Level;
use App\Models\Question;
use App\Models\User;
use App\Models\UserAnswer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuestionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function createLevel()
    {
        return Level::create([
            'name' => 'Level 1',
            'title' => 'Beginner',
            'image_url' => 'https://example.com/level.png',
            'description' => 'Test level',
        ]);
    }

    public function test_index_returns_all_questions_for_level()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $level = $this->createLevel();

        $q1 = new Question;
        $q1->id = 1;
        $q1->level_id = $level->id;
        $q1->question = 'What is 1+1?';
        $q1->correct_option = '2';
        $q1->options = ['1', '2', '3'];
        $q1->image_url = 'https://example.com/q1.png';
        $q1->save();

        $q2 = new Question;
        $q2->id = 2;
        $q2->level_id = $level->id;
        $q2->question = 'What is 2+2?';
        $q2->correct_option = '4';
        $q2->options = ['2', '4', '6'];
        $q2->image_url = 'https://example.com/q2.png';
        $q2->save();

        $response = $this->getJson("/api/quiz/levels/{$level->id}/questions");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Question 1 of 2')
            ->assertJsonPath('data.1.name', 'Question 2 of 2');
    }

    public function test_show_returns_single_question_with_correct_name()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $level = $this->createLevel();

        $q1 = new Question;
        $q1->id = 1;
        $q1->level_id = $level->id;
        $q1->question = 'Question 1';
        $q1->correct_option = 'A';
        $q1->options = ['A', 'B'];
        $q1->image_url = 'https://example.com/q1.png';
        $q1->save();

        $response = $this->getJson("/api/quiz/levels/{$level->id}/questions/1");

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Question 1 of 1')
            ->assertJsonPath('data.question', 'Question 1');
    }

    public function test_store_question_with_uploaded_image()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $level = $this->createLevel();
        $file = UploadedFile::fake()->image('question.jpg');

        $response = $this->postJson("/api/quiz/levels/{$level->id}/questions", [
            'question' => 'Test question?',
            'correct_option' => 'Answer A',
            'options' => ['Answer A', 'Answer B', 'Answer C'],
            'image' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.question', 'Test question?');

        $question = Question::first();
        $this->assertStringContainsString('/storage/', $question->image_url);

        $relative = Str::after($question->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);
    }

    public function test_update_question()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $level = $this->createLevel();

        $question = new Question;
        $question->id = 1;
        $question->level_id = $level->id;
        $question->question = 'Old question?';
        $question->correct_option = 'Old answer';
        $question->options = ['Old answer'];
        $question->image_url = 'https://old.com/q.png';
        $question->save();

        $response = $this->putJson("/api/quiz/levels/{$level->id}/questions/1", [
            'question' => 'Updated question?',
            'correct_option' => 'New answer',
            'options' => ['New answer', 'Other'],
            'image_url' => 'https://new.com/q.png',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.question', 'Updated question?');

        $question->refresh();
        $this->assertEquals('Updated question?', $question->question);
    }

    public function test_delete_question_removes_file()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $level = $this->createLevel();
        $file = UploadedFile::fake()->image('question.jpg');

        $this->postJson("/api/quiz/levels/{$level->id}/questions", [
            'question' => 'To delete?',
            'correct_option' => 'Answer',
            'options' => ['Answer'],
            'image' => $file,
        ]);

        $question = Question::first();
        $relative = Str::after($question->image_url, '/storage/');

        $response = $this->deleteJson("/api/quiz/levels/{$level->id}/questions/{$question->id}");

        $response->assertStatus(200);
        Storage::disk('public')->assertMissing($relative);
        $this->assertDatabaseMissing('questions', ['id' => $question->id, 'level_id' => $level->id]);
    }

    public function test_check_answer_correct()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $level = $this->createLevel();

        $question = new Question;
        $question->id = 1;
        $question->level_id = $level->id;
        $question->question = 'What is 2+2?';
        $question->correct_option = '4';
        $question->options = ['3', '4', '5'];
        $question->image_url = 'https://example.com/q.png';
        $question->save();

        $response = $this->postJson("/api/quiz/levels/{$level->id}/questions/1/answer", [
            'selected_option' => '4',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('isCorrect', true)
            ->assertJsonPath('message', 'Correct answer');

        $this->assertDatabaseHas('user_answers', [
            'user_id' => $user->id,
            'question_id' => 1,
            'level_id' => $level->id,
            'is_correct' => true,
        ]);
    }

    public function test_check_answer_wrong()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $level = $this->createLevel();

        $question = new Question;
        $question->id = 1;
        $question->level_id = $level->id;
        $question->question = 'What is 2+2?';
        $question->correct_option = '4';
        $question->options = ['3', '4', '5'];
        $question->image_url = 'https://example.com/q.png';
        $question->save();

        $response = $this->postJson("/api/quiz/levels/{$level->id}/questions/1/answer", [
            'selected_option' => '5',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('isCorrect', false)
            ->assertJsonPath('message', 'Wrong answer');

        $this->assertDatabaseHas('user_answers', [
            'user_id' => $user->id,
            'question_id' => 1,
            'is_correct' => false,
        ]);
    }

    public function test_check_completion_all_correct()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $level = $this->createLevel();

        $q1 = new Question;
        $q1->id = 1;
        $q1->level_id = $level->id;
        $q1->question = 'Q1';
        $q1->correct_option = 'A';
        $q1->options = ['A'];
        $q1->image_url = 'https://example.com/q1.png';
        $q1->save();

        $q2 = new Question;
        $q2->id = 2;
        $q2->level_id = $level->id;
        $q2->question = 'Q2';
        $q2->correct_option = 'B';
        $q2->options = ['B'];
        $q2->image_url = 'https://example.com/q2.png';
        $q2->save();

        UserAnswer::create([
            'user_id' => $user->id,
            'question_id' => 1,
            'level_id' => $level->id,
            'is_correct' => true,
        ]);

        UserAnswer::create([
            'user_id' => $user->id,
            'question_id' => 2,
            'level_id' => $level->id,
            'is_correct' => true,
        ]);

        $response = $this->getJson("/api/quiz/levels/{$level->id}/completion");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertSee('Congrats');

        $this->assertDatabaseHas('user_progress', [
            'user_id' => $user->id,
            'level_id' => $level->id,
            'status' => 'completed',
        ]);
    }

    public function test_check_completion_not_all_correct()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $level = $this->createLevel();

        $q1 = new Question;
        $q1->id = 1;
        $q1->level_id = $level->id;
        $q1->question = 'Q1';
        $q1->correct_option = 'A';
        $q1->options = ['A'];
        $q1->image_url = 'https://example.com/q1.png';
        $q1->save();

        UserAnswer::create([
            'user_id' => $user->id,
            'question_id' => 1,
            'level_id' => $level->id,
            'is_correct' => false,
        ]);

        $response = $this->getJson("/api/quiz/levels/{$level->id}/completion");

        $response->assertStatus(200)
            ->assertSee('Failed');

        $this->assertDatabaseHas('user_progress', [
            'user_id' => $user->id,
            'level_id' => $level->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_non_admin_cannot_create_question()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $level = $this->createLevel();

        $response = $this->postJson("/api/quiz/levels/{$level->id}/questions", [
            'question' => 'Unauthorized?',
            'correct_option' => 'No',
            'options' => ['No'],
            'image_url' => 'https://example.com/fail.png',
        ]);

        $response->assertStatus(403);
    }
}
