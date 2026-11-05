import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../services/orderService'
import { STATUS_LABELS, STATUS_COLORS, orderRef } from '../utils/orderStatus'

// For pickup orders the "shipped" and "delivered" steps mean something different
const PICKUP_LABELS = { shipped: 'Ready for pickup', delivered: 'Collected' }

function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    getMyOrders(user.token)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setError('We could not load your orders. Please try again.'))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="px-6 md:px-10 pt-28 pb-12 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">
          You have not placed any orders yet.{' '}
          <Link to="/shop" className="underline">Start shopping</Link>
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const isPickup = o.deliveryMethod === 'pickup'
            const statusLabel = (isPickup && PICKUP_LABELS[o.status]) || STATUS_LABELS[o.status]

            return (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className="block border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{orderRef(o)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                    {statusLabel}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s) · ₦
                  {o.totalPrice.toLocaleString()}
                  {isPickup && <span className="ml-2 text-xs text-indigo-600">Store pickup</span>}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyOrders