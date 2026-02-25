<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KamusHuruf extends Model
{
    use HasFactory;

    protected $table = 'kamus_hurufs';

    protected $fillable = [
        'image_url',
        'huruf',
        'image',
        'is_bisindo',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_kamus_hurufs')
                    ->withPivot('is_knowing')
                    ->withTimestamps();
    }
}
