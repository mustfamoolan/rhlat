<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Trip;
use App\Models\DeviceLog;
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

        // Fetch all trips, expenses, and device adjustments in this date range
        $trips = Trip::with('user:id,name,role')
            ->whereBetween('date', [$start, $end])
            ->orderBy('date', 'asc')
            ->get();

        $expenses = Expense::with('user:id,name,role')
            ->whereBetween('date', [$start, $end])
            ->orderBy('date', 'asc')
            ->get();

        $adjustments = DeviceLog::with('user:id,name,role')
            ->whereBetween('created_at', [$start, $end])
            ->whereNull('trip_id')
            ->orderBy('created_at', 'asc')
            ->get();

        // Calculate Totals
        $loadedTrips = $trips->where('type', 'loaded');
        $emptyTrips = $trips->where('type', 'empty');

        $loadedCount = $loadedTrips->count();
        $emptyCount = $emptyTrips->count();
        $totalTripsCount = $trips->count();

        $loadedRevenue = $loadedTrips->sum('price');
        $emptyRevenue = $emptyTrips->sum('price');
        $totalRevenue = $loadedRevenue + $emptyRevenue;
        $totalExpenses = $expenses->sum('amount');
        $netIncome = $totalRevenue - $totalExpenses;

        // Calculate Device stats for this report period
        $startLog = DeviceLog::where('created_at', '<', $start)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();
        $startingDevicesCount = $startLog ? $startLog->current_count : 0;

        $endLog = DeviceLog::where('created_at', '<=', $end)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();
        $endingDevicesCount = $endLog ? $endLog->current_count : $startingDevicesCount;

        $addedDevices = DeviceLog::whereBetween('created_at', [$start, $end])
            ->where('amount', '>', 0)
            ->sum('amount');

        $removedDevices = abs(DeviceLog::whereBetween('created_at', [$start, $end])
            ->where('amount', '<', 0)
            ->sum('amount'));

        // Combine into unified Data Grid rows sorted chronologically
        $gridData = collect();

        foreach ($trips as $trip) {
            $deviceLog = DeviceLog::where('trip_id', $trip->id)->first();
            $gridData->push([
                'id' => $trip->id,
                'timestamp' => Carbon::parse($trip->date)->timestamp,
                'date' => Carbon::parse($trip->date)->format('Y/m/d h:i A'),
                'type' => $trip->type === 'loaded' ? 'رحلة محملة' : 'رحلة فارغة',
                'raw_type' => $trip->type,
                'category' => 'trip',
                'details' => $trip->notes ?: '-',
                'user' => $trip->user ? $trip->user->name : '-',
                'amount' => $trip->price,
                'is_income' => true,
                'device_change' => $trip->type === 'loaded' ? '+1' : '-1',
                'device_balance' => $deviceLog ? $deviceLog->current_count : '-',
            ]);
        }

        foreach ($expenses as $expense) {
            $gridData->push([
                'id' => $expense->id,
                'timestamp' => Carbon::parse($expense->date)->timestamp,
                'date' => Carbon::parse($expense->date)->format('Y/m/d h:i A'),
                'type' => 'مصروف تشغيلي',
                'raw_type' => 'expense',
                'category' => 'expense',
                'details' => $expense->reason ?: '-',
                'user' => $expense->user ? $expense->user->name : '-',
                'amount' => -$expense->amount,
                'is_income' => false,
                'device_change' => '—',
                'device_balance' => '—',
            ]);
        }

        foreach ($adjustments as $adj) {
            $gridData->push([
                'id' => $adj->id,
                'timestamp' => Carbon::parse($adj->created_at)->timestamp,
                'date' => Carbon::parse($adj->created_at)->format('Y/m/d h:i A'),
                'type' => 'تعديل جرد يدوي',
                'raw_type' => 'adjustment',
                'category' => 'device',
                'details' => $adj->notes ?: 'تعديل رصيد الأجهزة يدوياً',
                'user' => $adj->user ? $adj->user->name : '-',
                'amount' => 0,
                'is_income' => true,
                'device_change' => $adj->amount >= 0 ? "+{$adj->amount}" : $adj->amount,
                'device_balance' => $adj->current_count,
            ]);
        }

        // Sort ledger chronologically
        $gridData = $gridData->sortBy('timestamp')->values();

        return view('reports.pdf', [
            'periodLabel' => $periodLabel,
            'generatedAt' => Carbon::now($timezone)->format('Y/m/d h:i A'),
            'totalTripsCount' => $totalTripsCount,
            'loadedCount' => $loadedCount,
            'emptyCount' => $emptyCount,
            'loadedRevenue' => $loadedRevenue,
            'emptyRevenue' => $emptyRevenue,
            'totalRevenue' => $totalRevenue,
            'totalExpenses' => $totalExpenses,
            'netIncome' => $netIncome,
            'startingDevicesCount' => $startingDevicesCount,
            'endingDevicesCount' => $endingDevicesCount,
            'addedDevices' => $addedDevices,
            'removedDevices' => $removedDevices,
            'gridData' => $gridData,
        ]);
    }
}
