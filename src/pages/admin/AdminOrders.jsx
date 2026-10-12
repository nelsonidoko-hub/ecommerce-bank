import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAllOrders, updateOrderStatus } from '../../services/orderService'

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function AdminOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  // Local draft state for the tracking form per order (keyed by order id)
  const [trackingDrafts, setTrackingDrafts] = useState({})
  const [savingTrackingId, setSavingTrackingId] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const data = await getAllOrders(user.token)
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      const updated = await updateOrderStatus(orderId, { status: newStatus }, user.token)
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o)))
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status')
    }
  }

  function getDraft(order) {
    return (
      trackingDrafts[order._id] || {
        courier: order.tracking?.courier || '',
        trackingNumber: order.tracking?.trackingNumber || '',
        trackingUrl: order.tracking?.trackingUrl || '',
        riderPhone: order.tracking?.riderPhone || '',
        estimatedDelivery: order.tracking?.estimatedDelivery
          ? order.tracking.estimatedDelivery.slice(0, 10)
          : '',
        pickupNote: order.tracking?.pickupNote || '',
      }
    )
  }

  function updateDraft(orderId, field, value) {
    setTrackingDrafts((prev) => ({
      ...prev,
      [orderId]: { ...getDraftFor(orderId, prev), [field]: value },
    }))
  }

  function getDraftFor(orderId, draftsObj) {
    const existing = draftsObj[orderId]
    if (existing) return existing
    const order = orders.find((o) => o._id === orderId)
    return getDraft(order || {})
  }

  async function handleSaveShippingTracking(order) {
    const draft = getDraft(order)
    setSavingTrackingId(order._id)
    try {
      const updated = await updateOrderStatus(
        order._id,
        {
          tracking: {
            courier: draft.courier,
            trackingNumber: draft.trackingNumber,
            trackingUrl: draft.trackingUrl,
            riderPhone: draft.riderPhone,
            estimatedDelivery: draft.estimatedDelivery || undefined,
          },
        },
        user.token
      )
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, ...updated } : o)))
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save tracking info')
    } finally {
      setSavingTrackingId(null)
    }
  }

  async function handleMarkReadyForPickup(order) {
    const draft = getDraft(order)
    setSavingTrackingId(order._id)
    try {
      const updated = await updateOrderStatus(
        order._id,
        {
          tracking: {
            readyForPickupAt: new Date().toISOString(),
            pickupNote: draft.pickupNote,
          },
        },
        user.token
      )
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, ...updated } : o)))
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update pickup status')
    } finally {
      setSavingTrackingId(null)
    }
  }

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  const totalRevenue = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + o.totalPrice, 0)

  if (loading) return <p className="p-6">Loading orders...</p>

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-6">Orders</h2>

      {/* Summary cards — 2 per row on phones, 4 on larger screens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="border rounded-lg p-3 sm:p-4">
          <p className="text-[11px] sm:text-xs text-gray-500 uppercase">Total Orders</p>
          <p className="text-xl sm:text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="border rounded-lg p-3 sm:p-4">
          <p className="text-[11px] sm:text-xs text-gray-500 uppercase">Pending</p>
          <p className="text-xl sm:text-2xl font-bold">
            {orders.filter((o) => o.status === 'pending').length}
          </p>
        </div>
        <div className="border rounded-lg p-3 sm:p-4">
          <p className="text-[11px] sm:text-xs text-gray-500 uppercase">Delivered</p>
          <p className="text-xl sm:text-2xl font-bold">
            {orders.filter((o) => o.status === 'delivered').length}
          </p>
        </div>
        <div className="border rounded-lg p-3 sm:p-4">
          <p className="text-[11px] sm:text-xs text-gray-500 uppercase">Revenue</p>
          <p className="text-xl sm:text-2xl font-bold truncate">
            ₦{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter chips — scroll sideways on mobile instead of wrapping/hiding */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={
              filterStatus === s
                ? 'shrink-0 px-3 py-1 rounded-full text-sm bg-gray-900 text-white capitalize'
                : 'shrink-0 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 capitalize hover:bg-gray-200'
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders table — scrolls horizontally instead of hiding/squeezing columns */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3 whitespace-nowrap">Order ID</th>
                <th className="p-3 whitespace-nowrap">Customer</th>
                <th className="p-3 whitespace-nowrap">Date</th>
                <th className="p-3 whitespace-nowrap">Delivery</th>
                <th className="p-3 whitespace-nowrap">Total</th>
                <th className="p-3 whitespace-nowrap">Payment</th>
                <th className="p-3 whitespace-nowrap">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isPickup = order.deliveryMethod === 'pickup'
                const draft = getDraft(order)

                return (
                  <>
                    <tr key={order._id} className="border-t">
                      <td className="p-3 font-mono text-xs whitespace-nowrap">
                        {order._id.slice(-8)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <p className="font-medium">{order.user?.name}</p>
                        <p className="text-gray-500 text-xs">{order.user?.email}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={
                            isPickup
                              ? 'text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 capitalize'
                              : 'text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-800 capitalize'
                          }
                        >
                          {isPickup ? 'Pickup' : 'Ship'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold whitespace-nowrap">
                        ₦{order.totalPrice.toLocaleString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={
                            order.isPaid
                              ? 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-800'
                              : 'text-xs px-2 py-1 rounded-full bg-red-100 text-red-800'
                          }
                        >
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs rounded-md px-2 py-1 capitalize border-0 ${STATUS_COLORS[order.status]}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {expandedId === order._id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {expandedId === order._id && (
                      <tr className="border-t bg-gray-50">
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">
                                {isPickup ? 'Pickup Details' : 'Shipping Address'}
                              </h4>

                              {isPickup ? (
                                <>
                                  <p className="text-sm text-gray-700">
                                    {order.shippingAddress?.pickupType || 'Store Pickup'}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {order.shippingAddress?.location}
                                  </p>
                                  <p className="text-sm text-gray-700">{order.shippingAddress?.phone}</p>

                                  {order.tracking?.readyForPickupAt ? (
                                    <p className="text-xs text-green-700 mt-2 font-medium">
                                      Ready since{' '}
                                      {new Date(order.tracking.readyForPickupAt).toLocaleString()}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-gray-500 mt-2">Not yet marked ready</p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-700">{order.shippingAddress?.address}</p>
                                  <p className="text-sm text-gray-700">{order.shippingAddress?.city}</p>
                                  <p className="text-sm text-gray-700">{order.shippingAddress?.phone}</p>
                                </>
                              )}
                            </div>

                            <div>
                              <h4 className="font-semibold text-sm mb-2">Items</h4>
                              <div className="space-y-2">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex items-center gap-3 text-sm">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-10 object-cover rounded shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="truncate">
                                        {item.name} ({item.size})
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Tracking panel — branches by delivery method */}
                          <div className="mt-6 border-t pt-4">
                            {isPickup ? (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Pickup Tracker</h4>
                                <div className="flex flex-col gap-2 max-w-md">
                                  <textarea
                                    placeholder="Note for the customer (e.g. 'Ask for Ada at the counter')"
                                    value={draft.pickupNote}
                                    onChange={(e) =>
                                      updateDraft(order._id, 'pickupNote', e.target.value)
                                    }
                                    rows={2}
                                    className="border rounded-md p-2 text-sm w-full"
                                  />
                                  <button
                                    onClick={() => handleMarkReadyForPickup(order)}
                                    disabled={savingTrackingId === order._id}
                                    className="bg-indigo-600 text-white text-sm py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 w-full sm:w-fit px-4"
                                  >
                                    {savingTrackingId === order._id
                                      ? 'Saving...'
                                      : 'Mark Ready for Pickup'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Shipping Tracker</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
                                  <input
                                    placeholder="Courier (e.g. GIG Logistics)"
                                    value={draft.courier}
                                    onChange={(e) => updateDraft(order._id, 'courier', e.target.value)}
                                    className="border rounded-md p-2 text-sm w-full"
                                  />
                                  <input
                                    placeholder="Tracking number"
                                    value={draft.trackingNumber}
                                    onChange={(e) =>
                                      updateDraft(order._id, 'trackingNumber', e.target.value)
                                    }
                                    className="border rounded-md p-2 text-sm w-full"
                                  />
                                  <input
                                    placeholder="Tracking URL"
                                    value={draft.trackingUrl}
                                    onChange={(e) =>
                                      updateDraft(order._id, 'trackingUrl', e.target.value)
                                    }
                                    className="border rounded-md p-2 text-sm w-full sm:col-span-2"
                                  />
                                  <input
                                    placeholder="Rider phone"
                                    value={draft.riderPhone}
                                    onChange={(e) =>
                                      updateDraft(order._id, 'riderPhone', e.target.value)
                                    }
                                    className="border rounded-md p-2 text-sm w-full"
                                  />
                                  <input
                                    type="date"
                                    value={draft.estimatedDelivery}
                                    onChange={(e) =>
                                      updateDraft(order._id, 'estimatedDelivery', e.target.value)
                                    }
                                    className="border rounded-md p-2 text-sm w-full"
                                  />
                                </div>
                                <button
                                  onClick={() => handleSaveShippingTracking(order)}
                                  disabled={savingTrackingId === order._id}
                                  className="mt-2 bg-sky-600 text-white text-sm py-2 px-4 rounded-md hover:bg-sky-700 disabled:opacity-50 w-full sm:w-fit"
                                >
                                  {savingTrackingId === order._id ? 'Saving...' : 'Save Tracking Info'}
                                </button>
                              </div>
                            )}
                          </div>

                          {order.paymentReference && (
                            <p className="text-xs text-gray-400 mt-4">
                              Payment ref: {order.paymentReference}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <p className="p-6 text-center text-gray-500">No orders in this category.</p>
        )}
      </div>
    </div>
  )
}

export default AdminOrders