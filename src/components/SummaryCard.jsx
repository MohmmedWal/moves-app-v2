export default function SummaryCard({ title, value, negative }) {
  return (
    <div className="card text-center">
      <p className="text-gray-600">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${negative ? 'text-red-700' : 'text-brand'}`}>{value}</p>
    </div>
  )
}
