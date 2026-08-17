import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
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
import { CreateModal } from '@/components/Trips/CreateModal';
import { Truck, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { PageProps } from '@/types';

interface TripItem {
    id: number;
    type: 'loaded' | 'empty';
    price: number;
    date: string;
    notes?: string;
    user: { id: number; name: string; role: string };
}

interface EmptyPageProps {
    trips: {
        data: TripItem[];
        links: any[];
        total: number;
    };
    totalSum: number;
    filters: { search?: string; date?: string };
}

export default function EmptyTrips({ trips, totalSum, filters }: EmptyPageProps) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;
    const canDelete = currentUser.role === 'admin' || !!currentUser.can_delete_trips;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editTrip, setEditTrip] = useState<TripItem | null>(null);
    const [deleteTripId, setDeleteTripId] = useState<number | null>(null);

    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    const { data: editData, setData: setEditData, put, processing } = useForm({
        type: 'empty',
        price: 10000,
        date: '',
        notes: '',
    });

    const handleFilter = () => {
        router.get(route('trips.empty'), { search, date }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setDate('');
        router.get(route('trips.empty'), {}, { preserveState: true });
    };

    const openEditDialog = (trip: TripItem) => {
        setEditTrip(trip);
        setEditData({
            type: 'empty',
            price: trip.price,
            date: new Date(trip.date).toISOString().slice(0, 16),
            notes: trip.notes || '',
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTrip) return;
        put(route('trips.update', editTrip.id), {
            onSuccess: () => setEditTrip(null),
        });
    };

    const handleDelete = () => {
        if (!deleteTripId) return;
        router.delete(route('trips.destroy', deleteTripId), {
            onSuccess: () => setDeleteTripId(null),
        });
    };

    const formatIQD = (amount: number) =>
        new Intl.NumberFormat('ar-IQ').format(amount) + ' د.ع';

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('ar-IQ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <MainLayout title="الرحلات الفارغة">
            <Head title="الرحلات الفارغة - رحلات" />

            <CreateModal open={createModalOpen} onOpenChange={setCreateModalOpen} defaultType="empty" />

            {/* Edit Dialog */}
            <Dialog open={!!editTrip} onOpenChange={(open) => !open && setEditTrip(null)}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل الرحلة الفارغة #{editTrip?.id}</DialogTitle>
                        <DialogDescription>تعديل السعر أو التاريخ أو الملاحظات</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>السعر (دينار عراقي)</Label>
                            <Input
                                type="number"
                                value={editData.price}
                                onChange={(e) => setEditData('price', parseInt(e.target.value) || 0)}
                                className="tabular-nums"
                                dir="ltr"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>تاريخ الرحلة</Label>
                            <Input
                                type="datetime-local"
                                value={editData.date}
                                onChange={(e) => setEditData('date', e.target.value)}
                                dir="ltr"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ملاحظات</Label>
                            <textarea
                                rows={3}
                                value={editData.notes}
                                onChange={(e) => setEditData('notes', e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditTrip(null)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={processing}>
                                حفظ التعديلات
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteTripId} onOpenChange={(open) => !open && setDeleteTripId(null)}>
                <DialogContent className="sm:max-w-sm" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من حذف الرحلة رقم #{deleteTripId}؟ لا يمكن التراجع عن هذا الإجراء.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteTripId(null)}>
                            إلغاء
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            تأكيد الحذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-6" dir="rtl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Truck className="size-6 text-orange-600" />
                            الرحلات الفارغة
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            إجمالي الإيراد:{' '}
                            <span className="font-semibold text-foreground">{formatIQD(totalSum)}</span>
                            {' · '}
                            {trips.total} رحلة
                        </p>
                    </div>
                    <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
                        <Plus className="size-4" />
                        رحلة فارغة جديدة
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="البحث في الملاحظات..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pr-9"
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="sm:w-44"
                                dir="ltr"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleFilter} variant="secondary">فلترة</Button>
                                <Button onClick={handleResetFilter} variant="outline">إعادة ضبط</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right w-16">#</TableHead>
                                <TableHead className="text-right">المستخدم</TableHead>
                                <TableHead className="text-right">السعر</TableHead>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">الملاحظات</TableHead>
                                <TableHead className="text-center w-24">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trips.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        لا توجد رحلات فارغة
                                    </TableCell>
                                </TableRow>
                            ) : (
                                trips.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-muted-foreground tabular-nums text-xs">
                                            #{item.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{item.user.name}</span>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {item.user.role === 'admin' ? 'أدمن' : 'موظف'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="tabular-nums font-medium">
                                            {formatIQD(item.price)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(item.date)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                            {item.notes || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => openEditDialog(item)}
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                {canDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteTripId(item.id)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {trips.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1">
                        {trips.links.map((link: any, i: number) => (
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
