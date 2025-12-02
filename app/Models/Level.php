<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    use HasFactory;

    protected $table = 'levels';

    protected $fillable = [
        'name',
        'title',
        'image_url',
        'description',
    ];

    public function questions()
    {
        return $this->hasMany(Question::class, 'level_id', 'id');
    }

    public function userProgress()
    {
        return $this->hasMany(UserProgress::class, 'level_id', 'id');
    }
}
