<?php

namespace Tests\Feature;

use App\Models\ContactUs;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContactUsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_contact_message()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/contact', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'message' => 'This is a test message from user.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Your message has been sent successfully')
            ->assertJsonPath('data.name', 'John Doe')
            ->assertJsonPath('data.email', 'john@example.com');

        $this->assertDatabaseHas('contact_us', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'message' => 'This is a test message from user.',
        ]);
    }

    public function test_validation_fails_if_fields_missing()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/contact', [
            'name' => 'John Doe',
            // missing email and message
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'message']);
    }

    public function test_validation_fails_if_email_invalid()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/contact', [
            'name' => 'John Doe',
            'email' => 'invalid-email',
            'message' => 'Test message',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_admin_can_view_all_contact_messages()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        ContactUs::create([
            'name' => 'User 1',
            'email' => 'user1@example.com',
            'message' => 'Message 1',
            'created_at' => now()->subHour(),
        ]);

        ContactUs::create([
            'name' => 'User 2',
            'email' => 'user2@example.com',
            'message' => 'Message 2',
            'created_at' => now(),
        ]);

        $response = $this->getJson('/api/contact');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'User 2') // ordered by created_at desc
            ->assertJsonPath('data.1.name', 'User 1');
    }

    public function test_admin_can_view_single_contact_message()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $contact = ContactUs::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'message' => 'Test message',
            'created_at' => now(),
        ]);

        $response = $this->getJson("/api/contact/{$contact->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Test User')
            ->assertJsonPath('data.email', 'test@example.com')
            ->assertJsonPath('data.message', 'Test message');
    }

    public function test_admin_can_delete_contact_message()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $contact = ContactUs::create([
            'name' => 'To Delete',
            'email' => 'delete@example.com',
            'message' => 'Delete me',
            'created_at' => now(),
        ]);

        $response = $this->deleteJson("/api/contact/{$contact->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Contact message deleted successfully');

        $this->assertDatabaseMissing('contact_us', ['id' => $contact->id]);
    }

    public function test_returns_404_if_contact_not_found()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/contact/999');

        $response->assertStatus(404)
            ->assertJsonPath('message', 'Contact message not found');
    }

    public function test_non_admin_cannot_view_all_contact_messages()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/contact');

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_view_single_contact_message()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $contact = ContactUs::create([
            'name' => 'Protected',
            'email' => 'protected@example.com',
            'message' => 'Cannot view',
            'created_at' => now(),
        ]);

        $response = $this->getJson("/api/contact/{$contact->id}");

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_delete_contact_message()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user, ['*']);

        $contact = ContactUs::create([
            'name' => 'Protected',
            'email' => 'protected@example.com',
            'message' => 'Cannot delete',
            'created_at' => now(),
        ]);

        $response = $this->deleteJson("/api/contact/{$contact->id}");

        $response->assertStatus(403);
    }

    public function test_returns_404_if_no_contact_messages()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/contact');

        $response->assertStatus(404)
            ->assertJsonPath('message', 'No contact messages found');
    }

    public function test_unauthenticated_user_cannot_send_contact()
    {
        $response = $this->postJson('/api/contact', [
            'name' => 'Anonymous',
            'email' => 'anon@example.com',
            'message' => 'Should fail',
        ]);

        $response->assertStatus(401);
    }
}
