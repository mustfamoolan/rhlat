<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Expense::with('user:id,name,role');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('reason', 'like', "%{$search}%");
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->input('date'));
        }

        $expenses = $query->latest('date')->paginate(15)->withQueryString();
        $totalSum = (clone $query)->sum('amount');

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'totalSum' => $totalSum,
            'filters' => $request->only(['search', 'date']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
            'date' => 'required|date',
        ]);

        $expense = Expense::create([
            'user_id' => Auth::id(),
            'amount' => $validated['amount'],
            'reason' => $validated['reason'] ?? null,
            'date' => $validated['date'],
        ]);

        $amountFormatted = number_format($expense->amount);
        $reasonStr = $expense->reason ? " (السبب: {$expense->reason})" : " (بدون سبب)";
        ActivityLog::log(
            "إضافة مصروف",
            "تمت إضافة مصروف بمبلغ {$amountFormatted} د.ع{$reasonStr}"
        );

        return back()->with('success', 'تمت إضافة المصروف بنجاح.');
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
            'date' => 'required|date',
        ]);

        $expense->update($validated);

        $amountFormatted = number_format($expense->amount);
        ActivityLog::log(
            "تعديل مصروف",
            "تم تعديل المصروف رقم #{$expense->id} بمبلغ {$amountFormatted} د.ع"
        );

        return back()->with('success', 'تم تعديل المصروف بنجاح.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $id = $expense->id;
        $amountFormatted = number_format($expense->amount);

        $expense->delete();

        ActivityLog::log(
            "حذف مصروف",
            "تم حذف المصروف رقم #{$id} البالغ {$amountFormatted} د.ع"
        );

        return back()->with('success', 'تم حذف المصروف بنجاح.');
    }
}
