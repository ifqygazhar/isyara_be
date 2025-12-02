<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_requires_password_confirmation()
    {
        $resp = $this->postJson('/api/register', [
            'email' => 'u1@example.com',
            'password' => 'secret123',
            // no password_confirmation
        ]);

        $resp->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_register_creates_user_and_returns_token()
    {
        $resp = $this->postJson('/api/register', [
            'name' => 'User One',
            'email' => 'u2@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $resp->assertStatus(201)
            ->assertJsonStructure(['message', 'access_token', 'token_type', 'user'])
            ->assertJsonPath('user.email', 'u2@example.com');

        $this->assertDatabaseHas('users', ['email' => 'u2@example.com', 'role' => 'user']);
    }

    public function test_register_prohibits_role_field()
    {
        $resp = $this->postJson('/api/register', [
            'email' => 'u3@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'admin',
        ]);

        $resp->assertStatus(422)->assertJsonValidationErrors('role');
    }

    public function test_login_with_correct_credentials_and_role()
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('adminpass'),
            'role' => 'admin',
        ]);

        $resp = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'adminpass',
            'role' => 'admin',
        ]);

        $resp->assertStatus(200)
            ->assertJsonStructure(['message', 'access_token', 'token_type', 'user'])
            ->assertJsonPath('user.email', 'admin@example.com');
    }

    public function test_login_fails_when_role_mismatch()
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('userpass'),
            'role' => 'user',
        ]);

        $resp = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'userpass',
            'role' => 'admin',
        ]);

        $resp->assertStatus(403)->assertJson(['message' => 'Role tidak sesuai']);
    }

    public function test_logout_deletes_current_token()
    {
        $user = User::factory()->create([
            'email' => 'lout@example.com',
            'password' => Hash::make('logoutpass'),
            'role' => 'user',
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/logout')->assertStatus(200)->assertJson(['message' => 'Logout success']);

        $user->refresh();
        $this->assertEquals(0, $user->tokens()->count());
    }
}
