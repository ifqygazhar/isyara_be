<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $table = 'questions';

    // DB defines composite PK (id, level_id) — Eloquent doesn't natively support composite PK.
    // Set incrementing=false to avoid auto-increment expectations. Adjust if you change migrations.
    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'int';

    public $timestamps = true;

    protected $fillable = [
        'level_id',
        'id',
        'image_url',
        'question',
        'correct_option',
        'options',
    ];

    protected $casts = [
        'options' => 'array',
    ];

    public function level()
    {
        return $this->belongsTo(Level::class, 'level_id', 'id');
    }

    public function answers()
    {
        return $this->hasMany(UserAnswer::class, 'question_id', 'id');
    }
}
