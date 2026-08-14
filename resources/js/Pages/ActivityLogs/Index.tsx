import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Search } from 'lucide-react';

interface ActivityItem {
    id: number;
    user_name: string;
    user_role: string;
    action: string;
    description?: string;
    ip_address?: string;
    created_at: string;
}

interface ActivityLogsPageProps {
    logs: {
        data: ActivityItem[];
        links: any[];
        total: number;
    };
    filters: { search?: string; date?: string };
}

export default function ActivityLogsIndex({ logs, filters }: ActivityLogsPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    const handleFilter = () => {
        router.get(route('activity-logs.index'), { search, date }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setDate('');
        router.get(route('activity-logs.index'), {}, { preserveState: true });
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
        <MainLayout title="سجل النشاطات">
            <Head title="سجل النشاطات - رحلات" />

            <div className="space-y-6" dir="rtl">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <History className="size-6" />
                        سجل النشاطات
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        تتبع كافة إجراءات المستخدمين — دخول، خروج، إضافة، وتعديل · {logs.total} سجل
                    </p>
                </div>

                {/* Filter Bar */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="البحث في الإجراءات أو الوصف أو اسم المستخدم..."
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

                {/* Logs Table */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right w-16">#</TableHead>
                                <TableHead className="text-right">المستخدم</TableHead>
                                <TableHead className="text-right">الإجراء</TableHead>
                                <TableHead className="text-right">التفاصيل</TableHead>
                                <TableHead className="text-right">عنوان IP</TableHead>
                                <TableHead className="text-right">التاريخ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        لا توجد نشاطات مسجلة
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-muted-foreground tabular-nums text-xs">
                                            #{item.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{item.user_name}</span>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {item.user_role === 'admin' ? 'أدمن' : 'موظف'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs font-medium">
                                                {item.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.description || '—'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {item.ip_address || '—'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(item.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))
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
