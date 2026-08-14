<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'price',
        'date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'date' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeLoaded($query)
    {
        return $query->where('type', 'loaded');
    }

    public function scopeEmpty($query)
    {
        return $query->where('type', 'empty');
    }
}
