<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير رحلات ومصروفات وأجهزة — {{ $periodLabel }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

        @page {
            size: A4 portrait;
            margin: 8mm;
        }

        body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background-color: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 10px;
            direction: rtl;
            font-size: 11.5px;
            line-height: 1.4;
        }

        /* Header */
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }

        .brand-title {
            font-size: 17px;
            font-weight: 800;
            margin: 0;
            color: #0f172a;
        }

        .report-subtitle {
            font-size: 11px;
            color: #475569;
            margin-top: 2px;
        }

        .meta-box {
            text-align: left;
            font-size: 10px;
            color: #64748b;
        }

        /* KPI Data Grid Summary */
        .summary-sections {
            display: grid;
            grid-template-columns: 3fr 2fr;
            gap: 10px;
            margin-bottom: 14px;
        }

        .summary-block {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px 10px;
            background-color: #f8fafc;
        }

        .summary-block-title {
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 6px;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 3px;
        }

        .summary-grid-financial {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
        }

        .summary-grid-devices {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }

        .summary-card {
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 4px 6px;
            background-color: #ffffff;
            text-align: center;
        }

        .summary-card .label {
            font-size: 9px;
            color: #64748b;
            font-weight: 600;
            white-space: nowrap;
        }

        .summary-card .value {
            font-size: 11.5px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 1px;
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
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 6px;
            color: #1e293b;
        }

        table.data-grid {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
            margin-bottom: 14px;
        }

        table.data-grid th,
        table.data-grid td {
            border: 1px solid #94a3b8;
            padding: 5px 6px;
            text-align: right;
        }

        table.data-grid th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: 700;
            text-align: center;
            font-size: 10px;
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
            color: #475569;
            font-weight: 600;
        }

        .type-adjustment {
            color: #2563eb;
            font-weight: 700;
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

        .device-pos {
            color: #166534;
            font-weight: 700;
            direction: ltr;
        }

        .device-neg {
            color: #991b1b;
            font-weight: 700;
            direction: ltr;
        }

        /* Total Summary Footer Row */
        table.data-grid tr.total-row td {
            background-color: #e2e8f0;
            font-weight: 800;
            font-size: 11px;
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
        }

        /* Footer Notes */
        .report-footer {
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #64748b;
        }

        .no-print-btn {
            position: fixed;
            top: 15px;
            left: 15px;
            background-color: #0f172a;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999;
            font-family: inherit;
            font-size: 11px;
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
            <h1 class="brand-title">نظام رحلات — تقرير الحركة والتدقيق المالي ومخزن الأجهزة</h1>
            <p class="report-subtitle">{{ $periodLabel }}</p>
        </div>
        <div class="meta-box" dir="ltr">
            <div><strong>تاريخ التصدير:</strong> {{ $generatedAt }}</div>
            <div><strong>نظام إدارة الرحلات والمصروفات والأجهزة</strong></div>
        </div>
    </div>

    <!-- KPI Summary Sections -->
    <div class="summary-sections">
        <!-- Financial Summary Box -->
        <div class="summary-block">
            <div class="summary-block-title">الملخص المالي للمدة المحددة</div>
            <div class="summary-grid-financial">
                <div class="summary-card">
                    <div class="label">إجمالي الرحلات</div>
                    <div class="value">{{ $totalTripsCount }}</div>
                </div>
                <div class="summary-card">
                    <div class="label">الإيراد الكلي</div>
                    <div class="value">{{ number_format($totalRevenue) }}</div>
                </div>
                <div class="summary-card">
                    <div class="label">المصروفات</div>
                    <div class="value" style="color: #991b1b;">{{ number_format($totalExpenses) }}</div>
                </div>
                <div class="summary-card {{ $netIncome >= 0 ? 'net-positive' : 'net-negative' }}">
                    <div class="label">صافي الأرباح</div>
                    <div class="value">{{ number_format($netIncome) }}</div>
                </div>
            </div>
        </div>

        <!-- Devices Inventory Summary Box -->
        <div class="summary-block">
            <div class="summary-block-title">ملخص جرد رصيد الأجهزة</div>
            <div class="summary-grid-devices">
                <div class="summary-card">
                    <div class="label">الأجهزة السابقة</div>
                    <div class="value text-muted-foreground">{{ $startingDevicesCount }}</div>
                </div>
                <div class="summary-card">
                    <div class="label">حركة الأجهزة (+ / -)</div>
                    <div class="value" style="direction: rtl;">
                        <span class="device-pos">+{{ $addedDevices }}</span> / <span class="device-neg">-{{ $removedDevices }}</span>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="label">الأجهزة الحالية</div>
                    <div class="value text-primary" style="font-size: 12.5px;">{{ $endingDevicesCount }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Data Grid Table -->
    <div class="data-grid-title">كشف الحركات التفصيلي اليومي (Ledger Data Grid):</div>
    <table class="data-grid">
        <thead>
            <tr>
                <th style="width: 30px;">#</th>
                <th style="width: 120px;">التاريخ والوقت</th>
                <th style="width: 90px;">نوع الحركة</th>
                <th>التفاصيل والملاحظات</th>
                <th style="width: 90px;">المستخدم</th>
                <th style="width: 100px;">المبلغ (د.ع)</th>
                <th style="width: 75px; text-align: center;">تغيير الأجهزة</th>
                <th style="width: 75px; text-align: center;">رصيد الأجهزة</th>
            </tr>
        </thead>
        <tbody>
            @forelse($gridData as $index => $row)
                <tr>
                    <td style="text-align: center; color: #64748b;">{{ $index + 1 }}</td>
                    <td style="font-family: monospace; font-size: 10px; text-align: center;" dir="ltr">{{ $row['date'] }}</td>
                    <td style="text-align: center;">
                        <span class="{{ $row['raw_type'] === 'loaded' ? 'type-loaded' : ($row['raw_type'] === 'empty' ? 'type-empty' : ($row['raw_type'] === 'adjustment' ? 'type-adjustment' : 'type-expense')) }}">
                            {{ $row['type'] }}
                        </span>
                    </td>
                    <td>{{ $row['details'] }}</td>
                    <td style="text-align: center;">{{ $row['user'] }}</td>
                    <td style="text-align: left; font-family: monospace;" dir="ltr" class="{{ $row['is_income'] && $row['amount'] >= 0 ? 'amount-pos' : 'amount-neg' }}">
                        @if($row['amount'] == 0 && $row['raw_type'] === 'adjustment')
                            —
                        @else
                            {{ number_format($row['amount']) }} د.ع
                        @endif
                    </td>
                    <td style="text-align: center; font-family: monospace;" class="{{ str_contains($row['device_change'], '+') ? 'device-pos' : (str_contains($row['device_change'], '-') ? 'device-neg' : '') }}">
                        {{ $row['device_change'] }}
                    </td>
                    <td style="text-align: center; font-family: monospace; font-weight: bold; background-color: #f8fafc;">
                        {{ $row['device_balance'] }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align: center; color: #64748b; padding: 20px;">
                        لا توجد بيانات مسجلة في هذه الفترة
                    </td>
                </tr>
            @endforelse

            <!-- Total Row -->
            <tr class="total-row">
                <td colspan="5" style="text-align: left;">الصافي المالي العام للمدة المحددة (الأرباح):</td>
                <td style="text-align: left; font-family: monospace; color: {{ $netIncome >= 0 ? '#166534' : '#991b1b' }};" dir="ltr">
                    {{ number_format($netIncome) }} د.ع
                </td>
                <td style="text-align: left;" colspan="2">الرصيد النهائي للأجهزة: <span style="font-family: monospace; font-weight: 800; float: left; margin-left: 10px;">{{ $endingDevicesCount }}</span></td>
            </tr>
        </tbody>
    </table>

    <!-- Footer -->
    <div class="report-footer">
        <div>تم توليد هذا التقرير التفصيلي للأرباح والأجهزة آلياً عبر نظام رحلات</div>
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
