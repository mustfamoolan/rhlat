<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير رحلات ومصروفات — {{ $periodLabel }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

        @page {
            size: A4 portrait;
            margin: 10mm;
        }

        body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background-color: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 16px;
            direction: rtl;
            font-size: 12.5px;
            line-height: 1.4;
        }

        /* Header */
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }

        .brand-title {
            font-size: 19px;
            font-weight: 800;
            margin: 0;
            color: #0f172a;
        }

        .report-subtitle {
            font-size: 12px;
            color: #475569;
            margin-top: 3px;
        }

        .meta-box {
            text-align: left;
            font-size: 10.5px;
            color: #64748b;
        }

        /* KPI Data Grid Summary */
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 8px;
            margin-bottom: 16px;
        }

        .summary-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 7px 8px;
            background-color: #f8fafc;
            text-align: center;
        }

        .summary-card .label {
            font-size: 10px;
            color: #64748b;
            font-weight: 600;
            white-space: nowrap;
        }

        .summary-card .value {
            font-size: 13.5px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 2px;
            direction: ltr;
        }

        .summary-card.card-loaded .value {
            color: #166534;
        }

        .summary-card.card-empty .value {
            color: #991b1b;
        }

        .summary-card.net-positive .value {
            color: #166534;
        }

        .summary-card.net-negative .value {
            color: #991b1b;
        }

        /* Main Data Grid Table */
        .data-grid-title {
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #1e293b;
        }

        table.data-grid {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
            margin-bottom: 16px;
        }

        table.data-grid th,
        table.data-grid td {
            border: 1px solid #94a3b8;
            padding: 6px 8px;
            text-align: right;
        }

        table.data-grid th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: 700;
            text-align: center;
            font-size: 11px;
        }

        table.data-grid tr:nth-child(even) {
            background-color: #f8fafc;
        }

        table.data-grid tr:hover {
            background-color: #f1f5f9;
        }

        .type-loaded {
            color: #166534;
            font-weight: 700;
        }

        .type-empty {
            color: #991b1b;
            font-weight: 700;
        }

        .type-expense {
            color: #dc2626;
            font-weight: 600;
        }

        .amount-pos {
            color: #166534;
            font-weight: 700;
            direction: ltr;
            text-align: left;
        }

        .amount-neg {
            color: #991b1b;
            font-weight: 700;
            direction: ltr;
            text-align: left;
        }

        /* Total Summary Footer Row */
        table.data-grid tr.total-row td {
            background-color: #e2e8f0;
            font-weight: 800;
            font-size: 12.5px;
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
        }

        /* Footer Notes */
        .report-footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
        }

        .no-print-btn {
            position: fixed;
            top: 15px;
            left: 15px;
            background-color: #0f172a;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999;
            font-family: inherit;
        }

        @media print {
            .no-print-btn {
                display: none !important;
            }
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>

    <button class="no-print-btn" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>

    <!-- Header -->
    <div class="report-header">
        <div>
            <h1 class="brand-title">نظام رحلات — تقرير الحركة المالية</h1>
            <p class="report-subtitle">{{ $periodLabel }}</p>
        </div>
        <div class="meta-box" dir="ltr">
            <div><strong>تاريخ التصدير:</strong> {{ $generatedAt }}</div>
            <div><strong>نظام إدارة الرحلات والمصروفات</strong></div>
        </div>
    </div>

    <!-- KPI Data Grid Summary Cards (6 Cards) -->
    <div class="summary-grid">
        <div class="summary-card">
            <div class="label">إجمالي الرحلات</div>
            <div class="value">{{ $totalTripsCount }}</div>
        </div>
        <div class="summary-card card-loaded">
            <div class="label">رحلات محملة</div>
            <div class="value">{{ $loadedCount }}</div>
        </div>
        <div class="summary-card card-empty">
            <div class="label">رحلات فارغة</div>
            <div class="value">{{ $emptyCount }}</div>
        </div>
        <div class="summary-card">
            <div class="label">إجمالي الإيرادات</div>
            <div class="value">{{ number_format($totalRevenue) }} د.ع</div>
        </div>
        <div class="summary-card">
            <div class="label">المصروفات</div>
            <div class="value" style="color: #991b1b;">{{ number_format($totalExpenses) }} د.ع</div>
        </div>
        <div class="summary-card {{ $netIncome >= 0 ? 'net-positive' : 'net-negative' }}">
            <div class="label">صافي الأرباح</div>
            <div class="value">{{ number_format($netIncome) }} د.ع</div>
        </div>
    </div>

    <!-- Data Grid Table -->
    <div class="data-grid-title">جدول تفاصيل الحركات (Data Grid):</div>
    <table class="data-grid">
        <thead>
            <tr>
                <th style="width: 35px;">#</th>
                <th style="width: 135px;">التاريخ والوقت</th>
                <th style="width: 105px;">نوع الحركة</th>
                <th>التفاصيل والملاحظات</th>
                <th style="width: 105px;">المستخدم</th>
                <th style="width: 115px;">المبلغ (د.ع)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($gridData as $index => $row)
                <tr>
                    <td style="text-align: center; color: #64748b;">{{ $index + 1 }}</td>
                    <td style="font-family: monospace; font-size: 10.5px; text-align: center;" dir="ltr">{{ $row['date'] }}</td>
                    <td style="text-align: center;">
                        <span class="{{ $row['raw_type'] === 'loaded' ? 'type-loaded' : ($row['raw_type'] === 'empty' ? 'type-empty' : 'type-expense') }}">
                            {{ $row['type'] }}
                        </span>
                    </td>
                    <td>{{ $row['details'] }}</td>
                    <td style="text-align: center;">{{ $row['user'] }}</td>
                    <td style="text-align: left; font-family: monospace;" dir="ltr" class="{{ $row['is_income'] ? 'amount-pos' : 'amount-neg' }}">
                        {{ number_format($row['amount']) }} د.ع
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #64748b; padding: 20px;">
                        لا توجد بيانات مسجلة في هذه الفترة
                    </td>
                </tr>
            @endforelse

            <!-- Total Row -->
            <tr class="total-row">
                <td colspan="5" style="text-align: left;">الصافي النهائي للمدة المحددة (الإيرادات - المصروفات):</td>
                <td style="text-align: left; font-family: monospace; color: {{ $netIncome >= 0 ? '#166534' : '#991b1b' }};" dir="ltr">
                    {{ number_format($netIncome) }} د.ع
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Footer -->
    <div class="report-footer">
        <div>تم توليد هذا التقرير آلياً عبر نظام رحلات</div>
        <div>صفحة 1 من 1</div>
    </div>

    <script>
        // Auto open print / Save as PDF dialog on load
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                window.print();
            }, 500);
        });
    </script>
</body>
</html>
