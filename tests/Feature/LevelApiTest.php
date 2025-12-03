<?php

namespace Tests\Feature;

use App\Models\Level;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LevelApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_levels()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        Level::create([
            'name' => 'Level 1',
            'title' => 'Beginner',
            'image_url' => 'https://example.com/level1.png',
            'description' => 'First level description',
        ]);

        Level::create([
            'name' => 'Level 2',
            'title' => 'Intermediate',
            'image_url' => 'https://example.com/level2.png',
            'description' => 'Second level description',
        ]);

        $response = $this->getJson('/api/quiz/levels');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Level 1');
    }

    public function test_store_level_with_uploaded_image()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->image('level.jpg');

        $response = $this->postJson('/api/quiz/levels', [
            'name' => 'Level 3',
            'title' => 'Advanced',
            'image' => $file,
            'description' => 'Advanced level description',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Level 3');

        $level = Level::first();
        $this->assertStringContainsString('/storage/', $level->image_url);

        $relative = Str::after($level->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);
    }

    public function test_store_level_with_image_url()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/quiz/levels', [
            'name' => 'Level 4',
            'title' => 'Expert',
            'image_url' => 'https://example.com/level4.png',
            'description' => 'Expert level description',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Level 4');

        $level = Level::first();
        $this->assertEquals('https://example.com/level4.png', $level->image_url);
    }

    public function test_update_level()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $level = Level::create([
            'name' => 'Old Level',
            'title' => 'Old Title',
            'image_url' => 'https://old.com/level.png',
            'description' => 'Old description',
        ]);

        $response = $this->putJson("/api/quiz/levels/{$level->id}", [
            'name' => 'Updated Level',
            'title' => 'Updated Title',
            'image_url' => 'https://new.com/level.png',
            'description' => 'Updated description',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Level');

        $level->refresh();
        $this->assertEquals('Updated Level', $level->name);
    }

    public function test_delete_level_removes_file()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->image('level.jpg');

        $this->postJson('/api/quiz/levels', [
            'name' => 'To Delete',
            'title' => 'Delete Me',
            'image' => $file,
            'description' => 'Will be deleted',
        ]);

        $level = Level::first();
        $relative = Str::after($level->image_url, '/storage/');

        $response = $this->deleteJson("/api/quiz/levels/{$level->id}");

        $response->assertStatus(200);
        Storage::disk('public')->assertMissing($relative);
        $this->assertDatabaseMissing('levels', ['id' => $level->id]);
    }

    public function test_show_level_requires_previous_level_completion()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        Level::create([
            'id' => 1,
            'name' => 'Level 1',
            'title' => 'First',
            'image_url' => 'https://example.com/1.png',
            'description' => 'First level',
        ]);

        Level::create([
            'id' => 2,
            'name' => 'Level 2',
            'title' => 'Second',
            'image_url' => 'https://example.com/2.png',
            'description' => 'Second level',
        ]);

        // Try to access level 2 without completing level 1
        $response = $this->getJson('/api/quiz/levels/2');

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You must complete level 1 before accessing this level.');
    }

    public function test_non_admin_cannot_create_level()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/quiz/levels', [
            'name' => 'Unauthorized Level',
            'title' => 'Should Fail',
            'image_url' => 'https://example.com/fail.png',
            'description' => 'Should not be created',
        ]);

        $response->assertStatus(403);
    }
}
