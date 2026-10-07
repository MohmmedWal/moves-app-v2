import { useState } from 'react'
import TransferTable from '../components/TransferTable'
import TransferForm from '../components/TransferForm'
import { updateTransfer, deleteTransfer } from '../utils/storage'

export default function Transfers({ transfers, onChange, onNavigate }) {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [editing, setEditing] = useState(null)

  const visible = transfers
    .filter((t) => !dateFilter || t.date === dateFilter)
    .filter((t) => [t.locationName, t.team, t.station, t.owner].join(' ').toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date))

  function handleDelete(t) {
    if (window.confirm(`هل تريد حذف نقلة ${t.owner} بتاريخ ${t.date}؟ لا يمكن التراجع.`)) {
      deleteTransfer(t.id)
      onChange()
    }
  }

  function handleUpdate(data) {
    const ok = updateTransfer(editing.id, data)
    if (ok) {
      onChange()
      setEditing(null)
    }
    return ok
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">تعديل نقلة</h2>
        <TransferForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">السجلات</h2>
        <button className="btn-main" onClick={() => onNavigate('add')}>إضافة</button>
      </div>
      <div className="card grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="بحث (مكان، فريق، محطة، صاحب سيارة)" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2">
          <input type="date" className="input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          {dateFilter && <button className="btn-light" onClick={() => setDateFilter('')}>مسح</button>}
        </div>
      </div>
      <TransferTable transfers={visible} onEdit={setEditing} onDelete={handleDelete} />
    </div>
  )
}
