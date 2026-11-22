import { useOpenStatus } from '../hooks/useOpenStatus'

// A small pill: "Open now · until 9:00 PM" or "Closed · opens tomorrow at 9:00 AM".
// Shows nothing at all for shops that don't use opening hours.
function OpenStatusBadge({ className = '' }) {
  const status = useOpenStatus()
  if (!status.enabled) return null

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
        status.open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      } ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${status.open ? 'bg-green-600' : 'bg-red-600'}`} />
      {status.text}
    </span>
  )
}

export default OpenStatusBadge