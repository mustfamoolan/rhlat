<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Expense;
use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $timezone = 'Asia/Baghdad';
        
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $isCustomRange = !empty($fromDate) && !empty($toDate);

        if ($isCustomRange) {
            // User requested a specific date range report
            $start = Carbon::parse($fromDate, $timezone)->startOfDay();
            $end = Carbon::parse($toDate, $timezone)->endOfDay();
        } else {
            // Default 24-hour mode: Resets every midnight (12:00 AM) Baghdad Time
            $start = Carbon::now($timezone)->startOfDay();
            $end = Carbon::now($timezone)->endOfDay();
        }

        // Queries filtered strictly by selected time range
        $tripQuery = Trip::query()->whereBetween('date', [$start, $end]);
        $expenseQuery = Expense::query()->whereBetween('date', [$start, $end]);

        $trips = (clone $tripQuery)->get();
        $expenses = (clone $expenseQuery)->get();

        $loadedTrips = $trips->where('type', 'loaded');
        $emptyTrips = $trips->where('type', 'empty');

        $loadedCount = $loadedTrips->count();
        $emptyCount = $emptyTrips->count();
        $totalTrips = $trips->count();

        $loadedRevenue = $loadedTrips->sum('price');
        $emptyRevenue = $emptyTrips->sum('price');
        $totalRevenue = $loadedRevenue + $emptyRevenue;

        $totalExpenses = $expenses->sum('amount');
        $netIncome = $totalRevenue - $totalExpenses;

        // Recent items inside the requested range (or fallback to recent)
        $recentTrips = Trip::with('user:id,name,role')
            ->whereBetween('date', [$start, $end])
            ->latest('date')
            ->take(6)
            ->get();

        // If no trips in today's range yet, fetch last 5 overall so the table isn't completely empty
        if ($recentTrips->isEmpty()) {
            $recentTrips = Trip::with('user:id,name,role')->latest('date')->take(5)->get();
        }

        $recentActivities = ActivityLog::latest()->take(6)->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalTrips' => $totalTrips,
                'loadedCount' => $loadedCount,
                'emptyCount' => $emptyCount,
                'loadedRevenue' => $loadedRevenue,
                'emptyRevenue' => $emptyRevenue,
                'totalRevenue' => $totalRevenue,
                'totalExpenses' => $totalExpenses,
                'netIncome' => $netIncome,
            ],
            'isCustomRange' => $isCustomRange,
            'fromDate' => $fromDate ?: $start->toDateString(),
            'toDate' => $toDate ?: $end->toDateString(),
            'currentBaghdadTime' => Carbon::now($timezone)->format('Y-m-d h:i A'),
            'recentTrips' => $recentTrips,
            'recentActivities' => $recentActivities,
        ]);
    }
}
