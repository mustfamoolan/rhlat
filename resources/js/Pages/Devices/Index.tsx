import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Cpu, Plus, Minus, Settings2, Shield, User, History, ArrowRightLeft } from 'lucide-react';
import { PageProps } from '@/types';

interface DeviceLogItem {
    id: number;
    type: 'loaded_trip' | 'empty_trip' | 'manual_adjustment';
    amount: number;
    previous_count: number;
    current_count: number;
    notes?: string;
    created_at: string;
    user?: { name: string; role: string };
    trip?: { id: number; type: 'loaded' | 'empty'; price: number };
}

interface DevicesPageProps {
    logs: {
        data: DeviceLogItem[];
        links: any[];
        total: number;
    };
    currentCount: number;
    filters: { type?: string };
}

export default function DevicesIndex({ logs, currentCount, filters }: DevicesPageProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
    const [filterType, setFilterType] = useState(filters.type || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        notes: '',
    });

    const handleAdjustmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('devices.store'), {
            onSuccess: () => {
                reset();
                setAdjustmentModalOpen(false);
            },
        });
    };

    const handleFilter = (type: string) => {
        setFilterType(type);
        router.get(route('devices.index'), type ? { type } : {}, { preserveState: true });
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('ar-IQ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <MainLayout title="تتبع الأجهزة">
            <Head title="تتبع الأجهزة - رحلات" />

            {/* Manual Adjustment Dialog */}
            <Dialog open={adjustmentModalOpen} onOpenChange={setAdjustmentModalOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings2 className="size-5 text-primary" />
                            تعديل مخزون الأجهزة يدوياً
                        </DialogTitle>
                        <DialogDescription>
                            قم بزيادة أو إنقاص عدد الأجهزة في المخزن يدوياً للجرد والتسويات.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">مقدار التعديل (أرقام فقط)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="أدخل مثلاً: 10 للزيادة، أو -5 للنقصان"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="font-mono text-left"
                                dir="ltr"
                                required
                            />
                            {errors.amount && (
                                <p className="text-sm text-destructive">{errors.amount}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">سبب التعديل والملاحظات</Label>
                            <textarea
                                id="notes"
                                rows={3}
                                placeholder="مثال: جرد يدوي للمخزن، إضافة دفعة أجهزة جديدة..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            {errors.notes && (
                                <p className="text-sm text-destructive">{errors.notes}</p>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setAdjustmentModalOpen(false)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'جاري الحفظ...' : 'حفظ التعديل'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="space-y-6" dir="rtl">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Cpu className="size-6 text-primary animate-pulse" />
                            تتبع رصيد الأجهزة
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            تتبع آلي لزيادة الأجهزة مع الرحلات المحملة ونقصانها مع الرحلات الفارغة
                        </p>
                    </div>

                    {userRole === 'admin' && (
                        <Button className="gap-2" onClick={() => setAdjustmentModalOpen(true)}>
                            <Settings2 className="size-4" />
                            تعديل الجرد يدويًا
                        </Button>
                    )}
                </div>

                {/* Dashboard Count Card */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-1 border-primary/20 bg-primary/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-primary">رصيد الأجهزة الحالي</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold text-foreground tabular-nums">{currentCount}</span>
                                <span className="text-xs text-muted-foreground">جهاز مسجل في المخزن</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">تصفية حسب:</span>
                    <div className="flex gap-1.5">
                        <Button
                            variant={filterType === '' ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs h-7 px-3"
                            onClick={() => handleFilter('')}
                        >
                            الكل
                        </Button>
                        <Button
                            variant={filterType === 'loaded_trip' ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs h-7 px-3"
                            onClick={() => handleFilter('loaded_trip')}
                        >
                            رحلات محملة
                        </Button>
                        <Button
                            variant={filterType === 'empty_trip' ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs h-7 px-3"
                            onClick={() => handleFilter('empty_trip')}
                        >
                            رحلات فارغة
                        </Button>
                        <Button
                            variant={filterType === 'manual_adjustment' ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs h-7 px-3"
                            onClick={() => handleFilter('manual_adjustment')}
                        >
                            تعديل يدوي
                        </Button>
                    </div>
                </div>

                {/* Data Grid Table */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right w-16">#</TableHead>
                                <TableHead className="text-right">التاريخ والوقت</TableHead>
                                <TableHead className="text-right">نوع الحركة</TableHead>
                                <TableHead className="text-right">الملاحظات والتفاصيل</TableHead>
                                <TableHead className="text-center w-24">معدل التغيير</TableHead>
                                <TableHead className="text-center w-28">الأجهزة السابقة</TableHead>
                                <TableHead className="text-center w-28">الأجهزة الحالية</TableHead>
                                <TableHead className="text-right">بواسطة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                        لا توجد حركات مسجلة حالياً
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((item) => {
                                    let typeBadge = null;
                                    if (item.type === 'loaded_trip') {
                                        typeBadge = <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">رحلة محملة</Badge>;
                                    } else if (item.type === 'empty_trip') {
                                        typeBadge = <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">رحلة فارغة</Badge>;
                                    } else {
                                        typeBadge = <Badge variant="default">تعديل يدوي</Badge>;
                                    }

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-muted-foreground tabular-nums text-xs">
                                                #{item.id}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(item.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                {typeBadge}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                                {item.notes || '—'}
                                            </TableCell>
                                            <TableCell className="text-center font-bold tabular-nums">
                                                {item.amount >= 0 ? (
                                                    <span className="text-emerald-600">+{item.amount}</span>
                                                ) : (
                                                    <span className="text-red-600">{item.amount}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center font-mono tabular-nums text-muted-foreground">
                                                {item.previous_count}
                                            </TableCell>
                                            <TableCell className="text-center font-mono tabular-nums font-semibold text-foreground bg-secondary/20">
                                                {item.current_count}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {item.user ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{item.user.name}</span>
                                                        <span className="text-[9px] text-muted-foreground">({item.user.role === 'admin' ? 'أدمن' : 'موظف'})</span>
                                                    </div>
                                                ) : '—'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Pagination */}
                {logs.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1">
                        {logs.links.map((link: any, i: number) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className="h-8 min-w-8 text-xs"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
