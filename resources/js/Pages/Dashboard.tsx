import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    PackageCheck,
    Truck,
    Receipt,
    Wallet,
    Calendar,
    History,
    ArrowRight,
    RotateCcw,
    Filter,
    FileText,
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
    isCustomRange: boolean;
    fromDate: string;
    toDate: string;
    currentBaghdadTime: string;
    recentTrips: Array<{
        id: number;
        type: 'loaded' | 'empty';
        price: number;
        date: string;
        notes?: string;
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

export default function Dashboard({
    stats,
    isCustomRange,
    fromDate,
    toDate,
    recentTrips,
    recentActivities,
}: StatProps) {
    const [from, setFrom] = useState(fromDate || '');
    const [to, setTo] = useState(toDate || '');

    // Real-time live polling: Auto-refresh data every 4 seconds silently
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['stats', 'recentTrips', 'recentActivities'],
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleFetchReport = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!from || !to) return;
        router.get(
            route('dashboard'),
            { from_date: from, to_date: to },
            { preserveState: true }
        );
    };

    const handleResetToToday = () => {
        setFrom('');
        setTo('');
        router.get(route('dashboard'), {}, { preserveState: true });
    };

    const formatIQD = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ').format(amount) + ' د.ع';
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'م' : 'ص';
        const formattedHours = hours % 12 || 12;
        return `${year}/${month}/${day} ${formattedHours}:${minutes} ${ampm}`;
    };

    const pdfUrl = route('reports.pdf', isCustomRange ? { from_date: from, to_date: to } : {});

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

                    {isCustomRange && (
                        <Badge variant="default" className="w-fit py-1 px-3 text-xs gap-1.5">
                            <span>تقرير الفترة من</span>
                            <span dir="ltr" className="font-mono font-bold">{fromDate}</span>
                            <span>إلى</span>
                            <span dir="ltr" className="font-mono font-bold">{toDate}</span>
                        </Badge>
                    )}
                </div>

                {/* Date Range Report Filter Bar */}
                <Card>
                    <CardContent className="pt-4">
                        <form onSubmit={handleFetchReport} className="flex flex-col sm:flex-row items-end gap-3">
                            <div className="space-y-1.5 flex-1 w-full">
                                <label className="text-xs font-semibold text-muted-foreground">من تاريخ</label>
                                <Input
                                    type="date"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="w-full font-mono text-sm"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-1.5 flex-1 w-full">
                                <label className="text-xs font-semibold text-muted-foreground">إلى تاريخ</label>
                                <Input
                                    type="date"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="w-full font-mono text-sm"
                                    dir="ltr"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <Button type="submit" className="gap-2 flex-1 sm:flex-initial">
                                    <Filter className="size-4" />
                                    جلب التقرير
                                </Button>

                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 text-sm font-medium transition-colors border border-input shadow-sm flex-1 sm:flex-initial"
                                >
                                    <FileText className="size-4" />
                                    تحميل تقرير PDF
                                </a>

                                {isCustomRange && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleResetToToday}
                                        className="gap-2 flex-1 sm:flex-initial text-xs"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        إلغاء التصفية
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

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
                            <div className="text-2xl font-bold">{formatIQD(stats.loadedRevenue)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.loadedCount} رحلة محملة
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
                    {/* Recent Trips */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="text-base">أحدث الرحلات</CardTitle>
                            <CardDescription>
                                {isCustomRange ? `رحلات الفترة المحددة` : `أحدث الرحلات المسجلة`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentTrips.length === 0 ? (
                                <p className="text-center py-6 text-sm text-muted-foreground">
                                    لا توجد رحلات مسجلة في هذه الفترة
                                </p>
                            ) : (
                                recentTrips.map((t, i) => (
                                    <div key={t.id}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                                                    t.type === 'loaded' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                    {t.type === 'loaded'
                                                        ? <PackageCheck className="size-4" />
                                                        : <Truck className="size-4" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium leading-none">
                                                        {t.type === 'loaded' ? 'رحلة محملة' : 'رحلة فارغة'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {t.user.name} · <span dir="ltr" className="font-mono">{formatDate(t.date)}</span>
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

                    {/* Activity Log */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base">سجل النشاطات</CardTitle>
                            <CardDescription>آخر الإجراءات والعمليات في النظام</CardDescription>
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
                                                {act.user_name} · <span dir="ltr" className="font-mono">{formatDate(act.created_at)}</span>
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
