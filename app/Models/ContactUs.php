<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactUs extends Model
{
    use HasFactory;

    protected $table = 'contact_us';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'message',
        'created_at',
    ];
}
