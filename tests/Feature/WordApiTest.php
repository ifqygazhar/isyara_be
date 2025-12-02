<?php

namespace Tests\Feature;

use App\Models\KamusKata;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WordApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_word_with_uploaded_image_and_delete_removes_file()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->image('word.jpg');

        $response = $this->postJson('/api/dictionary/words', [
            'kata' => 'contoh',
            'image' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.kata', 'contoh');

        $item = KamusKata::first();
        $this->assertNotNull($item);
        $this->assertStringContainsString('/storage/', $item->image_url);

        $relative = Str::after($item->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);

        // delete
        $del = $this->deleteJson("/api/dictionary/words/{$item->id}");
        $del->assertStatus(200);
        Storage::disk('public')->assertMissing($relative);
        $this->assertDatabaseMissing('kamus_katas', ['id' => $item->id]);
    }

    public function test_store_word_with_image_url_not_delete_external_on_destroy()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $external = 'https://example.com/img.png';
        $response = $this->postJson('/api/dictionary/words', [
            'kata' => 'linkkata',
            'image_url' => $external,
        ]);

        $response->assertStatus(201)->assertJsonPath('data.kata', 'linkkata');

        $item = KamusKata::first();
        $this->assertEquals($external, $item->image_url);

        $this->deleteJson("/api/dictionary/words/{$item->id}")->assertStatus(200);

        // external link shouldn't touch storage (nothing to check) and record removed
        $this->assertDatabaseMissing('kamus_katas', ['id' => $item->id]);
    }

    public function test_index_and_show_require_auth()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        KamusKata::create(['kata' => 'satu', 'image_url' => 'https://a/b.png']);

        $this->getJson('/api/dictionary/words')->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $item = KamusKata::first();
        $this->getJson("/api/dictionary/words/{$item->id}")->assertStatus(200)
            ->assertJsonPath('data.kata', 'satu');
    }
}
