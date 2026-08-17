<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceLog extends Model
{
    protected $fillable = [
        'user_id',
        'trip_id',
        'type',
        'amount',
        'previous_count',
        'current_count',
        'notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    /**
     * Recalculates the entire device count history chain to ensure mathematical consistency.
     */
    public static function recalculateChain(): void
    {
        $logs = self::orderBy('created_at', 'asc')->orderBy('id', 'asc')->get();
        $runningCount = 0;
        foreach ($logs as $log) {
            $log->previous_count = $runningCount;
            $runningCount += $log->amount;
            $log->current_count = $runningCount;
            $log->save();
        }
    }

    /**
     * Get the latest current device count.
     */
    public static function getCurrentCount(): int
    {
        $latest = self::orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
        return $latest ? $latest->current_count : 0;
    }
}
