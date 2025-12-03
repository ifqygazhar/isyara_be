<?php

namespace Tests\Feature;

use App\Models\Community;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_community_with_uploaded_image_and_delete_removes_file()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->image('community.jpg');

        $response = $this->postJson('/api/information/community', [
            'title' => 'Tech Community',
            'image' => $file,
            'description' => 'A community for tech enthusiasts.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Tech Community');

        $item = Community::first();
        $this->assertNotNull($item);
        $this->assertStringContainsString('/storage/', $item->image_url);

        $relative = Str::after($item->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);

        $del = $this->deleteJson("/api/information/community/{$item->id}");
        $del->assertStatus(200);
        Storage::disk('public')->assertMissing($relative);
        $this->assertDatabaseMissing('communities', ['id' => $item->id]);
    }

    public function test_store_community_with_image_url()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $external = 'https://example.com/community.png';
        $response = $this->postJson('/api/information/community', [
            'title' => 'Global Community',
            'image_url' => $external,
            'description' => 'Community with external image link.',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.title', 'Global Community');

        $item = Community::first();
        $this->assertEquals($external, $item->image_url);
    }

    public function test_update_community_with_new_image_url()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $item = Community::create([
            'title' => 'Old Community',
            'image_url' => 'https://old.com/c.png',
            'description' => 'Old community description.',
        ]);

        $resp = $this->putJson("/api/information/community/{$item->id}", [
            'title' => 'Updated Community',
            'image_url' => 'https://new.com/c.png',
            'description' => 'Updated community description.',
        ]);

        $resp->assertStatus(200)->assertJsonPath('data.title', 'Updated Community');

        $item->refresh();
        $this->assertEquals('https://new.com/c.png', $item->image_url);
    }

    public function test_index_and_show_for_community()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        Community::create([
            'title' => 'Art Community',
            'image_url' => 'https://art.com/c.png',
            'description' => 'Art lovers community.',
        ]);

        $this->getJson('/api/information/community')->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $item = Community::first();
        $this->getJson("/api/information/community/{$item->id}")->assertStatus(200)
            ->assertJsonPath('data.title', 'Art Community');
    }

    public function test_validation_fails_if_title_too_short()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $resp = $this->postJson('/api/information/community', [
            'title' => 'abc',
            'image_url' => 'https://x.com/i.png',
            'description' => 'Valid description here.',
        ]);

        $resp->assertStatus(422)->assertJsonValidationErrors('title');
    }
}
