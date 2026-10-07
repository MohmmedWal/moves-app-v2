import ExportPanel from '../components/ExportPanel'

export default function Export({ transfers }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">التصدير إلى Excel</h2>
      <ExportPanel transfers={transfers} />
    </div>
  )
}
