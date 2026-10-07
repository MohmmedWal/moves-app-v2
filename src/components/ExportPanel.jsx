import { useState } from 'react'
import { exportExcel, filterByDay, filterByRange, filterByMonth } from '../utils/exportExcel'

const now = new Date()

export default function ExportPanel({ transfers }) {
  const todayStr = now.toISOString().slice(0, 10)
  const [day, setDay] = useState(todayStr)
  const [from, setFrom] = useState(todayStr)
  const [to, setTo] = useState(todayStr)
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [status, setStatus] = useState({ type: '', text: '' })

  async function run(list, fileName) {
    try {
      if (await exportExcel(list, fileName)) setStatus({ type: 'ok', text: `تم تصدير ${list.length} نقلة: ${fileName}` })
      else setStatus({ type: 'error', text: 'لا توجد بيانات لهذه الفترة.' })
    } catch (err) {
      // إلغاء المشاركة من المستخدم ليس خطأً حقيقياً
      if (!String(err).toLowerCase().includes('cancel')) setStatus({ type: 'error', text: 'تعذر إنشاء الملف. حاول مرة أخرى.' })
    }
  }

  function exportDaily() {
    if (!day) return setStatus({ type: 'error', text: 'اختر التاريخ أولاً.' })
    run(filterByDay(transfers, day), `Daily_Report_${day}.xlsx`)
  }

  function exportWeekly() {
    if (!from || !to) return setStatus({ type: 'error', text: 'اختر تاريخ البداية والنهاية.' })
    if (from > to) return setStatus({ type: 'error', text: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية.' })
    run(filterByRange(transfers, from, to), `Weekly_Report_${from}_to_${to}.xlsx`)
  }

  function exportMonthly() {
    const y = Number(year)
    if (!y || y < 2000 || y > 2100) return setStatus({ type: 'error', text: 'السنة غير صحيحة.' })
    const mm = String(month).padStart(2, '0')
    run(filterByMonth(transfers, y, month), `Monthly_Report_${y}-${mm}.xlsx`)
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-4">
      {status.text && (
        <p className={`rounded-lg p-3 border ${status.type === 'ok' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}>
          {status.text}
        </p>
      )}

      <section className="card space-y-3">
        <h3 className="text-xl font-bold">التصدير اليومي</h3>
        <input type="date" className="input" value={day} onChange={(e) => setDay(e.target.value)} />
        <button onClick={exportDaily} className="btn-main w-full sm:w-auto">تصدير Excel</button>
      </section>

      <section className="card space-y-3">
        <h3 className="text-xl font-bold">التصدير الأسبوعي</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>من<input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label>إلى<input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
        <button onClick={exportWeekly} className="btn-main w-full sm:w-auto">تصدير Excel</button>
      </section>

      <section className="card space-y-3">
        <h3 className="text-xl font-bold">التصدير الشهري</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>الشهر
            <select className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label>السنة<input type="number" className="input" value={year} onChange={(e) => setYear(e.target.value)} /></label>
        </div>
        <button onClick={exportMonthly} className="btn-main w-full sm:w-auto">تصدير Excel</button>
      </section>
    </div>
  )
}
