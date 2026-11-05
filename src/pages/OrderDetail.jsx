import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../hooks/useSettings'
import { getOrderById, cancelOrder } from '../services/orderService'
import { initializePayment } from '../services/paymentService'
import { STATUS_LABELS, STATUS_COLORS, TIMELINE, TIMELINE_LABELS, orderRef } from '../utils/orderStatus'

// For pickup orders the "shipped" and "delivered" steps mean something different
const PICKUP_LABELS = { shipped: 'Ready for pickup', delivered: 'Collected' }

function SummaryRow({ label, value, className = '' }) {
  return (
    <div className={`flex justify-between text-sm ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { settings } = useSettings()
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

  async function handlePay() {
    setPaying(true)
    setError('')
    try {
      const payment = await initializePayment(order._id, user.token)
      window.location.href = payment.data.authorization_url
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the payment. Please try again.')
      setPaying(false)
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel this order?')) return
    setPaying(true)
    setError('')
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

  const isPickup = order.deliveryMethod === 'pickup'
  const timelineLabels = isPickup ? { ...TIMELINE_LABELS, ...PICKUP_LABELS } : TIMELINE_LABELS
  const statusLabel = (isPickup && PICKUP_LABELS[order.status]) || STATUS_LABELS[order.status]

  const currentIndex = TIMELINE.indexOf(order.status)
  const t = order.tracking || {}
  const hasTracking =
    !isPickup && (t.courier || t.trackingNumber || t.trackingUrl || t.riderPhone || t.estimatedDelivery)

  // Orders placed before the breakdown was saved have a subtotal of 0 and just show a total
  const hasBreakdown = order.subtotal > 0
  const address = order.shippingAddress || {}

  return (
    <div className="px-6 md:px-10 pt-28 pb-12 max-w-3xl mx-auto">
      <Link to="/orders" className="text-sm text-gray-500 hover:underline">← My Orders</Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <h2 className="text-2xl font-bold">Order {orderRef(order)}</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
          {statusLabel}
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
                <p className={done ? 'font-medium' : 'text-gray-400'}>{timelineLabels[step]}</p>
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
          {t.trackingUrl && /^https?:\/\//i.test(t.trackingUrl) && (
            <a href={t.trackingUrl} target="_blank" rel="noreferrer" className="underline">
              Track your package
            </a>
          )}
        </div>
      )}

      {isPickup && t.readyForPickupAt && order.status !== 'cancelled' && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4 mb-6 text-sm text-green-900">
          <p className="font-semibold">Your order is ready for pickup</p>
          <p className="text-xs mt-0.5">Ready since {new Date(t.readyForPickupAt).toLocaleString()}</p>
          {t.pickupNote && <p className="mt-2">{t.pickupNote}</p>}
          <p className="mt-2 text-xs">Please have your order number ready when you arrive.</p>
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

      <div className="border-t pt-4 space-y-1.5">
        {hasBreakdown && (
          <>
            <SummaryRow
              label="Subtotal"
              value={`₦${order.subtotal.toLocaleString()}`}
              className="text-gray-600"
            />
            {order.discountAmount > 0 && (
              <SummaryRow
                label={`Discount${order.discountCode ? ` (${order.discountCode})` : ''}`}
                value={`-₦${order.discountAmount.toLocaleString()}`}
                className="text-green-700"
              />
            )}
            <SummaryRow
              label={isPickup ? 'Pickup' : 'Delivery'}
              value={order.shippingCost > 0 ? `₦${order.shippingCost.toLocaleString()}` : 'Free'}
              className="text-gray-600"
            />
            {order.taxAmount > 0 && (
              <SummaryRow
                label="Tax"
                value={`₦${order.taxAmount.toLocaleString()}`}
                className="text-gray-600"
              />
            )}
          </>
        )}
        <div className="flex justify-between font-bold text-base pt-1">
          <span>Total</span>
          <span>₦{order.totalPrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        {isPickup ? (
          <>
            <h3 className="font-semibold text-gray-900 mb-1">Pick up from</h3>
            <p>{address.location || settings.pickup.name}</p>
            {settings.pickup.address && <p>{settings.pickup.address}</p>}
            <p>{address.phone}</p>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-gray-900 mb-1">Delivering to</h3>
            <p>{[address.address, address.city].filter(Boolean).join(', ')}</p>
            <p>{address.phone}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetail