import { useState } from 'react'
import { ownerStatements, accountStatus, fmt, directionLabel } from '../utils/calculations'

const badge = (status) => (status === 'مدين' ? 'text-red-700' : 'text-green-800')

export default function OwnerStatements({ transfers }) {
  const [selected, setSelected] = useState('')
  const statements = ownerStatements(transfers)
  const current = statements.find((s) => s.owner === selected)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">كشف حساب أصحاب السيارات</h2>
      <p className="text-gray-600">دائن: استلم أجرته. مدين: لم يستلم أجرته (له مبلغ مستحق علينا). يُحسب تلقائياً من السجلات.</p>

      {statements.length === 0 && <p className="card text-center text-gray-600">لا توجد سجلات بعد.</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {statements.map((s) => (
          <button
            key={s.owner}
            onClick={() => setSelected(s.owner)}
            className={`card text-right cursor-pointer min-h-12 ${s.owner === selected ? 'border-brand border-2' : ''}`}
          >
            <p className="text-xl font-bold">{s.owner}</p>
            <p className={`font-bold ${badge(s.status)}`}>
              {s.status === 'مدين' ? `مدين - مستحق له علينا: ${fmt(s.owed)}` : 'دائن - استلم كامل أجرته'}
            </p>
          </button>
        ))}
      </div>

      {current && (
        <section className="card space-y-4">
          <h3 className="text-xl font-bold text-brand border-b border-gold/40 pb-2">كشف حساب: {current.owner}</h3>
          <div className="grid gap-3 sm:grid-cols-4">
            <p>عدد النقلات: <b>{current.records.length}</b></p>
            <p>إجمالي الأجرة: <b>{fmt(current.totalFare)}</b></p>
            <p>المدفوع: <b>{fmt(current.paid)}</b></p>
            <p>المستحق له علينا: <b className={badge(current.status)}>{fmt(current.owed)}</b></p>
          </div>
          <p className={`font-bold ${badge(current.status)}`}>حالة الحساب: {current.status}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-right">
              <thead className="bg-brand text-white">
                <tr>{['التاريخ', 'المكان', 'الكمية (KG)', 'الأجرة', 'الحالة'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {[...current.records].sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
                  <tr key={t.id} className="border-t border-gray-200">
                    <td className="p-3">{t.date}</td>
                    <td className="p-3">{directionLabel(t.locationDirection)} - {t.locationName}</td>
                    <td className="p-3">{fmt(t.quantity)} KG</td>
                    <td className="p-3">{fmt(t.driverFare)}</td>
                    <td className={`p-3 font-bold ${badge(accountStatus(t))}`}>{accountStatus(t)} ({t.driverPaid ? 'تم دفع الأجرة' : 'لم يتم دفع الأجرة'})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
