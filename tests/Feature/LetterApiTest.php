<?php

namespace Tests\Feature;

use App\Models\KamusHuruf;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LetterApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_letter_with_uploaded_image_and_delete_removes_file()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->image('letter.jpg');

        $response = $this->postJson('/api/dictionary/letters', [
            'huruf' => 'A',
            'image' => $file,
        ]);

        $response->assertStatus(201)->assertJsonPath('data.huruf', 'A');

        $item = KamusHuruf::first();
        $this->assertNotNull($item);
        $this->assertStringContainsString('/storage/', $item->image_url);

        $relative = Str::after($item->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);

        // delete
        $this->deleteJson("/api/dictionary/letters/{$item->id}")->assertStatus(200);
        Storage::disk('public')->assertMissing($relative);
        $this->assertDatabaseMissing('kamus_hurufs', ['id' => $item->id]);
    }

    public function test_store_letter_with_image_url_and_index_show()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $external = 'https://cdn.example/letter.png';
        $resp = $this->postJson('/api/dictionary/letters', [
            'huruf' => 'B',
            'image_url' => $external,
        ]);

        // only admin can create — expect 403 for regular user
        $resp->assertStatus(403);

        // now as admin
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);
        $this->postJson('/api/dictionary/letters', [
            'huruf' => 'B',
            'image_url' => $external,
        ])->assertStatus(201);

        $this->getJson('/api/dictionary/letters')->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $item = KamusHuruf::first();
        $this->getJson("/api/dictionary/letters/{$item->id}")->assertStatus(200)
            ->assertJsonPath('data.huruf', 'B');
    }
}
