<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KamusKata extends Model
{
    use HasFactory;

    protected $table = 'kamus_katas';

    protected $fillable = [
        'image_url',
        'kata',
        'image',
    ];
}
