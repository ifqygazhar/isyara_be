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

class UserManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_all_users()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        User::factory()->count(3)->create(['role' => 'user']);

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonCount(4, 'data'); // 3 users + 1 admin
    }

    public function test_admin_can_filter_users_by_role()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        User::factory()->count(2)->create(['role' => 'user']);
        User::factory()->create(['role' => 'admin']);

        $response = $this->getJson('/api/users?role=user');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_search_users_by_name()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
        User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);

        $response = $this->getJson('/api/users?search=John');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'John Doe');
    }

    public function test_admin_can_search_users_by_email()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        User::factory()->create(['name' => 'User One', 'email' => 'userone@example.com']);
        User::factory()->create(['name' => 'User Two', 'email' => 'usertwo@example.com']);

        $response = $this->getJson('/api/users?search=usertwo');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'usertwo@example.com');
    }

    public function test_admin_can_create_user_with_image()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->image('user.jpg');

        $response = $this->postJson('/api/users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => 'user',
            'image' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'New User')
            ->assertJsonPath('data.email', 'newuser@example.com');

        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertNotNull($user);
        $this->assertStringContainsString('/storage/', $user->image_url);

        $relative = Str::after($user->image_url, '/storage/');
        Storage::disk('public')->assertExists($relative);
    }

    public function test_admin_can_create_user_with_image_url()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/users', [
            'name' => 'External User',
            'email' => 'external@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'image_url' => 'https://example.com/user.png',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'external@example.com')->first();
        $this->assertEquals('https://example.com/user.png', $user->image_url);
    }

    public function test_admin_can_view_single_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $user = User::factory()->create(['name' => 'Test User']);

        $response = $this->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Test User');
    }

    public function test_admin_can_update_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $user = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'old@example.com',
            'role' => 'user',
        ]);

        $response = $this->putJson("/api/users/{$user->id}", [
            'name' => 'Updated Name',
            'role' => 'admin',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.role', 'admin');

        $user->refresh();
        $this->assertEquals('Updated Name', $user->name);
        $this->assertEquals('admin', $user->role);
    }

    public function test_admin_can_update_user_password()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $user = User::factory()->create([
            'password' => Hash::make('oldpass'),
        ]);

        $response = $this->putJson("/api/users/{$user->id}", [
            'password' => 'newpassword123',
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    public function test_admin_can_delete_user()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->image('user.jpg');
        $path = $file->store('profiles', 'public');
        $imageUrl = Storage::url($path);

        $user = User::factory()->create(['image_url' => $imageUrl]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'User deleted successfully');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        Storage::disk('public')->assertMissing(Str::after($imageUrl, '/storage/'));
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }

    public function test_admin_cannot_delete_own_account()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->deleteJson("/api/users/{$admin->id}");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Cannot delete your own account');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_non_admin_cannot_access_user_management()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/users')->assertStatus(403);
        $this->postJson('/api/users', [])->assertStatus(403);
        $this->putJson('/api/users/1', [])->assertStatus(403);
        $this->deleteJson('/api/users/1')->assertStatus(403);
    }

    public function test_create_user_requires_valid_email()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/users', [
            'name' => 'Test',
            'email' => 'invalid-email',
            'password' => 'password123',
            'role' => 'user',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_create_user_requires_unique_email()
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/users', [
            'name' => 'Test',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'role' => 'user',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_update_user_email_must_be_unique()
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $user = User::factory()->create(['email' => 'original@example.com']);

        $response = $this->putJson("/api/users/{$user->id}", [
            'email' => 'taken@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_returns_404_if_no_users_found()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        // Only admin exists, search for non-existent role
        $response = $this->getJson('/api/users?role=nonexistent');

        $response->assertStatus(404)
            ->assertJsonPath('message', 'No users found');
    }

    public function test_returns_404_if_user_not_found()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/users/99999');

        $response->assertStatus(404)
            ->assertJsonPath('message', 'User not found');
    }

    public function test_update_replaces_old_image_with_new_upload()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $oldFile = UploadedFile::fake()->image('old.jpg');
        $oldPath = $oldFile->store('profiles', 'public');
        $oldUrl = Storage::url($oldPath);

        $user = User::factory()->create(['image_url' => $oldUrl]);

        $newFile = UploadedFile::fake()->image('new.jpg');

        $this->putJson("/api/users/{$user->id}", [
            'image' => $newFile,
        ]);

        Storage::disk('public')->assertMissing($oldPath);
    }
}
