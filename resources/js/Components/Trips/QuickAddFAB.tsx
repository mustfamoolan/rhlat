import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { PackageCheck, Truck, Plus, X, Check, FileText } from 'lucide-react';

type TripType = 'loaded' | 'empty';

interface QuickAddFABProps {
    onSuccess?: () => void;
}

export function QuickAddFAB({ onSuccess }: QuickAddFABProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'select' | 'confirm'>('select');
    const [selectedType, setSelectedType] = useState<TripType>('loaded');
    const [showNotes, setShowNotes] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        type: 'loaded' as TripType,
        price: 30000,
        date: '',
        notes: '',
    });

    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const handleSelectType = (type: TripType) => {
        setSelectedType(type);
        setData({
            type,
            price: type === 'loaded' ? 30000 : 10000,
            date: getCurrentDateTime(),
            notes: '',
        });
        setStep('confirm');
    };

    const handleSubmit = () => {
        post(route('trips.store'), {
            onSuccess: () => {
                reset();
                setIsOpen(false);
                setStep('select');
                setShowNotes(false);
                onSuccess?.();
            },
        });
    };

    const handleClose = () => {
        setIsOpen(false);
        setStep('select');
        setShowNotes(false);
        reset();
    };

    const formatIQD = (n: number) => new Intl.NumberFormat('ar-IQ').format(n) + ' د.ع';

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={handleClose}
                />
            )}

            {/* Bottom Sheet */}
            {isOpen && (
                <div
                    className="fixed bottom-0 inset-x-0 z-50 lg:hidden"
                    dir="rtl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-background rounded-t-2xl border-t border-border shadow-2xl">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-border" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-3 pt-2 border-b border-border">
                            <button
                                onClick={handleClose}
                                className="p-1 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="font-semibold text-base">
                                {step === 'select' ? 'إدخال رحلة' : `تأكيد: رحلة ${selectedType === 'loaded' ? 'محملة' : 'فارغة'}`}
                            </h2>
                            <div className="w-7" />
                        </div>

                        {/* Step 1: Select Type */}
                        {step === 'select' && (
                            <div className="p-5 space-y-3">
                                <p className="text-sm text-muted-foreground text-center mb-4">
                                    اختر نوع الرحلة
                                </p>

                                {/* Loaded */}
                                <button
                                    onClick={() => handleSelectType('loaded')}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-background hover:border-foreground hover:bg-secondary/40 active:scale-[0.98] transition-all text-right"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                                        <PackageCheck className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-base">رحلة محملة</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            السعر الافتراضي: {formatIQD(30000)}
                                        </p>
                                    </div>
                                    <div className="text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Empty */}
                                <button
                                    onClick={() => handleSelectType('empty')}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-background hover:border-foreground hover:bg-secondary/40 active:scale-[0.98] transition-all text-right"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                                        <Truck className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-base">رحلة فارغة</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            السعر الافتراضي: {formatIQD(10000)}
                                        </p>
                                    </div>
                                    <div className="text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Step 2: Confirm */}
                        {step === 'confirm' && (
                            <div className="p-5 space-y-4">
                                {/* Type indicator */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                                    {selectedType === 'loaded'
                                        ? <PackageCheck className="h-5 w-5 shrink-0" />
                                        : <Truck className="h-5 w-5 shrink-0" />
                                    }
                                    <span className="font-medium">
                                        رحلة {selectedType === 'loaded' ? 'محملة' : 'فارغة'}
                                    </span>
                                    <button
                                        onClick={() => setStep('select')}
                                        className="mr-auto text-xs text-muted-foreground underline"
                                    >
                                        تغيير
                                    </button>
                                </div>

                                {/* Price Input */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">السعر (دينار عراقي)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            value={data.price}
                                            onChange={(e) => setData('price', parseInt(e.target.value) || 0)}
                                            className="w-full h-12 rounded-lg border border-input bg-transparent pr-4 pl-14 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-ring tabular-nums"
                                            dir="ltr"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                                            د.ع
                                        </span>
                                    </div>
                                    {/* Quick amounts */}
                                    <div className="flex gap-2 mt-2">
                                        {[10000, 15000, 20000, 25000, 30000].map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => setData('price', amt)}
                                                className={`flex-1 rounded-lg py-1.5 text-xs font-medium border transition-colors ${
                                                    data.price === amt
                                                        ? 'bg-foreground text-background border-foreground'
                                                        : 'border-border hover:bg-secondary'
                                                }`}
                                            >
                                                {(amt / 1000)}k
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">التاريخ والوقت</label>
                                    <input
                                        type="datetime-local"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="w-full h-12 rounded-lg border border-input bg-transparent px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        dir="ltr"
                                    />
                                </div>

                                {/* Notes toggle */}
                                <button
                                    onClick={() => setShowNotes(!showNotes)}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <FileText className="h-4 w-4" />
                                    {showNotes ? 'إخفاء الملاحظات' : 'إضافة ملاحظة (اختياري)'}
                                </button>

                                {showNotes && (
                                    <textarea
                                        rows={2}
                                        placeholder="اكتب ملاحظة..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="w-full rounded-lg border border-input bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                    />
                                )}

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={processing || data.price <= 0}
                                    className="w-full h-13 flex items-center justify-center gap-2 rounded-xl bg-foreground text-background text-base font-semibold disabled:opacity-50 active:scale-[0.98] transition-all mt-2"
                                    style={{ height: '52px' }}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-5 w-5" />
                                            تسجيل الرحلة — {formatIQD(data.price)}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Safe area spacing */}
                        <div className="h-safe-area-inset-bottom pb-4" />
                    </div>
                </div>
            )}

            {/* FAB Button */}
            <button
                onClick={() => { setIsOpen(true); setStep('select'); }}
                className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden flex items-center gap-2.5 rounded-full px-6 shadow-lg transition-all duration-200 font-semibold text-sm ${
                    isOpen
                        ? 'opacity-0 pointer-events-none scale-90'
                        : 'bg-foreground text-background hover:opacity-90 active:scale-95'
                }`}
                style={{ height: '52px' }}
            >
                <Plus className="h-5 w-5" />
                إدخال رحلة
            </button>
        </>
    );
}
