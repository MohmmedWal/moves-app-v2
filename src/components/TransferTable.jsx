import { fmt, directionLabel, expensesTotal, profitOf } from '../utils/calculations'

export default function TransferTable({ transfers, onEdit, onDelete }) {
  if (transfers.length === 0) {
    return <p className="card text-center text-gray-600">لا توجد نقلات لعرضها.</p>
  }
  const heads = [
    'التاريخ', 'المكان', 'اسم الفريق', 'المحطة', 'صاحب السيارة', 'الكمية (KG)', 'سعر البيع / كغ', 'التكلفة / كغ',
    'إجمالي المصاريف', 'أجرة الصاحب', 'حالة الأجرة', 'الربح / التوريد', '',
  ]
  return (
    <div className="overflow-x-auto bg-white border border-gold/40 rounded-xl">
      <table className="w-full min-w-[1300px] text-right">
        <thead className="bg-brand text-white">
          <tr>{heads.map((h, i) => <th key={i} className="p-3 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {transfers.map((t) => {
            const profit = profitOf(t)
            return (
              <tr key={t.id} className="border-t border-gray-200 even:bg-cream/60">
                <td className="p-3">{t.date}</td>
                <td className="p-3">{directionLabel(t.locationDirection)} - {t.locationName}</td>
                <td className="p-3">{t.team}</td>
                <td className="p-3">{t.station}</td>
                <td className="p-3">{t.owner}</td>
                <td className="p-3">{fmt(t.quantity)} KG</td>
                <td className="p-3">{fmt(t.sellingPrice)}</td>
                <td className="p-3">{fmt(t.cost)}</td>
                <td className="p-3">{fmt(expensesTotal(t))}</td>
                <td className="p-3">{fmt(t.driverFare)}</td>
                <td className={`p-3 ${t.driverPaid ? 'text-green-800' : 'text-red-700'}`}>{t.driverPaid ? 'تم دفع الأجرة' : 'لم يتم دفع الأجرة'}</td>
                <td className={`p-3 font-bold ${profit < 0 ? 'text-red-700' : 'text-brand'}`}>{fmt(profit)}</td>
                <td className="p-3 whitespace-nowrap">
                  <button onClick={() => onEdit(t)} className="btn-light ml-2 px-3">تعديل</button>
                  <button onClick={() => onDelete(t)} className="btn-danger px-3">حذف</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
