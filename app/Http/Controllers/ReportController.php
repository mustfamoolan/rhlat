<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function exportPdf(Request $request)
    {
        $timezone = 'Asia/Baghdad';

        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        if (!empty($fromDate) && !empty($toDate)) {
            $start = Carbon::parse($fromDate, $timezone)->startOfDay();
            $end = Carbon::parse($toDate, $timezone)->endOfDay();
            $periodLabel = "الفترة من {$start->toDateString()} إلى {$end->toDateString()}";
        } else {
            $start = Carbon::now($timezone)->startOfDay();
            $end = Carbon::now($timezone)->endOfDay();
            $periodLabel = "يوم " . Carbon::now($timezone)->toDateString();
        }

        // Fetch all trips and expenses in this date range
        $trips = Trip::with('user:id,name,role')
            ->whereBetween('date', [$start, $end])
            ->orderBy('date', 'asc')
            ->get();

        $expenses = Expense::with('user:id,name,role')
            ->whereBetween('date', [$start, $end])
            ->orderBy('date', 'asc')
            ->get();

        // Calculate Totals
        $loadedTrips = $trips->where('type', 'loaded');
        $emptyTrips = $trips->where('type', 'empty');

        $loadedCount = $loadedTrips->count();
        $emptyCount = $emptyTrips->count();
        $loadedRevenue = $loadedTrips->sum('price');
        $emptyRevenue = $emptyTrips->sum('price');
        $totalRevenue = $loadedRevenue + $emptyRevenue;
        $totalExpenses = $expenses->sum('amount');
        $netIncome = $totalRevenue - $totalExpenses;

        // Combine into unified Data Grid rows sorted chronologically
        $gridData = collect();

        foreach ($trips as $trip) {
            $gridData->push([
                'id' => $trip->id,
                'date' => Carbon::parse($trip->date)->format('Y/m/d h:i A'),
                'type' => $trip->type === 'loaded' ? 'رحلة محملة' : 'رحلة فارغة',
                'raw_type' => $trip->type,
                'category' => 'trip',
                'details' => $trip->notes ?: '-',
                'user' => $trip->user ? $trip->user->name : '-',
                'amount' => $trip->price,
                'is_income' => true,
            ]);
        }

        foreach ($expenses as $expense) {
            $gridData->push([
                'id' => $expense->id,
                'date' => Carbon::parse($expense->date)->format('Y/m/d h:i A'),
                'type' => 'مصروف تشغيلي',
                'raw_type' => 'expense',
                'category' => 'expense',
                'details' => $expense->reason ?: '-',
                'user' => $expense->user ? $expense->user->name : '-',
                'amount' => -$expense->amount,
                'is_income' => false,
            ]);
        }

        $gridData = $gridData->sortBy('date')->values();

        return view('reports.pdf', [
            'periodLabel' => $periodLabel,
            'generatedAt' => Carbon::now($timezone)->format('Y/m/d h:i A'),
            'loadedCount' => $loadedCount,
            'emptyCount' => $emptyCount,
            'loadedRevenue' => $loadedRevenue,
            'emptyRevenue' => $emptyRevenue,
            'totalRevenue' => $totalRevenue,
            'totalExpenses' => $totalExpenses,
            'netIncome' => $netIncome,
            'gridData' => $gridData,
        ]);
    }
}
