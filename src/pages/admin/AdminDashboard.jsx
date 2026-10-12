import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAllOrders } from '../../services/orderService'
import { getProducts } from '../../services/productService'
import { getAllCustomers } from '../../services/authService'
import { resetStoreData } from '../../services/adminService'
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-white border rounded-xl p-4 sm:p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

function QuickLink({ to, title, description, icon: Icon }) {
  return (
    <Link
      to={to}
      className="group bg-white border rounded-xl p-5 flex items-start justify-between hover:border-blue-400 hover:shadow-sm transition"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition mt-1 shrink-0" />
    </Link>
  )
}

function AdminDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [productCount, setProductCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [orderData, productData, customerData] = await Promise.all([
          getAllOrders(user.token),
          getProducts(),
          getAllCustomers(user.token),
        ])
        setOrders(Array.isArray(orderData) ? orderData : [])
        setProductCount(Array.isArray(productData) ? productData.length : 0)
        setCustomerCount(Array.isArray(customerData) ? customerData.length : 0)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [user])

  const totalRevenue = orders.filter((o) => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0)
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

const [resetOpen, setResetOpen] = useState(false)
const [resetText, setResetText] = useState('')
const [resetting, setResetting] = useState(false)
const [resetResult, setResetResult] = useState(null)

async function handleReset() {
  setResetting(true)
  try {
    const result = await resetStoreData(resetText, user.token)
    setResetResult(result)
    setOrders([])
    setCustomerCount(0)
  } catch (err) {
    setResetResult({ error: err.response?.data?.message || 'Reset failed' })
  } finally {
    setResetting(false)
    setResetText('')
  }
}
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h2>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your store today.</p>
      </div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setResetOpen(true)}
          className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50"
        >
          Reset store data
        </button>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          label="Revenue"
          value={loading ? '—' : `₦${totalRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          accent="bg-green-50 text-green-600"
        />
        <StatCard
          label="Orders"
          value={loading ? '—' : orders.length}
          icon={ClipboardDocumentListIcon}
          accent="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Pending"
          value={loading ? '—' : pendingCount}
          icon={ClockIcon}
          accent="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          label="Customers"
          value={loading ? '—' : customerCount}
          icon={UsersIcon}
          accent="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Quick links */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Manage
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <QuickLink
          to="/admin/products"
          title="Products"
          description={`${productCount} product${productCount === 1 ? '' : 's'} listed`}
          icon={ShoppingBagIcon}
        />
        <QuickLink
          to="/admin/orders"
          title="Orders"
          description="View, update status, and track deliveries"
          icon={ClipboardDocumentListIcon}
        />
        <QuickLink
          to="/admin/customers"
          title="Customers"
          description={`${customerCount} registered customer${customerCount === 1 ? '' : 's'}`}
          icon={UsersIcon}
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="p-5 text-sm text-gray-500">Loading...</p>
        ) : recentOrders.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">No orders yet.</p>
        ) : (
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {order.user?.name || 'Customer'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-gray-900">
                    ₦{order.totalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {resetOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg text-red-600 mb-2">Reset store data</h3>
            <p className="text-sm text-gray-600 mb-4">
              This permanently deletes all orders and customer accounts. Products and admin accounts are
              kept. This cannot be undone. Type <b>RESET STORE</b> below to confirm.
            </p>

            {resetResult ? (
              <div className="text-sm mb-4">
                {resetResult.error ? (
                  <p className="text-red-600">{resetResult.error}</p>
                ) : (
                  <p className="text-green-700">
                    Deleted {resetResult.deleted.orders} orders, {resetResult.deleted.customers} customer accounts.
                  </p>
                )}
              </div>
            ) : (
              <input
                value={resetText}
                onChange={(e) => setResetText(e.target.value)}
                placeholder="RESET STORE"
                className="border rounded-md px-3 py-2 w-full mb-4 text-sm"
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setResetOpen(false)
                  setResetResult(null)
                  setResetText('')
                }}
                className="px-4 py-2 rounded-md text-sm border"
              >
                Close
              </button>
              {!resetResult && (
                <button
                  onClick={handleReset}
                  disabled={resetText !== 'RESET STORE' || resetting}
                  className="px-4 py-2 rounded-md text-sm bg-red-600 text-white disabled:opacity-40"
                >
                  {resetting ? 'Resetting...' : 'Confirm reset'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard