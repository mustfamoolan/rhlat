import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, Sparkles, ShieldCheck, Compass, MapPin, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="رحلات - Rhlat" />
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 font-sans dir-rtl">
                
                {/* Header / Navbar */}
                <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-lg shadow-indigo-500/30">
                                <Compass className="size-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold tracking-wide text-white">رحـلات</span>
                                <Badge variant="outline" className="mr-2 border-indigo-400/40 text-indigo-300 text-[10px]">
                                    Shadcn UI Enabled
                                </Badge>
                            </div>
                        </div>

                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20">
                                        لوحة التحكم
                                        <ArrowRight className="mr-2 size-4 rotate-180" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')}>
                                        <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                                            تسجيل الدخول
                                        </Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-md shadow-indigo-500/25">
                                            إنشاء حساب جديد
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="mx-auto max-w-7xl px-6 pt-16 pb-24">
                    <div className="text-center max-w-3xl mx-auto space-y-6">
                        <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase inline-flex items-center gap-2">
                            <Sparkles className="size-3.5 text-indigo-400" />
                            مشروع رحلات جاهز للعمل
                        </Badge>

                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                            منصة <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">رحـلات</span> المتكاملة
                        </h1>

                        <p className="text-lg text-slate-400 leading-relaxed">
                            تم إعداد وتجهيز مشروع **Laravel** مع **Inertia.js + React + TypeScript** ومكتبة مكونات **Shadcn UI** بنجاح.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-base font-semibold shadow-xl shadow-indigo-600/30 rounded-xl">
                                جاهز لاستلام المهام
                            </Button>
                        </div>
                    </div>

                    {/* Components Showcase */}
                    <div className="mt-20">
                        <Tabs defaultValue="stack" className="w-full">
                            <div className="flex justify-center mb-8">
                                <TabsList className="bg-slate-900/80 border border-white/10 p-1.5 rounded-xl">
                                    <TabsTrigger value="stack" className="rounded-lg text-sm px-6 py-2">حزمة التقنيات</TabsTrigger>
                                    <TabsTrigger value="shadcn" className="rounded-lg text-sm px-6 py-2">مكونات Shadcn UI</TabsTrigger>
                                    <TabsTrigger value="status" className="rounded-lg text-sm px-6 py-2">حالة النظام</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="stack">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-md">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-indigo-400 flex items-center gap-2">
                                                <Plane className="size-5" />
                                                Laravel Framework
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">الإصدار {laravelVersion} (PHP {phpVersion})</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-slate-300 text-sm space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-400" />
                                                توجيه ذكي ونظام توثيق Breeze
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-400" />
                                                قواعد بيانات وهيكلية سريعة
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-md">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-purple-400 flex items-center gap-2">
                                                <Sparkles className="size-5" />
                                                React & Inertia.js
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">TypeScript Enabled</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-slate-300 text-sm space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-400" />
                                                تفاعل لحظي وبناء مكونات متقدمة
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-400" />
                                                دعم TypeScript الكامل
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-md">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-rose-400 flex items-center gap-2">
                                                <ShieldCheck className="size-5" />
                                                Shadcn UI & Tailwind
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">تصميم عصري وقابل للتخصيص</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-slate-300 text-sm space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-400" />
                                                مكونات سهلة الاستخدام والتعديل
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-400" />
                                                دعم الوضع الليلي والنهاري
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="shadcn">
                                <Card className="bg-slate-900/50 border-white/10 p-6 backdrop-blur-md">
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <Button variant="default">Button Primary</Button>
                                        <Button variant="secondary">Button Secondary</Button>
                                        <Button variant="outline">Button Outline</Button>
                                        <Button variant="destructive">Button Destructive</Button>
                                        <Badge>Badge Default</Badge>
                                        <Badge variant="secondary">Badge Secondary</Badge>
                                        <Badge variant="outline">Badge Outline</Badge>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="status">
                                <Card className="bg-slate-900/50 border-white/10 p-6 backdrop-blur-md">
                                    <p className="text-emerald-400 font-medium flex items-center gap-2">
                                        <CheckCircle2 className="size-5" />
                                        المشروع جاهز ومثبت بنجاح، يمكنك الآن توجيهي بالمهام المطلوبة!
                                    </p>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
                    رحلات &copy; {new Date().getFullYear()} - تم الإعداد بواسطة Laravel v{laravelVersion} (PHP v{phpVersion})
                </footer>
            </div>
        </>
    );
}
