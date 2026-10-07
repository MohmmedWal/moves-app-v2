import { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import AddTransfer from './pages/AddTransfer'
import Transfers from './pages/Transfers'
import OwnerStatements from './pages/OwnerStatements'
import Export from './pages/Export'
import { getTransfers } from './utils/storage'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [transfers, setTransfers] = useState(getTransfers)
  const refresh = () => setTransfers(getTransfers())

  return (
    <div className="min-h-screen">
      <Navbar page={page} onNavigate={setPage} />
      <main className="max-w-5xl mx-auto px-5 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {page === 'dashboard' && <Dashboard transfers={transfers} onNavigate={setPage} />}
        {page === 'add' && <AddTransfer onChange={refresh} />}
        {page === 'records' && <Transfers transfers={transfers} onChange={refresh} onNavigate={setPage} />}
        {page === 'owners' && <OwnerStatements transfers={transfers} />}
        {page === 'export' && <Export transfers={transfers} />}
      </main>
    </div>
  )
}
