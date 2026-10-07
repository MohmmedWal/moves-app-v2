import TransferForm from '../components/TransferForm'
import { addTransfer } from '../utils/storage'

export default function AddTransfer({ onChange }) {
  function handleSave(data) {
    const ok = addTransfer(data)
    if (ok) onChange()
    return ok
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إضافة نقلة</h2>
      <TransferForm onSave={handleSave} />
    </div>
  )
}
