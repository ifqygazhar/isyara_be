<?php

namespace Tests\Feature;

use App\Models\EventModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_event_with_uploaded_image_and_delete_removes_file()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->image('event.jpg');

        $response = $this->postJson('/api/information/events', [
            'title' => 'Annual Event',
            'image' => $file,
            'description' => 'This is a detailed event description.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Annual Event');

        $item = EventModel::first();
        $this->assertNotNull($item);
        $this->assertStringContainsString('/storage/', $item->image_url);

        $relative = Str::after($item->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);

        $del = $this->deleteJson("/api/information/events/{$item->id}");
        $del->assertStatus(200);
        Storage::disk('public')->assertMissing($relative);
        $this->assertDatabaseMissing('events', ['id' => $item->id]);
    }

    public function test_store_event_with_image_url()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $external = 'https://cdn.example.com/event.png';
        $response = $this->postJson('/api/information/events', [
            'title' => 'Online Event',
            'image_url' => $external,
            'description' => 'Event with external link description.',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.title', 'Online Event');

        $item = EventModel::first();
        $this->assertEquals($external, $item->image_url);
    }

    public function test_update_event_keeps_existing_image_if_none_provided()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $item = EventModel::create([
            'title' => 'Initial Event',
            'image_url' => 'https://initial.com/event.png',
            'description' => 'Initial description.',
        ]);

        $resp = $this->putJson("/api/information/events/{$item->id}", [
            'title' => 'Updated Event',
            'description' => 'Updated event description.',
        ]);

        $resp->assertStatus(200)->assertJsonPath('data.title', 'Updated Event');

        $item->refresh();
        $this->assertEquals('https://initial.com/event.png', $item->image_url);
    }

    public function test_index_and_show_work_for_authenticated_users()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        EventModel::create([
            'title' => 'Public Event',
            'image_url' => 'https://public.com/e.png',
            'description' => 'Public event description.',
        ]);

        $this->getJson('/api/information/events')->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $item = EventModel::first();
        $this->getJson("/api/information/events/{$item->id}")->assertStatus(200)
            ->assertJsonPath('data.title', 'Public Event');
    }

    public function test_non_admin_cannot_delete_event()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $item = EventModel::create([
            'title' => 'Event To Delete',
            'image_url' => 'https://x.com/e.png',
            'description' => 'Should not be deleted by user.',
        ]);

        $this->deleteJson("/api/information/events/{$item->id}")->assertStatus(403);
    }
}
