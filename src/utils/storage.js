// كل التعامل مع localStorage يتم هنا فقط.
import { normalizeTransfer } from './calculations'

const KEY = 'transfers'

export function getTransfers() {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) throw new Error('not an array')
    // السجلات القديمة تُحوَّل للشكل الجديد بقيم افتراضية (بدون فقدان بيانات)
    return data.filter((t) => t && typeof t === 'object').map(normalizeTransfer)
  } catch {
    // بيانات تالفة: نحتفظ بنسخة منها بدل أن نخسرها، ثم نبدأ بقائمة فارغة
    localStorage.setItem(KEY + '_corrupt_backup', raw)
    localStorage.removeItem(KEY)
    return []
  }
}

export function saveTransfers(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  } catch {
    return false // مثلاً: التخزين ممتلئ أو غير متاح
  }
}

export function addTransfer(data) {
  const transfer = { ...data, id: crypto.randomUUID() }
  return saveTransfers([...getTransfers(), transfer])
}

export function updateTransfer(id, data) {
  const list = getTransfers().map((t) => (t.id === id ? { ...data, id } : t))
  return saveTransfers(list)
}

export function deleteTransfer(id) {
  return saveTransfers(getTransfers().filter((t) => t.id !== id))
}
