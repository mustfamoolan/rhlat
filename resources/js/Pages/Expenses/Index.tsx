import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
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
import { Receipt, Search, Plus, Edit, Trash2 } from 'lucide-react';

interface ExpenseItem {
    id: number;
    amount: number;
    reason?: string;
    date: string;
    user: { id: number; name: string; role: string };
}

interface ExpensesPageProps {
    expenses: {
        data: ExpenseItem[];
        links: any[];
        total: number;
    };
    totalSum: number;
    filters: { search?: string; date?: string };
}

export default function ExpensesIndex({ expenses, totalSum, filters }: ExpensesPageProps) {
    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editExpense, setEditExpense] = useState<ExpenseItem | null>(null);
    const [deleteExpenseId, setDeleteExpenseId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreate,
    } = useForm({
        amount: 0,
        reason: '',
        date: getCurrentDateTime(),
    });

    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
    } = useForm({
        amount: 0,
        reason: '',
        date: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(route('expenses.store'), {
            onSuccess: () => {
                resetCreate();
                setCreateModalOpen(false);
            },
        });
    };

    const openEditDialog = (item: ExpenseItem) => {
        setEditExpense(item);
        setEditData({
            amount: item.amount,
            reason: item.reason || '',
            date: new Date(item.date).toISOString().slice(0, 16),
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editExpense) return;
        putEdit(route('expenses.update', editExpense.id), {
            onSuccess: () => setEditExpense(null),
        });
    };

    const handleDelete = () => {
        if (!deleteExpenseId) return;
        router.delete(route('expenses.destroy', deleteExpenseId), {
            onSuccess: () => setDeleteExpenseId(null),
        });
    };

    const handleFilter = () => {
        router.get(route('expenses.index'), { search, date }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setDate('');
        router.get(route('expenses.index'), {}, { preserveState: true });
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
        <MainLayout title="المصروفات">
            <Head title="المصروفات - رحلات" />

            {/* Create Expense Dialog */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="size-5" />
                            إضافة مصروف جديد
                        </DialogTitle>
                        <DialogDescription>
                            أدخل مبلغ المصروف بالدينار العراقي (السبب اختياري)
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>المبلغ (دينار عراقي)</Label>
                            <Input
                                type="number"
                                step="1"
                                min="1"
                                value={createData.amount || ''}
                                placeholder="أدخل المبلغ..."
                                onChange={(e) => setCreateData('amount', parseInt(e.target.value) || 0)}
                                className="tabular-nums"
                                dir="ltr"
                                required
                            />
                            {createErrors.amount && (
                                <p className="text-sm text-destructive">{createErrors.amount}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>السبب (اختياري)</Label>
                            <Input
                                placeholder="مثال: وقود، صيانة، رسوم طريق..."
                                value={createData.reason}
                                onChange={(e) => setCreateData('reason', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>التاريخ والوقت</Label>
                            <Input
                                type="datetime-local"
                                value={createData.date}
                                onChange={(e) => setCreateData('date', e.target.value)}
                                dir="ltr"
                                required
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={createProcessing}>
                                {createProcessing ? 'جاري الحفظ...' : 'حفظ المصروف'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Expense Dialog */}
            <Dialog open={!!editExpense} onOpenChange={(open) => !open && setEditExpense(null)}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل المصروف #{editExpense?.id}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>المبلغ (دينار عراقي)</Label>
                            <Input
                                type="number"
                                value={editData.amount}
                                onChange={(e) => setEditData('amount', parseInt(e.target.value) || 0)}
                                className="tabular-nums"
                                dir="ltr"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>السبب (اختياري)</Label>
                            <Input
                                value={editData.reason}
                                onChange={(e) => setEditData('reason', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>التاريخ والوقت</Label>
                            <Input
                                type="datetime-local"
                                value={editData.date}
                                onChange={(e) => setEditData('date', e.target.value)}
                                dir="ltr"
                                required
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditExpense(null)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={editProcessing}>
                                تحديث المصروف
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteExpenseId} onOpenChange={(open) => !open && setDeleteExpenseId(null)}>
                <DialogContent className="sm:max-w-sm" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من حذف المصروف رقم #{deleteExpenseId}؟
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteExpenseId(null)}>إلغاء</Button>
                        <Button variant="destructive" onClick={handleDelete}>تأكيد الحذف</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-6" dir="rtl">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Receipt className="size-6" />
                            المصروفات
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            إجمالي المصروفات:{' '}
                            <span className="font-semibold text-foreground">{formatIQD(totalSum)}</span>
                            {' · '}
                            {expenses.total} سجل
                        </p>
                    </div>
                    <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
                        <Plus className="size-4" />
                        إضافة مصروف
                    </Button>
                </div>

                {/* Filter Bar */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="البحث في الأسباب..."
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

                {/* Table */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right w-16">#</TableHead>
                                <TableHead className="text-right">المستخدم</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-right">السبب</TableHead>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-center w-24">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        لا توجد مصروفات مسجلة
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expenses.data.map((item) => (
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
                                        <TableCell className="tabular-nums font-medium text-destructive">
                                            {formatIQD(item.amount)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.reason || <span className="italic">—</span>}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(item.date)}
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteExpenseId(item.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {expenses.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1">
                        {expenses.links.map((link: any, i: number) => (
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
