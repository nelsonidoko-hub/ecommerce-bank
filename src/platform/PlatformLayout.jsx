import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { PLATFORM_NAME } from '../utils/storeContext'
import { getAccount, saveAccount } from '../services/platformService'

// The platform's own site: header, page, footer. Its look is fixed (it never
// takes a shop's template), so it uses plain colours, not the store theme.
export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-poppins text-lg font-bold text-slate-900 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm text-white">
        {PLATFORM_NAME.slice(0, 1).toUpperCase()}
      </span>
      {PLATFORM_NAME}
    </span>
  )
}

const navClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-emerald-700' : 'text-slate-600 hover:text-slate-900'}`

function PlatformLayout() {
  const [open, setOpen] = useState(false)
  const account = getAccount()
  const navigate = useNavigate()

  function logout() {
    saveAccount(null)
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white font-epilogue text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label={`${PLATFORM_NAME} home`} onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/market" className={navClass}>Market</NavLink>
            <NavLink to="/templates" className={navClass}>Templates</NavLink>
            <a href="/#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</a>
            {account ? (
              <>
                <NavLink to="/dashboard" className={navClass}>My shops</NavLink>
                {account.role === 'superadmin' && <NavLink to="/founder" className={navClass}>Founder</NavLink>}
                <button type="button" onClick={logout} className="text-sm text-slate-500 hover:text-slate-900">Log out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>Log in</NavLink>
                <Link to="/signup" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  Start free
                </Link>
              </>
            )}
          </nav>

          <button type="button" className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 md:hidden">
            <Link to="/market" onClick={() => setOpen(false)}>Market Square</Link>
            <Link to="/templates" onClick={() => setOpen(false)}>Templates</Link>
            <a href="/#pricing" onClick={() => setOpen(false)}>Pricing</a>
            {account ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}>My shops</Link>
                {account.role === 'superadmin' && <Link to="/founder" onClick={() => setOpen(false)}>Founder</Link>}
                <button type="button" onClick={logout} className="text-left text-slate-500">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="rounded-lg bg-emerald-600 px-4 py-2 text-center font-semibold text-white">
                  Start free
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo className="text-base" />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/market" className="hover:text-slate-900">Market Square</Link>
            <Link to="/templates" className="hover:text-slate-900">Templates</Link>
            <a href="/#pricing" className="hover:text-slate-900">Pricing</a>
            <Link to="/login" className="hover:text-slate-900">Log in</Link>
            <Link to="/terms" className="hover:text-slate-900">Terms</Link>
            <Link to="/acceptable-use" className="hover:text-slate-900">Acceptable use</Link>
          </div>
          <p>© {new Date().getFullYear()} {PLATFORM_NAME}</p>
        </div>
      </footer>
    </div>
  )
}

export default PlatformLayout
