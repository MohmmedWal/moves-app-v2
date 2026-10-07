import SummaryCard from '../components/SummaryCard'
import { fmt, sumBy, num, expensesTotal, profitOf } from '../utils/calculations'

export default function Dashboard({ transfers, onNavigate }) {
  const totalQty = sumBy(transfers, (t) => num(t.quantity))
  const totalExpenses = sumBy(transfers, expensesTotal)
  const totalProfit = sumBy(transfers, profitOf)
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard title="عدد النقلات" value={transfers.length} />
        <SummaryCard title="إجمالي الكمية (KG)" value={`${fmt(totalQty)} KG`} />
        <SummaryCard title="إجمالي المصاريف" value={fmt(totalExpenses)} />
        <SummaryCard title="إجمالي الربح / التوريد" value={fmt(totalProfit)} negative={totalProfit < 0} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button className="btn-main" onClick={() => onNavigate('add')}>إضافة نقلة</button>
        <button className="btn-gold" onClick={() => onNavigate('records')}>السجلات</button>
        <button className="btn-light" onClick={() => onNavigate('export')}>التصدير</button>
      </div>
    </div>
  )
}
