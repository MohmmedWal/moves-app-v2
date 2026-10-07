import { useState } from 'react'
import { validateTransfer } from '../utils/validation'
import { num, fmt } from '../utils/calculations'

const today = () => new Date().toISOString().slice(0, 10)
const blankExpense = () => ({ details: '', price: '' })

const emptyForm = () => ({
  date: today(), locationDirection: '', locationName: '', team: '', station: '', owner: '',
  quantity: '', sellingPrice: '', cost: '', expenses: [blankExpense()], driverFare: '', driverPaid: false,
})

// يحوّل سجلاً محفوظاً (أرقام) إلى قيم نصية لحقول الإدخال
const toForm = (t) => ({
  ...emptyForm(), ...t,
  quantity: String(t.quantity), sellingPrice: String(t.sellingPrice), cost: String(t.cost), driverFare: String(t.driverFare),
  expenses: t.expenses.length ? t.expenses.map((e) => ({ details: e.details, price: String(e.price) })) : [blankExpense()],
})

const sectionTitle = 'text-xl font-bold text-brand border-b border-gold/40 pb-2'
const checkboxRow = 'flex items-center gap-3 min-h-12 px-4 border border-gray-300 rounded-lg bg-white cursor-pointer'

// initial: سجل للتعديل (اختياري). onSave يستقبل بيانات صحيحة ويرجع true إذا نجح الحفظ.
export default function TransferForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? toForm(initial) : emptyForm())
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  const expensesTotal = form.expenses.reduce((sum, e) => sum + num(e.price), 0)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  function chooseDirection(value) {
    setForm({ ...form, locationDirection: form.locationDirection === value ? '' : value })
  }
  function changeExpense(index, key, value) {
    setForm({ ...form, expenses: form.expenses.map((e, i) => (i === index ? { ...e, [key]: value } : e)) })
  }
  function addExpense() {
    setForm({ ...form, expenses: [...form.expenses, blankExpense()] })
  }
  function removeExpense(index) {
    setForm({ ...form, expenses: form.expenses.filter((_, i) => i !== index) })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = validateTransfer(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setMessage('')
      return
    }
    const data = {
      date: form.date,
      locationDirection: form.locationDirection,
      locationName: form.locationName.trim(),
      team: form.team.trim(),
      station: form.station.trim(),
      owner: form.owner.trim(),
      quantity: Number(form.quantity),
      sellingPrice: Number(form.sellingPrice),
      cost: Number(form.cost),
      // المصاريف الفارغة تماماً تُتجاهل
      expenses: form.expenses
        .filter((x) => x.details.trim() !== '' || String(x.price).trim() !== '')
        .map((x) => ({ details: x.details.trim(), price: Number(x.price) })),
      driverFare: Number(form.driverFare),
      driverPaid: form.driverPaid,
    }
    if (onSave(data)) {
      if (!initial) {
        setForm(emptyForm())
        setMessage('تم حفظ النقلة بنجاح')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      setErrors({ general: 'تعذر الحفظ في المتصفح. تحقق من مساحة التخزين.' })
    }
  }

  function field(name, label, type = 'text') {
    const isNumber = type === 'number'
    return (
      <label className="block">
        <span className="block mb-1 font-bold">{label}</span>
        <input
          className="input"
          name={name}
          type={type}
          value={form[name]}
          onChange={handleChange}
          min={isNumber ? 0 : undefined}
          step={isNumber ? 'any' : undefined}
          inputMode={isNumber ? 'decimal' : undefined}
        />
        {errors[name] && <span className="text-red-700 text-base">{errors[name]}</span>}
      </label>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-8" noValidate>
      {message && <p className="bg-green-50 border border-green-600 text-green-800 rounded-lg p-3">{message}</p>}
      {errors.general && <p className="bg-red-50 border border-red-600 text-red-800 rounded-lg p-3">{errors.general}</p>}

      <section className="space-y-4">
        <h3 className={sectionTitle}>بيانات النقلة</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('date', 'التاريخ', 'date')}
          {field('team', 'اسم الفريق')}
          {field('station', 'المحطة')}
          {field('owner', 'اسم صاحب السيارة')}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className={sectionTitle}>مكان النقل</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className={checkboxRow}>
            <input type="checkbox" className="w-6 h-6 accent-brand" checked={form.locationDirection === 'north'} onChange={() => chooseDirection('north')} />
            شمال
          </label>
          <label className={checkboxRow}>
            <input type="checkbox" className="w-6 h-6 accent-brand" checked={form.locationDirection === 'south'} onChange={() => chooseDirection('south')} />
            جنوب
          </label>
        </div>
        {errors.locationDirection && <p className="text-red-700 text-base">{errors.locationDirection}</p>}
        {field('locationName', 'اسم المكان / المنطقة')}
      </section>

      <section className="space-y-4">
        <h3 className={sectionTitle}>الكمية والأسعار</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {field('quantity', 'الكمية (KG)', 'number')}
          {field('sellingPrice', 'سعر البيع (لكل كيلو)', 'number')}
          {field('cost', 'التكلفة (لكل كيلو)', 'number')}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className={sectionTitle}>المصاريف</h3>
        {form.expenses.map((expense, index) => (
          <div key={index} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="تفاصيل المصروف"
              value={expense.details}
              onChange={(e) => changeExpense(index, 'details', e.target.value)}
            />
            <input
              className="input w-28"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="السعر"
              value={expense.price}
              onChange={(e) => changeExpense(index, 'price', e.target.value)}
            />
            <button type="button" onClick={() => removeExpense(index)} aria-label="حذف المصروف" className="btn-danger px-4">✕</button>
          </div>
        ))}
        {errors.expenses && <p className="text-red-700 text-base">{errors.expenses}</p>}
        <button type="button" onClick={addExpense} className="btn-light w-full sm:w-auto">+ إضافة مصروف</button>
        <p className="font-bold">إجمالي المصاريف: <span className="text-brand">{fmt(expensesTotal)}</span></p>
      </section>

      <section className="space-y-4">
        <h3 className={sectionTitle}>أجرة صاحب السيارة</h3>
        {field('driverFare', 'أجرة صاحب السيارة', 'number')}
        <label className={checkboxRow}>
          <input
            type="checkbox"
            className="w-6 h-6 accent-brand"
            checked={form.driverPaid}
            onChange={(e) => setForm({ ...form, driverPaid: e.target.checked })}
          />
          تم دفع الأجرة
        </label>
        <p className={form.driverPaid ? 'text-green-800' : 'text-red-700'}>
          {form.driverPaid ? 'تم دفع أجرة صاحب السيارة' : 'لم يتم دفع الأجرة'}
        </p>
      </section>

      <div className="flex gap-2">
        <button type="submit" className="btn-main flex-1 sm:flex-none">{initial ? 'حفظ التعديل' : 'حفظ'}</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-light">إلغاء</button>}
      </div>
    </form>
  )
}
