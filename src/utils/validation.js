const isBadNumber = (value, min) => {
  const text = String(value ?? '').trim()
  const n = Number(text)
  return text === '' || Number.isNaN(n) || n < min
}

// مصروف فارغ تماماً يُتجاهل. غير ذلك يجب أن يكون له تفاصيل وسعر صحيح.
const isBadExpense = (e) => {
  const details = String(e.details ?? '').trim()
  const price = String(e.price ?? '').trim()
  if (details === '' && price === '') return false
  return details === '' || isBadNumber(price, 0)
}

// يرجع كائن أخطاء. إذا كان فارغاً فالبيانات صحيحة.
export function validateTransfer(form) {
  const errors = {}
  if (!form.date) errors.date = 'اختر التاريخ'
  else if (Number.isNaN(new Date(form.date + 'T00:00:00').getTime())) errors.date = 'التاريخ غير صحيح'

  if (form.locationDirection !== 'north' && form.locationDirection !== 'south') {
    errors.locationDirection = 'اختر شمال أو جنوب'
  }
  if (!form.locationName.trim()) errors.locationName = 'أدخل اسم المكان / المنطقة'
  if (!form.team.trim()) errors.team = 'أدخل اسم الفريق'
  if (!form.station.trim()) errors.station = 'أدخل المحطة'
  if (!form.owner.trim()) errors.owner = 'أدخل اسم صاحب السيارة'

  if (isBadNumber(form.quantity, 0) || Number(form.quantity) === 0) errors.quantity = 'الكمية (KG) يجب أن تكون رقماً أكبر من صفر'
  if (isBadNumber(form.sellingPrice, 0)) errors.sellingPrice = 'سعر البيع يجب أن يكون رقماً صفراً أو أكبر'
  if (isBadNumber(form.cost, 0)) errors.cost = 'التكلفة يجب أن تكون رقماً صفراً أو أكبر'
  if (isBadNumber(form.driverFare, 0)) errors.driverFare = 'أجرة صاحب السيارة يجب أن تكون رقماً صفراً أو أكبر'
  if ((form.expenses || []).some(isBadExpense)) errors.expenses = 'أكمل تفاصيل وسعر كل مصروف بشكل صحيح (السعر رقم صفر أو أكبر)'
  return errors
}
