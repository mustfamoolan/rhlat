<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Expense;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $filter = $request->input('filter', 'month');

        $tripQuery = Trip::query();
        $expenseQuery = Expense::query();

        if ($filter === 'today') {
            $tripQuery->whereDate('date', Carbon::today());
            $expenseQuery->whereDate('date', Carbon::today());
        } elseif ($filter === 'week') {
            $tripQuery->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
            $expenseQuery->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($filter === 'month') {
            $tripQuery->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year);
            $expenseQuery->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year);
        }

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

        $recentTrips = Trip::with('user:id,name,role')->latest('date')->take(5)->get();
        $recentExpenses = Expense::with('user:id,name,role')->latest('date')->take(5)->get();
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
            'filter' => $filter,
            'recentTrips' => $recentTrips,
            'recentExpenses' => $recentExpenses,
            'recentActivities' => $recentActivities,
        ]);
    }
}
