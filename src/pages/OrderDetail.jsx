import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrderById } from '../services/orderService'
import { initializePayment } from '../services/paymentService'
import { STATUS_LABELS, STATUS_COLORS, TIMELINE, TIMELINE_LABELS, orderRef } from '../utils/orderStatus'

function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!user) return
    getOrderById(id, user.token)
      .then(setOrder)
      .catch(() => setError('We could not load this order.'))
      .finally(() => setLoading(false))
  }, [id, user])

  async function handleCancel() {
    if (!confirm('Cancel this order?')) return
    setPaying(true)
    try {
        const updated = await cancelOrder(order._id, user.token)
        setOrder({ ...order, ...updated })
    } catch (err) {
        setError(err.response?.data?.message || 'Could not cancel this order.')
    } finally {
        setPaying(false)
    }
}

  if (!user) return <Navigate to="/login" replace />
  if (loading) return <p className="px-6 md:px-10 pt-28">Loading order...</p>
  if (!order) return <p className="px-6 md:px-10 pt-28 text-red-500">{error || 'Order not found.'}</p>

  const currentIndex = TIMELINE.indexOf(order.status)
  const t = order.tracking || {}
  const hasTracking = t.courier || t.trackingNumber || t.trackingUrl || t.riderPhone || t.estimatedDelivery

  return (
    <div className="px-6 md:px-10 pt-28 pb-12 max-w-3xl mx-auto">
      <Link to="/orders" className="text-sm text-gray-500 hover:underline">← My Orders</Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <h2 className="text-2xl font-bold">Order {orderRef(order)}</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {order.status === 'pending' && !order.isPaid && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-sm mb-3">
            This order is waiting for payment.
            {order.expiresAt &&
                ` Pay before ${new Date(order.expiresAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                })} to keep your items reserved.`}
            </p>
            <div className="flex gap-3">
            <button
                onClick={handlePay}
                disabled={paying}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
            >
                {paying ? 'Please wait...' : 'Pay now'}
            </button>
            <button
                onClick={handleCancel}
                disabled={paying}
                className="border px-4 py-2 rounded-md text-sm disabled:opacity-50"
            >
                Cancel order
            </button>
            </div>
        </div>
    )}

      {order.status === 'cancelled' ? (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-6 text-sm text-red-800">
          This order was cancelled. If you already paid, please contact us about your refund.
        </div>
      ) : (
        <ol className="relative border-l border-gray-200 ml-3 mb-8">
          {TIMELINE.map((step, i) => {
            const done = i <= currentIndex
            const entry = order.statusHistory?.find((h) => h.status === step)
            return (
              <li key={step} className="relative mb-6 ml-6">
                <span
                  className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 ${
                    done ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'
                  }`}
                />
                <p className={done ? 'font-medium' : 'text-gray-400'}>{TIMELINE_LABELS[step]}</p>
                {entry && (
                  <p className="text-xs text-gray-500">{new Date(entry.at).toLocaleString()}</p>
                )}
                {entry?.note && step !== 'pending' && step !== 'paid' && (
                  <p className="text-xs text-gray-500">{entry.note}</p>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {hasTracking && (
        <div className="border rounded-lg p-4 mb-6 text-sm space-y-1">
          <h3 className="font-semibold mb-2">Delivery details</h3>
          {t.courier && <p>Courier: {t.courier}</p>}
          {t.trackingNumber && <p>Tracking number: {t.trackingNumber}</p>}
          {t.riderPhone && <p>Rider phone: {t.riderPhone}</p>}
          {t.estimatedDelivery && <p>Expected by: {new Date(t.estimatedDelivery).toDateString()}</p>}
          {t.trackingUrl && (
            <a href={t.trackingUrl} target="_blank" rel="noreferrer" className="underline">
              Track your package
            </a>
          )}
        </div>
      )}

      <h3 className="font-semibold mb-3">Items</h3>
      <div className="space-y-3 mb-6">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1 text-sm">
              <p>{item.name} ({item.size})</p>
              <p className="text-gray-500">Qty {item.quantity} × ₦{item.price.toLocaleString()}</p>
            </div>
            <p className="text-sm font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 flex justify-between font-bold">
        <span>Total</span>
        <span>₦{order.totalPrice.toLocaleString()}</span>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold text-gray-900 mb-1">Delivering to</h3>
        <p>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
        <p>{order.shippingAddress?.phone}</p>
      </div>
    </div>
  )
}

export default OrderDetail