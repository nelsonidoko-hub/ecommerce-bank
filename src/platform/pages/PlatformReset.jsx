import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { inputClass } from '../components/ShopFields'
import { resetPassword, saveAccount, errorMessage } from '../../services/platformService'

// From the reset email: choose a new password, then straight to "My shops"
function PlatformReset() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) return setError("The two passwords don't match.")
    setBusy(true)
    setError('')
    try {
      saveAccount(await resetPassword(token, password))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-poppins text-3xl font-bold text-slate-900">Choose a new password</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-800">New password</label>
          <input id="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="mt-1.5 text-xs text-slate-500">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-800">Type it again</label>
          <input id="confirm" type="password" required autoComplete="new-password" className={inputClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}{' '}
            {/expired|invalid/i.test(error) && <Link to="/forgot-password" className="font-semibold underline">Get a new link</Link>}
          </p>
        )}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
          {busy ? 'Saving…' : 'Save and log in'}
        </button>
      </form>
    </section>
  )
}

export default PlatformReset
