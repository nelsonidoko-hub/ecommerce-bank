import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateOrderStatus } from '../../services/orderService'
import { STATUS_LABELS } from '../../utils/orderStatus'

const OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
const EMAILED = ['processing', 'shipped', 'delivered', 'cancelled']

function OrderFulfilment({ order, onUpdated }) {
  const { user } = useAuth()
  const t = order.tracking || {}
  const [status, setStatus] = useState(order.status)
  const [note, setNote] = useState('')
  const [tracking, setTracking] = useState({
    courier: t.courier || '',
    trackingNumber: t.trackingNumber || '',
    trackingUrl: t.trackingUrl || '',
    riderPhone: t.riderPhone || '',
    estimatedDelivery: t.estimatedDelivery ? t.estimatedDelivery.slice(0, 10) : '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  if (order.status === 'cancelled') {
    return <p className="text-sm text-gray-500 mt-4">This order was cancelled and can no longer be changed.</p>
  }

  function setField(e) {
    setTracking({ ...tracking, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    if (status !== order.status && EMAILED.includes(status)) {
      const warning = status === 'cancelled' ? 'Stock will be restored. ' : ''
      if (!confirm(`${warning}Update this order to "${STATUS_LABELS[status]}"? The customer will be emailed.`)) return
    }

    setSaving(true)
    try {
      const updated = await updateOrderStatus(order._id, { status, note, tracking }, user.token)
      onUpdated(updated)
      setNote('')
      setMessage('Order updated.')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const input = 'border rounded-md px-3 py-2 text-sm bg-white'

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t pt-4 space-y-3">
      <h4 className="font-semibold text-sm">Update order</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={input}>
          {OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <input name="courier" value={tracking.courier} onChange={setField} placeholder="Courier / dispatch company" className={input} />
        <input name="trackingNumber" value={tracking.trackingNumber} onChange={setField} placeholder="Tracking number" className={input} />
        <input name="riderPhone" value={tracking.riderPhone} onChange={setField} placeholder="Rider phone" className={input} />
        <input name="trackingUrl" value={tracking.trackingUrl} onChange={setField} placeholder="Tracking link (https://...)" className={input} />
        <input name="estimatedDelivery" type="date" value={tracking.estimatedDelivery} onChange={setField} className={input} />
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note shown on the customer's timeline"
        className={`${input} w-full`}
      />

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
          {saving ? 'Saving...' : 'Save update'}
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </form>
  )
}

export default OrderFulfilment