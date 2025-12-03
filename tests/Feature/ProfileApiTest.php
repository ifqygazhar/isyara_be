<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_own_profile()
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role' => 'user',
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'John Doe')
            ->assertJsonPath('data.email', 'john@example.com')
            ->assertJsonPath('data.role', 'user');
    }

    public function test_unauthenticated_user_cannot_view_profile()
    {
        $response = $this->getJson('/api/profile');

        $response->assertStatus(401);
    }

    public function test_user_can_update_profile_name_and_email()
    {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'old@example.com',
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'name' => 'New Name',
            'email' => 'new@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.email', 'new@example.com');

        $user->refresh();
        $this->assertEquals('New Name', $user->name);
        $this->assertEquals('new@example.com', $user->email);
    }

    public function test_user_can_update_profile_with_uploaded_image()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'name' => 'Test User',
            'image_url' => null,
        ]);

        Sanctum::actingAs($user, ['*']);

        $file = UploadedFile::fake()->image('profile.jpg');

        $response = $this->putJson('/api/profile', [
            'name' => 'Updated Name',
            'image' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');

        $user->refresh();
        $this->assertStringContainsString('/storage/', $user->image_url);

        $relative = Str::after($user->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);
    }

    public function test_user_can_update_profile_with_image_url()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'name' => 'Updated Name',
            'image_url' => 'https://example.com/avatar.png',
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertEquals('https://example.com/avatar.png', $user->image_url);
    }

    public function test_user_can_update_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword', $user->password));
    }

    public function test_password_update_requires_confirmation()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'password' => 'newpassword',
            // no password_confirmation
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_old_image_deleted_when_uploading_new_one()
    {
        Storage::fake('public');

        $oldFile = UploadedFile::fake()->image('old.jpg');
        $oldPath = $oldFile->store('profiles', 'public');
        $oldUrl = Storage::url($oldPath);

        $user = User::factory()->create(['image_url' => $oldUrl]);
        Sanctum::actingAs($user, ['*']);

        $newFile = UploadedFile::fake()->image('new.jpg');

        $this->putJson('/api/profile', [
            'image' => $newFile,
        ]);

        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_old_image_not_deleted_if_external_url()
    {
        Storage::fake('public');

        $user = User::factory()->create(['image_url' => 'https://example.com/old.png']);
        Sanctum::actingAs($user, ['*']);

        $newFile = UploadedFile::fake()->image('new.jpg');

        $response = $this->putJson('/api/profile', [
            'image' => $newFile,
        ]);

        $response->assertStatus(200);
        // No deletion expected for external URLs
    }

    public function test_email_must_be_unique()
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $user = User::factory()->create(['email' => 'user@example.com']);
        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'email' => 'existing@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_delete_own_account()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('profile.jpg');
        $path = $file->store('profiles', 'public');
        $imageUrl = Storage::url($path);

        $user = User::factory()->create(['image_url' => $imageUrl]);
        Sanctum::actingAs($user, ['*']);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->deleteJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Account deleted successfully');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        Storage::disk('public')->assertMissing(Str::after($imageUrl, '/storage/'));
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }

    public function test_profile_update_keeps_existing_values_if_not_provided()
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'original@example.com',
            'image_url' => 'https://example.com/original.png',
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'name' => 'Updated Name',
            // email and image_url not provided
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertEquals('Updated Name', $user->name);
        $this->assertEquals('original@example.com', $user->email);
        $this->assertEquals('https://example.com/original.png', $user->image_url);
    }
}
