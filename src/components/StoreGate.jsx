import { Link, useLocation } from 'react-router-dom'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { useStoreStatus } from '../hooks/useStoreStatus'
import { platformUrl } from '../utils/storeContext'
import { TEMPLATES } from '../utils/themes'

// Pages that must work even when the shop is closed, so its owner can sign in
const ALWAYS_OPEN = ['/login', '/forgot-password', '/reset-password']

const OWNER_MESSAGES = {
  draft: "Your shop isn't published yet. Only you can see it.",
  paused: 'Your shop is paused because the subscription ended. Only you can see it until you renew.',
  suspended: 'Your shop has been switched off by the platform. Only you can see it.',
}

// Shows the shop, a "not open" page to visitors, or the shop with a preview
// bar to its owner. The server enforces the same rules; this just explains them.
function StoreGate({ children }) {
  const status = useStoreStatus()
  const { pathname } = useLocation()

  // A template demo: the real shop, plus a way to start one like it
  if (status?.isDemo) {
    const template = TEMPLATES[status.demoTemplate]
    return (
      <>
        <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-gray-900 px-4 py-2 text-center text-sm text-white">
          <span>
            You're viewing the <b>{template?.label || 'template'}</b> demo. Orders are switched off.
          </span>
          <a
            href={platformUrl(`/signup?template=${encodeURIComponent(status.demoTemplate || 'classic')}`)}
            className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-gray-100"
          >
            Start your shop with this design
          </a>
        </div>
        {children}
      </>
    )
  }

  // Still checking: show the shop as normal (no flash of a closed page)
  if (!status) return children
  // Live: the owner (or staff) gets a button back to the admin, on every page
  if (status.live) {
    if (!status.manage || pathname.startsWith('/admin')) return children
    return (
      <>
        {children}
        <Link
          to="/admin"
          className="fixed bottom-4 left-4 z-[60] inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-gray-800"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
          Manage shop
        </Link>
      </>
    )
  }
  if (ALWAYS_OPEN.some((path) => pathname.startsWith(path))) return children

  if (status.manage) {
    return (
      <>
        <div className="sticky top-0 z-[60] bg-gray-900 px-4 py-2 text-center text-sm text-white">
          <span className="font-semibold">Preview.</span>{' '}
          {OWNER_MESSAGES[status.manage.state] || 'Only you can see your shop right now.'}{' '}
          <Link to="/admin" className="underline">
            Go to admin
          </Link>
        </div>
        {children}
      </>
    )
  }

  const missing = status.state === 'missing'
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center font-epilogue">
      <h1 className="font-poppins text-3xl font-bold text-gray-900">
        {missing ? 'Shop not found' : status.state === 'unavailable' ? 'This shop is unavailable' : 'Opening soon'}
      </h1>
      <p className="mt-3 max-w-md text-gray-600">
        {missing
          ? "There's no shop at this address. Check the link and try again."
          : `${status.name || 'This shop'} isn't open right now. Please check back soon.`}
      </p>
      {!missing && (
        <Link to="/login" className="mt-8 text-sm text-gray-500 underline">
          Shop owner? Sign in
        </Link>
      )}
    </main>
  )
}

export default StoreGate
