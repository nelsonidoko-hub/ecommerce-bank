import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { exchangeCode } from '../../services/authService'
import { loadStoreStatus } from '../../hooks/useStoreStatus'
import { platformUrl } from '../../utils/storeContext'

// Landing spot for "Manage" / "View shop" on the platform site. The link
// carries a one-time code; this swaps it for a login on this shop, then
// removes it from the address bar.
function AdminWelcome() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [error, setError] = useState('')
  const started = useRef(false)

  useEffect(() => {
    // React's development mode runs effects twice; the code only works once
    if (started.current) return
    started.current = true

    const code = params.get('code')
    const next = params.get('next') === 'shop' ? '/' : '/admin'
    if (!code) {
      navigate('/admin', { replace: true })
      return
    }
    exchangeCode(code)
      .then(async (user) => {
        signIn(user)
        await loadStoreStatus(true)
        navigate(next, { replace: true })
      })
      .catch((err) => setError(err?.response?.data?.message || 'This sign-in link is invalid or has expired.'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center font-epilogue">
      {error ? (
        <>
          <h1 className="font-poppins text-2xl font-bold text-gray-900">Couldn't sign you in</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6 flex gap-4">
            <a href={platformUrl('/dashboard')} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
              Back to my shops
            </a>
            <button type="button" onClick={() => navigate('/login')} className="text-sm text-gray-600 underline">
              Log in here instead
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          <p className="mt-4 text-gray-600">Opening your shop…</p>
        </>
      )}
    </main>
  )
}

export default AdminWelcome
