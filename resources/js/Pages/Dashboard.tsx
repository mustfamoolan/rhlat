import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    PackageCheck,
    Truck,
    Receipt,
    Wallet,
    TrendingUp,
    Calendar,
    History,
    ArrowRight,
} from 'lucide-react';

interface StatProps {
    stats: {
        totalTrips: number;
        loadedCount: number;
        emptyCount: number;
        loadedRevenue: number;
        emptyRevenue: number;
        totalRevenue: number;
        totalExpenses: number;
        netIncome: number;
    };
    filter: string;
    recentTrips: Array<{
        id: number;
        type: 'loaded' | 'empty';
        price: number;
        date: string;
        notes?: string;
        user: { name: string; role: string };
    }>;
    recentExpenses: Array<{
        id: number;
        amount: number;
        reason?: string;
        date: string;
        user: { name: string; role: string };
    }>;
    recentActivities: Array<{
        id: number;
        user_name: string;
        user_role: string;
        action: string;
        description?: string;
        created_at: string;
    }>;
}

export default function Dashboard({ stats, filter, recentTrips, recentExpenses, recentActivities }: StatProps) {
    const handleFilterChange = (newFilter: string) => {
        router.get(route('dashboard'), { filter: newFilter }, { preserveState: true });
    };

    const formatIQD = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ').format(amount) + ' د.ع';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-IQ', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filters = [
        { key: 'today', label: 'اليوم' },
        { key: 'week', label: 'هذا الأسبوع' },
        { key: 'month', label: 'هذا الشهر' },
        { key: 'all', label: 'الكل' },
    ];

    return (
        <MainLayout title="الداشبورد">
            <Head title="الداشبورد - رحلات" />

            <div className="space-y-6" dir="rtl">
                {/* Page Heading */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">الداشبورد</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            ملخص الحركات والإيرادات والمصروفات
                        </p>
                    </div>

                    {/* Period Filter */}
                    <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                        {filters.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => handleFilterChange(f.key)}
                                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                    filter === f.key
                                        ? 'bg-background text-foreground shadow'
                                        : 'hover:text-foreground'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي الرحلات</CardTitle>
                            <Calendar className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTrips}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.loadedCount} محملة · {stats.emptyCount} فارغة
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">إيرادات المحملة</CardTitle>
                            <PackageCheck className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.loadedCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatIQD(stats.loadedRevenue)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                            <Receipt className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                                {formatIQD(stats.totalExpenses)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                مصاريف التشغيل
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">صافي الأرباح</CardTitle>
                            <Wallet className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                {formatIQD(stats.netIncome)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                الإيرادات ناقصاً المصاريف
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Trips — wide card */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="text-base">أحدث الرحلات</CardTitle>
                            <CardDescription>آخر 5 رحلات تم تسجيلها</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentTrips.length === 0 ? (
                                <p className="text-center py-6 text-sm text-muted-foreground">
                                    لا توجد رحلات في هذه الفترة
                                </p>
                            ) : (
                                recentTrips.map((t, i) => (
                                    <div key={t.id}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                                                    t.type === 'loaded' ? 'bg-blue-50' : 'bg-orange-50'
                                                }`}>
                                                    {t.type === 'loaded'
                                                        ? <PackageCheck className="size-4 text-blue-600" />
                                                        : <Truck className="size-4 text-orange-600" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium leading-none">
                                                        {t.type === 'loaded' ? 'رحلة محملة' : 'رحلة فارغة'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {t.user.name} · {formatDate(t.date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold tabular-nums">
                                                {formatIQD(t.price)}
                                            </div>
                                        </div>
                                        {i < recentTrips.length - 1 && <Separator className="mt-3" />}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Log — narrow card */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base">سجل النشاطات</CardTitle>
                            <CardDescription>آخر عمليات الدخول والتسجيل</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentActivities.length === 0 ? (
                                <p className="text-center py-6 text-sm text-muted-foreground">
                                    لا توجد نشاطات مسجلة
                                </p>
                            ) : (
                                recentActivities.map((act) => (
                                    <div key={act.id} className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                            <History className="size-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 space-y-0.5">
                                            <p className="text-sm font-medium leading-none">{act.action}</p>
                                            {act.description && (
                                                <p className="text-xs text-muted-foreground">{act.description}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {act.user_name} · {formatDate(act.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                        <CardFooter className="pt-0">
                            <a
                                href={route('activity-logs.index')}
                                className="inline-flex items-center justify-center gap-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                            >
                                عرض كل النشاطات
                                <ArrowRight className="size-3 rotate-180" />
                            </a>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
