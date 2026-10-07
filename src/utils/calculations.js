// كل الحسابات في مكان واحد. الكمية دائماً بالكيلو (KG)، وسعر البيع والتكلفة لكل كيلو.
export const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// تقريب لخانتين عشريتين لتفادي أرقام مثل 0.30000000000000004
export const round2 = (v) => Math.round(num(v) * 100) / 100
export const fmt = (v) => String(round2(v))

export const directionLabel = (d) => (d === 'north' ? 'شمال' : d === 'south' ? 'جنوب' : '—')

// يحوّل أي سجل (قديم أو جديد) إلى الشكل الجديد بقيم افتراضية، بدون حذف بيانات
export function normalizeTransfer(t) {
  let expenses = []
  if (Array.isArray(t.expenses)) {
    expenses = t.expenses.map((e) => ({ details: String(e?.details ?? ''), price: num(e?.price) }))
  } else if (num(t.expenses) > 0) {
    // سجل قديم: كان المصروف رقماً واحداً
    expenses = [{ details: 'مصاريف', price: num(t.expenses) }]
  }
  return {
    id: t.id,
    date: String(t.date ?? ''),
    locationDirection: t.locationDirection === 'north' || t.locationDirection === 'south' ? t.locationDirection : '',
    locationName: String(t.locationName ?? t.location ?? ''),
    team: String(t.team ?? ''),
    station: String(t.station ?? ''),
    owner: String(t.owner ?? ''),
    quantity: num(t.quantity),
    sellingPrice: num(t.sellingPrice),
    cost: num(t.cost),
    expenses,
    driverFare: num(t.driverFare),
    driverPaid: t.driverPaid === true,
  }
}

export const sumBy = (list, fn) => list.reduce((sum, t) => sum + fn(t), 0)
export const expensesTotal = (t) => sumBy(t.expenses, (e) => num(e.price))
export const salesTotal = (t) => num(t.quantity) * num(t.sellingPrice)
export const costTotal = (t) => num(t.quantity) * num(t.cost)
// الربح / التوريد = (الكمية × سعر البيع) - إجمالي المصاريف - (الكمية × تكلفة الكيلو)
export const profitOf = (t) => salesTotal(t) - expensesTotal(t) - costTotal(t)

// حالة الحساب لسجل واحد: دائن = استلم أجرته، مدين = لم يستلمها (له مبلغ علينا)
export const accountStatus = (t) => (t.driverPaid ? 'دائن' : 'مدين')

// كشف حساب مستقل لكل صاحب سيارة، يُحسب من السجلات فقط
export function ownerStatements(list) {
  const map = new Map()
  for (const t of list) {
    const name = t.owner.trim() || 'بدون اسم'
    if (!map.has(name)) map.set(name, { owner: name, records: [], totalFare: 0, paid: 0, owed: 0 })
    const s = map.get(name)
    s.records.push(t)
    s.totalFare += num(t.driverFare)
    if (t.driverPaid) s.paid += num(t.driverFare)
    else s.owed += num(t.driverFare)
  }
  return [...map.values()]
    .map((s) => ({ ...s, status: s.owed > 0 ? 'مدين' : 'دائن' }))
    .sort((a, b) => a.owner.localeCompare(b.owner, 'ar'))
}
