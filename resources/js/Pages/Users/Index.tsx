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
import { Users, Search, Plus, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { PageProps } from '@/types';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'employee';
    created_at: string;
}

interface UsersPageProps {
    users: {
        data: UserItem[];
        links: any[];
        total: number;
    };
    filters: { search?: string; role?: string };
}

export default function UsersIndex({ users, filters }: UsersPageProps) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserItem | null>(null);
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');

    // Form for creating a new user
    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreate,
    } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'employee' as 'admin' | 'employee',
    });

    // Form for editing an existing user
    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'employee' as 'admin' | 'employee',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(route('users.store'), {
            onSuccess: () => {
                resetCreate();
                setCreateModalOpen(false);
            },
        });
    };

    const openEditDialog = (user: UserItem) => {
        setEditUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;
        putEdit(route('users.update', editUser.id), {
            onSuccess: () => {
                resetEdit();
                setEditUser(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteUserId) return;
        router.delete(route('users.destroy', deleteUserId), {
            onSuccess: () => setDeleteUserId(null),
        });
    };

    const handleFilter = () => {
        router.get(route('users.index'), { search, role }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setRole('');
        router.get(route('users.index'), {}, { preserveState: true });
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('ar-IQ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    return (
        <MainLayout title="إدارة المستخدمين">
            <Head title="إدارة المستخدمين - رحلات" />

            {/* Create User Dialog */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="size-5" />
                            إضافة مستخدم جديد
                        </DialogTitle>
                        <DialogDescription>
                            أدخل بيانات الحساب الجديد (اسم، بريد إلكتروني، كلمة مرور، ودور المستخدم)
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">اسم المستخدم</Label>
                            <Input
                                id="name"
                                placeholder="مثال: أحمد علي"
                                value={createData.name}
                                onChange={(e) => setCreateData('name', e.target.value)}
                                required
                            />
                            {createErrors.name && (
                                <p className="text-sm text-destructive">{createErrors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@domain.com"
                                value={createData.email}
                                onChange={(e) => setCreateData('email', e.target.value)}
                                dir="ltr"
                                required
                            />
                            {createErrors.email && (
                                <p className="text-sm text-destructive">{createErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={createData.password}
                                onChange={(e) => setCreateData('password', e.target.value)}
                                dir="ltr"
                                required
                            />
                            {createErrors.password && (
                                <p className="text-sm text-destructive">{createErrors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>الدور والصلاحيات</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateData('role', 'employee')}
                                    className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                                        createData.role === 'employee'
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input bg-background hover:bg-accent'
                                    }`}
                                >
                                    <UserIcon className="size-4" />
                                    موظف
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCreateData('role', 'admin')}
                                    className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                                        createData.role === 'admin'
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input bg-background hover:bg-accent'
                                    }`}
                                >
                                    <Shield className="size-4" />
                                    أدمن
                                </button>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={createProcessing}>
                                {createProcessing ? 'جاري الحفظ...' : 'إنشاء الحساب'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل بيانات المستخدم #{editUser?.id}</DialogTitle>
                        <DialogDescription>
                            تعديل الاسم والبريد والدور (اترك كلمة المرور فارغة إذا لم ترفع في تغييرها)
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>الاسم الكامل</Label>
                            <Input
                                value={editData.name}
                                onChange={(e) => setEditData('name', e.target.value)}
                                required
                            />
                            {editErrors.name && (
                                <p className="text-sm text-destructive">{editErrors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>البريد الإلكتروني</Label>
                            <Input
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData('email', e.target.value)}
                                dir="ltr"
                                required
                            />
                            {editErrors.email && (
                                <p className="text-sm text-destructive">{editErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>كلمة المرور الجديدة (اختياري)</Label>
                            <Input
                                type="password"
                                placeholder="اتركها فارغة للإبقاء على الحالية"
                                value={editData.password}
                                onChange={(e) => setEditData('password', e.target.value)}
                                dir="ltr"
                            />
                            {editErrors.password && (
                                <p className="text-sm text-destructive">{editErrors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>الدور وصلاحيات الوصول</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditData('role', 'employee')}
                                    className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                                        editData.role === 'employee'
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input bg-background hover:bg-accent'
                                    }`}
                                >
                                    <UserIcon className="size-4" />
                                    موظف
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditData('role', 'admin')}
                                    className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                                        editData.role === 'admin'
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input bg-background hover:bg-accent'
                                    }`}
                                >
                                    <Shield className="size-4" />
                                    أدمن
                                </button>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={editProcessing}>
                                حفظ التعديلات
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
                <DialogContent className="sm:max-w-sm" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تأكيد حذف الحساب</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteUserId(null)}>
                            إلغاء
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            تأكيد الحذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-6" dir="rtl">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Users className="size-6" />
                            إدارة المستخدمين
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            إدارة وإضافة وتعديل حسابات الموظفين والمدراء · {users.total} حساب مسجل
                        </p>
                    </div>
                    <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
                        <Plus className="size-4" />
                        مستخدم جديد
                    </Button>
                </div>

                {/* Filter Bar */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="البحث باسم المستخدم أو البريد..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pr-9"
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-44"
                            >
                                <option value="">جميع الأدوار</option>
                                <option value="admin">أدمن</option>
                                <option value="employee">موظف</option>
                            </select>
                            <div className="flex gap-2">
                                <Button onClick={handleFilter} variant="secondary">
                                    فلترة
                                </Button>
                                <Button onClick={handleResetFilter} variant="outline">
                                    إعادة ضبط
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right w-16">#</TableHead>
                                <TableHead className="text-right">الاسم</TableHead>
                                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                                <TableHead className="text-right">الدور</TableHead>
                                <TableHead className="text-right">تاريخ التسجيل</TableHead>
                                <TableHead className="text-center w-24">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        لا يوجد مستخدمين مطابقين
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-muted-foreground tabular-nums text-xs">
                                            #{item.id}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {item.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={item.role === 'admin' ? 'default' : 'secondary'}
                                                className="text-[11px]"
                                            >
                                                {item.role === 'admin' ? (
                                                    <span className="flex items-center gap-1">
                                                        <Shield className="size-3" /> أدمن
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <UserIcon className="size-3" /> موظف
                                                    </span>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(item.created_at)}
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
                                                {item.id !== currentUser.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteUserId(item.id)}
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

                {/* Pagination */}
                {users.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1">
                        {users.links.map((link: any, i: number) => (
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
