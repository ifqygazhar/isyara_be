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
    ];
}
