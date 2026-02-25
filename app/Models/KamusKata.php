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
        'is_bisindo',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_kamus_katas')
                    ->withPivot('is_knowing')
                    ->withTimestamps();
    }
}
