const links = [
  { id: 'dashboard', label: 'الرئيسية' },
  { id: 'add', label: 'إضافة نقلة' },
  { id: 'records', label: 'السجلات' },
  { id: 'owners', label: 'كشف الحساب' },
  { id: 'export', label: 'التصدير' },
]

export default function Navbar({ page, onNavigate }) {
  return (
    <header className="bg-brand text-white pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="max-w-5xl mx-auto px-5 pb-4">
        <h1 className="text-2xl font-bold mb-3">إدارة النقلات</h1>
        <nav className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {links.map((l, i) => (
            <button
              key={l.id}
              onClick={() => onNavigate(l.id)}
              className={`min-h-12 rounded-lg font-bold cursor-pointer ${i === links.length - 1 ? 'col-span-2 sm:col-span-1' : ''} ${
                page === l.id ? 'bg-gold text-white' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
