import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import yl from '../../assets/img/yl_png_logo.avif'
import {
  Squares2X2Icon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  FolderIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: Squares2X2Icon, end: true },
  { label: 'Products', to: '/admin/products', icon: ShoppingBagIcon },
  { label: 'Categories', to: '/admin/categories', icon: FolderIcon },
  { label: 'Orders', to: '/admin/orders', icon: ClipboardDocumentListIcon },
  { label: 'Customers', to: '/admin/customers', icon: UsersIcon },
]

function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function isActive(item) {
    return item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-800">
        <img src={yl} alt="Logo" className="h-6" />
        <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4 space-y-1 border-t border-gray-800 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5 shrink-0" />
          View Storefront
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )

  const currentPage = NAV_ITEMS.find(isActive)?.label || 'Admin'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-gray-900">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-gray-900">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-[-44px] bg-gray-900 text-white p-2 rounded-r-lg"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-gray-600"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">{currentPage}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden sm:block text-sm text-gray-600">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout