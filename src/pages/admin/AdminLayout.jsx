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
  PhotoIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
  HomeIcon,
  TicketIcon,
  DocumentTextIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: Squares2X2Icon, end: true },
  { label: 'Products', to: '/admin/products', icon: ShoppingBagIcon },
  { label: 'Categories', to: '/admin/categories', icon: FolderIcon },
  { label: 'Logo Settings', to: '/admin/logo', icon: PhotoIcon },
  { label: 'Orders', to: '/admin/orders', icon: ClipboardDocumentListIcon },
  { label: 'Customers', to: '/admin/customers', icon: UsersIcon },
  { label: 'Hero Banner', to: '/admin/hero', icon: VideoCameraIcon },
  { label: 'Homepage', to: '/admin/homepage', icon: HomeIcon },
  { label: 'Discounts', to: '/admin/discounts', icon: TicketIcon },
  { label: 'Pages', to: '/admin/pages', icon: DocumentTextIcon },
  { label: 'Payments', to: '/admin/payments', icon: CreditCardIcon },
  { label: 'Settings', to: '/admin/settings', icon: Cog6ToothIcon },
]

function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function isActive(item) {
    return item.end
      ? location.pathname === item.to
      : location.pathname === item.to ||
          location.pathname.startsWith(`${item.to}/`)
  }

  function handleLogout() {
    logout()
    setSidebarOpen(false)
    navigate('/login', { replace: true })
  }

  const currentPage =
    NAV_ITEMS.find(isActive)?.label || 'Admin'

  const SidebarContent = (
    <div className="flex h-full flex-col">
      {/* Sidebar branding */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-5">
        <Link to="/" aria-label="Abuja Store home">
          <img
            src={yl}
            alt="Abuja Store"
            className="h-7 w-auto object-contain"
          />
        </Link>

        <span className="rounded bg-gray-800 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-300">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Admin navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item)

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="space-y-1 border-t border-gray-800 px-3 pb-4 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5 shrink-0" />
          View Storefront
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-300 transition hover:bg-red-600 hover:text-white"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-gray-900 lg:flex">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 w-64 bg-gray-900 shadow-xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="absolute right-[-44px] top-4 rounded-r-lg bg-gray-900 p-2 text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="-ml-1.5 rounded-md p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                {currentPage}
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Abuja Store Administration
              </p>
            </div>
          </div>

          {/* Admin profile */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>

            <div className="hidden sm:block">
              <p className="max-w-40 truncate text-sm font-medium text-gray-800">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-xs capitalize text-gray-500">
                {user?.role || 'Admin'}
              </p>
            </div>
          </div>
        </header>

        {/* Nested admin page */}
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout