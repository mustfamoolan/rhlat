import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackageCheck, Truck, PlusCircle, Layers } from 'lucide-react';

interface CreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultType?: 'loaded' | 'empty';
}

export function CreateModal({ open, onOpenChange, defaultType = 'loaded' }: CreateModalProps) {
    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        type: defaultType,
        price: defaultType === 'loaded' ? 30000 : 10000,
        count: 1,
        date: getCurrentDateTime(),
        notes: '',
    });

    useEffect(() => {
        if (open) {
            setData({
                type: defaultType,
                price: defaultType === 'loaded' ? 30000 : 10000,
                count: 1,
                date: getCurrentDateTime(),
                notes: '',
            });
        }
    }, [open, defaultType]);

    const handleTypeChange = (newType: 'loaded' | 'empty') => {
        setData((prev) => ({
            ...prev,
            type: newType,
            price: newType === 'loaded' ? 30000 : 10000,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('trips.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    const formatIQD = (n: number) => new Intl.NumberFormat('ar-IQ').format(n) + ' د.ع';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PlusCircle className="size-5" />
                        إدخال رحلات جديدة
                    </DialogTitle>
                    <DialogDescription>
                        أدخل تفاصيل الرحلة أو يمكنك إضافة دفعة كاملة (5، 10، 15، 20 رحلة) مرة واحدة
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* Trip Type */}
                    <div className="space-y-2">
                        <Label>نوع الرحلة</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleTypeChange('loaded')}
                                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                                    data.type === 'loaded'
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                <PackageCheck className="size-4" />
                                محملة (30,000 د.ع)
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeChange('empty')}
                                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                                    data.type === 'empty'
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                <Truck className="size-4" />
                                فارغة (10,000 د.ع)
                            </button>
                        </div>
                    </div>

                    {/* Batch Count (عدد الرحلات دفعة واحدة) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="count" className="flex items-center gap-1.5">
                                <Layers className="size-4 text-muted-foreground" />
                                عدد الرحلات (دفعة واحدة)
                            </Label>
                            <span className="text-xs font-semibold text-muted-foreground">
                                الإجمالي: {formatIQD(data.price * (data.count || 1))}
                            </span>
                        </div>

                        {/* Quick Presets for Count */}
                        <div className="flex gap-1.5">
                            {[1, 5, 10, 15, 20].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setData('count', num)}
                                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold border transition-all ${
                                        data.count === num
                                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                            : 'border-input bg-background hover:bg-accent text-foreground'
                                    }`}
                                >
                                    {num === 1 ? 'واحدة' : `${num} رحلات`}
                                </button>
                            ))}
                        </div>

                        <Input
                            id="count"
                            type="number"
                            min="1"
                            max="50"
                            value={data.count}
                            onChange={(e) => setData('count', Math.max(1, parseInt(e.target.value) || 1))}
                            className="tabular-nums"
                            dir="ltr"
                            required
                        />
                        {errors.count && <p className="text-sm text-destructive">{errors.count}</p>}
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <Label htmlFor="price">سعر الرحلة الواحدة (دينار عراقي)</Label>
                        <div className="relative">
                            <Input
                                id="price"
                                type="number"
                                step="1"
                                min="0"
                                value={data.price}
                                onChange={(e) => setData('price', parseInt(e.target.value) || 0)}
                                className="tabular-nums"
                                dir="ltr"
                                required
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                د.ع
                            </span>
                        </div>
                        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">تاريخ ووقت الرحلة</Label>
                        <Input
                            id="date"
                            type="datetime-local"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            dir="ltr"
                            required
                        />
                        {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                        <textarea
                            id="notes"
                            rows={2}
                            placeholder="أي تفاصيل إضافية..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'جاري الحفظ...'
                                : data.count > 1
                                ? `حفظ ${data.count} رحلات (${formatIQD(data.price * data.count)})`
                                : 'حفظ الرحلة'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
