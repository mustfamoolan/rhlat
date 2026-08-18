<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Expense;
use App\Models\Trip;
use App\Models\DeviceLog;
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

        // Queries filtered strictly by selected time range for stats
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

        // CALCULATE CURRENT MONTH'S CASH BOX BALANCE (Unaffected by date filter)
        $monthStart = Carbon::now($timezone)->startOfMonth();
        $monthEnd = Carbon::now($timezone)->endOfMonth();

        $monthRevenue = Trip::whereBetween('date', [$monthStart, $monthEnd])->sum('price');
        $monthExpenses = Expense::whereBetween('date', [$monthStart, $monthEnd])->sum('amount');
        $cashBoxBalance = $monthRevenue - $monthExpenses;

        // CALCULATE PAST MONTHS ARCHIVES DYNAMICALLY (Go back up to 12 months)
        $pastMonthsArchives = collect();
        $oldestTrip = Trip::orderBy('date', 'asc')->first();
        $oldestExpense = Expense::orderBy('date', 'asc')->first();

        $startPoint = Carbon::now($timezone)->subMonths(12)->startOfMonth();
        if ($oldestTrip && Carbon::parse($oldestTrip->date)->lt($startPoint)) {
            $startPoint = Carbon::parse($oldestTrip->date)->startOfMonth();
        }
        if ($oldestExpense && Carbon::parse($oldestExpense->date)->lt($startPoint)) {
            $startPoint = Carbon::parse($oldestExpense->date)->startOfMonth();
        }

        $currentMonthStr = Carbon::now($timezone)->format('Y-m');
        $checkDate = $startPoint->clone();

        while ($checkDate->format('Y-m') < $currentMonthStr) {
            $mStart = $checkDate->clone()->startOfMonth();
            $mEnd = $checkDate->clone()->endOfMonth();
            
            $mRevenue = Trip::whereBetween('date', [$mStart, $mEnd])->sum('price');
            $mExpenses = Expense::whereBetween('date', [$mStart, $mEnd])->sum('amount');
            $mNet = $mRevenue - $mExpenses;
            
            $pastMonthsArchives->push([
                'month' => $checkDate->format('Y-m'),
                'month_name' => $checkDate->translatedFormat('F Y'),
                'revenue' => (int) $mRevenue,
                'expenses' => (int) $mExpenses,
                'net' => (int) $mNet,
            ]);
            
            $checkDate->addMonth();
        }
        $pastMonthsArchives = $pastMonthsArchives->reverse()->values();

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
                'cashBoxBalance' => (int) $cashBoxBalance,
                'currentMonthName' => Carbon::now($timezone)->translatedFormat('F Y'),
                'currentDevicesCount' => DeviceLog::getCurrentCount(),
            ],
            'pastMonthsArchives' => $pastMonthsArchives,
            'isCustomRange' => $isCustomRange,
            'fromDate' => $fromDate ?: $start->toDateString(),
            'toDate' => $toDate ?: $end->toDateString(),
            'currentBaghdadTime' => Carbon::now($timezone)->format('Y-m-d h:i A'),
            'recentTrips' => $recentTrips,
            'recentActivities' => $recentActivities,
        ]);
    }
}
