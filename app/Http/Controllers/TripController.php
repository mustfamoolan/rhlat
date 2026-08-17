<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Trip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TripController extends Controller
{
    public function indexLoaded(Request $request): Response
    {
        $query = Trip::with('user:id,name,role')->loaded();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('notes', 'like', "%{$search}%");
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->input('date'));
        }

        $trips = $query->latest('date')->paginate(15)->withQueryString();
        $totalSum = (clone $query)->sum('price');

        return Inertia::render('Trips/Loaded', [
            'trips' => $trips,
            'totalSum' => $totalSum,
            'filters' => $request->only(['search', 'date']),
        ]);
    }

    public function indexEmpty(Request $request): Response
    {
        $query = Trip::with('user:id,name,role')->empty();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('notes', 'like', "%{$search}%");
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->input('date'));
        }

        $trips = $query->latest('date')->paginate(15)->withQueryString();
        $totalSum = (clone $query)->sum('price');

        return Inertia::render('Trips/Empty', [
            'trips' => $trips,
            'totalSum' => $totalSum,
            'filters' => $request->only(['search', 'date']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:loaded,empty',
            'price' => 'required|integer|min:0',
            'count' => 'nullable|integer|min:1|max:50',
            'date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $count = (int) ($validated['count'] ?? 1);
        $userId = Auth::id();

        for ($i = 0; $i < $count; $i++) {
            Trip::create([
                'user_id' => $userId,
                'type' => $validated['type'],
                'price' => $validated['price'],
                'date' => $validated['date'],
                'notes' => $validated['notes'] ?? null,
            ]);
        }

        $typeLabel = $validated['type'] === 'loaded' ? 'محملة' : 'فارغة';
        $priceFormatted = number_format($validated['price']);
        $totalFormatted = number_format($validated['price'] * $count);

        if ($count === 1) {
            ActivityLog::log(
                "إضافة رحلة {$typeLabel}",
                "تمت إضافة رحلة {$typeLabel} بمبلغ {$priceFormatted} د.ع" . (!empty($validated['notes']) ? " (ملاحظات: {$validated['notes']})" : "")
            );
            $message = 'تمت إضافة الرحلة بنجاح.';
        } else {
            ActivityLog::log(
                "إضافة دفعة رحلات {$typeLabel} ({$count} رحلات)",
                "تمت إضافة عدد ({$count}) رحلات {$typeLabel} بمبلغ {$priceFormatted} د.ع للرحلة (إجمالي الوجبة: {$totalFormatted} د.ع)"
            );
            $message = "تمت إضافة ({$count}) رحلات {$typeLabel} بنجاح.";
        }

        return back()->with('success', $message);
    }

    public function update(Request $request, Trip $trip): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:loaded,empty',
            'price' => 'required|integer|min:0',
            'date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $trip->update($validated);

        $typeLabel = $trip->type === 'loaded' ? 'محملة' : 'فارغة';
        $priceFormatted = number_format($trip->price);
        ActivityLog::log(
            "تعديل رحلة {$typeLabel}",
            "تم تعديل الرحلة رقم #{$trip->id} بمبلغ {$priceFormatted} د.ع"
        );

        return back()->with('success', 'تم تعديل الرحلة بنجاح.');
    }

    public function destroy(Trip $trip): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->canDeleteTrips()) {
            abort(403, 'غير مصرح لك بحذف الرحلات.');
        }

        $typeLabel = $trip->type === 'loaded' ? 'محملة' : 'فارغة';
        $id = $trip->id;
        $priceFormatted = number_format($trip->price);

        $trip->delete();

        ActivityLog::log(
            "حذف رحلة {$typeLabel}",
            "تم حذف الرحلة رقم #{$id} البالغ سعرها {$priceFormatted} د.ع"
        );

        return back()->with('success', 'تم حذف الرحلة بنجاح.');
    }
}
