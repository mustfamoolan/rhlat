<?php

namespace App\Http\Controllers;

use App\Models\DeviceLog;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = DeviceLog::with(['user:id,name,role', 'trip:id,type,price']);

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $logs = $query->orderBy('created_at', 'desc')->orderBy('id', 'desc')->paginate(15)->withQueryString();
        $currentCount = DeviceLog::getCurrentCount();

        return Inertia::render('Devices/Index', [
            'logs' => $logs,
            'currentCount' => $currentCount,
            'filters' => $request->only(['type']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'غير مصرح لك بإجراء تعديل جرد الأجهزة.');
        }

        $validated = $request->validate([
            'amount' => 'required|integer',
            'notes' => 'nullable|string|max:1000',
        ]);

        $userId = Auth::id();
        $latestCount = DeviceLog::getCurrentCount();
        $amount = (int) $validated['amount'];

        DeviceLog::create([
            'user_id' => $userId,
            'trip_id' => null,
            'type' => 'manual_adjustment',
            'amount' => $amount,
            'previous_count' => $latestCount,
            'current_count' => $latestCount + $amount,
            'notes' => $validated['notes'] ?: 'تعديل يدوي لرصيد الأجهزة',
        ]);

        DeviceLog::recalculateChain();

        $actionWord = $amount >= 0 ? "زيادة" : "تخفيض";
        $absAmount = abs($amount);
        ActivityLog::log(
            "تعديل مخزون الأجهزة",
            "تم إجراء تعديل يدوي ({$actionWord} بمقدار {$absAmount} أجهزة) الرصيد الجديد: " . ($latestCount + $amount)
        );

        return back()->with('success', 'تم تعديل رصيد الأجهزة بنجاح.');
    }
}
