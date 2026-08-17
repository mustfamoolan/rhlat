<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Ensure only admin can manage users
     */
    private function authorizeAdmin(): void
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'غير مصرح لك بالوصول لإدارة المستخدمين.');
        }
    }

    public function index(Request $request): Response
    {
        $this->authorizeAdmin();

        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,employee',
            'can_delete_trips' => 'nullable|boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'can_delete_trips' => $request->boolean('can_delete_trips'),
        ]);

        $roleLabel = $user->role === 'admin' ? 'أدمن' : 'موظف';
        $permissionLabel = $user->can_delete_trips ? ' (مع صلاحية حذف الرحلات)' : '';
        ActivityLog::log(
            "إضافة مستخدم جديد",
            "تم إنشاء حساب جديد للـ {$roleLabel}: {$user->name} ({$user->email}){$permissionLabel}"
        );

        return back()->with('success', 'تم إنشاء حساب المستخدم بنجاح.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:admin,employee',
            'can_delete_trips' => 'nullable|boolean',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'can_delete_trips' => $request->boolean('can_delete_trips'),
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        $roleLabel = $user->role === 'admin' ? 'أدمن' : 'موظف';
        $permissionLabel = $user->can_delete_trips ? ' (مع صلاحية حذف الرحلات)' : ' (بدون صلاحية حذف الرحلات)';
        ActivityLog::log(
            "تعديل حساب مستخدم",
            "تم تحديث بيانات حساب {$roleLabel}: {$user->name} ({$user->email}){$permissionLabel}"
        );

        return back()->with('success', 'تم تعديل بيانات المستخدم بنجاح.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorizeAdmin();

        if ($user->id === Auth::id()) {
            return back()->withErrors(['error' => 'لا يمكنك حذف حسابك الشخصي الحالي.']);
        }

        $userName = $user->name;
        $userEmail = $user->email;
        $userRole = $user->role === 'admin' ? 'أدمن' : 'موظف';

        $user->delete();

        ActivityLog::log(
            "حذف مستخدم",
            "تم حذف حساب {$userRole}: {$userName} ({$userEmail})"
        );

        return back()->with('success', 'تم حذف المستخدم بنجاح.');
    }
}
