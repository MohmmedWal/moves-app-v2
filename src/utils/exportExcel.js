import * as XLSX from 'xlsx'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import {
  num, round2, fmt, sumBy, directionLabel, expensesTotal, salesTotal, costTotal, profitOf, accountStatus, ownerStatements,
} from './calculations'

// ---- فلترة السجلات (التاريخ مخزّن بصيغة YYYY-MM-DD فالمقارنة النصية آمنة) ----
export const filterByDay = (list, day) => list.filter((t) => t.date === day)
export const filterByRange = (list, from, to) => list.filter((t) => t.date >= from && t.date <= to)
export const filterByMonth = (list, year, month) =>
  list.filter((t) => t.date.startsWith(`${year}-${String(month).padStart(2, '0')}`))

export function dayLabel(date) {
  const name = new Date(date + 'T00:00:00').toLocaleDateString('ar', { weekday: 'long' })
  return `${name} ${date}`
}

const setWidths = (sheet, widths) => {
  sheet['!cols'] = widths.map((wch) => ({ wch }))
}

export function buildWorkbook(list) {
  const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date))
  const book = XLSX.utils.book_new()

  // ---- الورقة 1: التقرير (سجل واحد في كل صف) ----
  const totalQty = sumBy(sorted, (t) => num(t.quantity))
  const totalSales = sumBy(sorted, salesTotal)
  const totalCost = sumBy(sorted, costTotal)
  const totalExpenses = sumBy(sorted, expensesTotal)
  const totalProfit = sumBy(sorted, profitOf)
  const totalOwed = sumBy(sorted, (t) => (t.driverPaid ? 0 : num(t.driverFare)))

  const report = [
    [
      'اليوم', 'الاتجاه', 'اسم المكان', 'اسم الفريق', 'المحطة', 'اسم صاحب السيارة', 'الكمية (KG)',
      'سعر البيع / كغ', 'التكلفة / كغ', 'إجمالي البيع', 'إجمالي التكلفة', 'تفاصيل المصاريف', 'إجمالي المصاريف',
      'أجرة صاحب السيارة', 'حالة دفع الأجرة', 'حالة الحساب', 'الربح / التوريد',
    ],
    ...sorted.map((t) => [
      dayLabel(t.date), directionLabel(t.locationDirection), t.locationName, t.team, t.station, t.owner, round2(t.quantity),
      round2(t.sellingPrice), round2(t.cost), round2(salesTotal(t)), round2(costTotal(t)),
      t.expenses.map((e) => `${e.details}: ${fmt(e.price)}`).join(' | '), round2(expensesTotal(t)),
      round2(t.driverFare), t.driverPaid ? 'تم دفع الأجرة' : 'لم يتم دفع الأجرة', accountStatus(t), round2(profitOf(t)),
    ]),
    [],
    ['الملخص'],
    ['عدد النقلات', sorted.length],
    ['إجمالي الكمية (KG)', round2(totalQty)],
    ['إجمالي البيع', round2(totalSales)],
    ['إجمالي التكلفة', round2(totalCost)],
    ['إجمالي المصاريف', round2(totalExpenses)],
    ['مستحق لأصحاب السيارات (مدين)', round2(totalOwed)],
    ['إجمالي الربح / التوريد', round2(totalProfit)],
  ]
  const reportSheet = XLSX.utils.aoa_to_sheet(report)
  setWidths(reportSheet, [22, 10, 18, 16, 14, 20, 12, 14, 12, 14, 14, 36, 16, 16, 18, 12, 16])
  XLSX.utils.book_append_sheet(book, reportSheet, 'التقرير')

  // ---- الورقة 2: المصاريف (مصروف واحد في كل صف) ----
  const expenseRows = [['اليوم', 'صاحب السيارة', 'اسم المكان', 'تفاصيل المصروف', 'السعر']]
  for (const t of sorted) {
    for (const e of t.expenses) {
      expenseRows.push([dayLabel(t.date), t.owner, t.locationName, e.details, round2(e.price)])
    }
  }
  expenseRows.push([], ['إجمالي المصاريف', '', '', '', round2(totalExpenses)])
  const expensesSheet = XLSX.utils.aoa_to_sheet(expenseRows)
  setWidths(expensesSheet, [22, 20, 18, 28, 12])
  XLSX.utils.book_append_sheet(book, expensesSheet, 'المصاريف')

  // ---- الورقة 3: كشف حساب أصحاب السيارات ----
  const statementRows = [['صاحب السيارة', 'عدد النقلات', 'إجمالي الأجرة', 'المدفوع', 'المستحق له علينا', 'حالة الحساب']]
  for (const s of ownerStatements(sorted)) {
    statementRows.push([s.owner, s.records.length, round2(s.totalFare), round2(s.paid), round2(s.owed), s.status])
  }
  const statementSheet = XLSX.utils.aoa_to_sheet(statementRows)
  setWidths(statementSheet, [22, 12, 14, 12, 16, 14])
  XLSX.utils.book_append_sheet(book, statementSheet, 'كشف الحسابات')

  book.Workbook = { Views: [{ RTL: true }] } // الأوراق من اليمين لليسار
  return book
}

// يرجع false إذا لا توجد بيانات
export async function exportExcel(list, fileName) {
  if (list.length === 0) return false
  const book = buildWorkbook(list)

  if (Capacitor.isNativePlatform()) {
    // على الموبايل: نحفظ الملف مؤقتاً ثم نفتح نافذة المشاركة (واتساب، Drive، Excel...)
    const base64 = XLSX.write(book, { bookType: 'xlsx', type: 'base64' })
    const saved = await Filesystem.writeFile({ path: fileName, data: base64, directory: Directory.Cache })
    await Share.share({ title: fileName, url: saved.uri, dialogTitle: 'مشاركة التقرير' })
  } else {
    XLSX.writeFile(book, fileName) // على المتصفح: تحميل مباشر
  }
  return true
}
