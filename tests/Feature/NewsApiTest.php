<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_news_with_uploaded_image_and_delete_removes_file()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->image('news.jpg');

        $response = $this->postJson('/api/information/news', [
            'title' => 'Breaking News',
            'image' => $file,
            'description' => 'This is a test news description with minimum length.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Breaking News');

        $item = News::first();
        $this->assertNotNull($item);
        $this->assertStringContainsString('/storage/', $item->image_url);

        $relative = Str::after($item->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);

        // delete
        $del = $this->deleteJson("/api/information/news/{$item->id}");
        $del->assertStatus(200);
        Storage::disk('public')->assertMissing($relative);
        $this->assertDatabaseMissing('news', ['id' => $item->id]);
    }

    public function test_store_news_with_image_url()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $external = 'https://example.com/news.png';
        $response = $this->postJson('/api/information/news', [
            'title' => 'External News',
            'image_url' => $external,
            'description' => 'News with external image link description.',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.title', 'External News');

        $item = News::first();
        $this->assertEquals($external, $item->image_url);
    }

    public function test_update_news_with_new_image()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $item = News::create([
            'title' => 'Old News',
            'image_url' => 'https://old.com/img.png',
            'description' => 'Old description here.',
        ]);

        $newFile = UploadedFile::fake()->image('new.jpg');

        $resp = $this->putJson("/api/information/news/{$item->id}", [
            'title' => 'Updated News',
            'image' => $newFile,
            'description' => 'Updated description here.',
        ]);

        $resp->assertStatus(200)->assertJsonPath('data.title', 'Updated News');

        $item->refresh();
        $this->assertStringContainsString('/storage/', $item->image_url);

        $relative = Str::after($item->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);
    }

    public function test_index_and_show_require_auth()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        News::create([
            'title' => 'Test News',
            'image_url' => 'https://a.com/b.png',
            'description' => 'Test description.',
        ]);

        $this->getJson('/api/information/news')->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $item = News::first();
        $this->getJson("/api/information/news/{$item->id}")->assertStatus(200)
            ->assertJsonPath('data.title', 'Test News');
    }

    public function test_non_admin_cannot_create_news()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $resp = $this->postJson('/api/information/news', [
            'title' => 'Unauthorized',
            'image_url' => 'https://x.com/i.png',
            'description' => 'Should fail.',
        ]);

        $resp->assertStatus(403);
    }
}
