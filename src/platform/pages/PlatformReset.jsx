import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { inputClass } from '../components/ShopFields'
import { resetPassword, saveAccount, errorMessage } from '../../services/platformService'

// From the reset email: choose a new password, then straight to "My shops"
function PlatformReset() {
  const { token } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [needsTerms, setNeedsTerms] = useState(false)
  // A shop made for you by the platform (invite email): you agree to the terms here
  const invite = params.get('invite') === '1'
  const askTerms = invite || needsTerms
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) return setError("The two passwords don't match.")
    setBusy(true)
    setError('')
    try {
      saveAccount(await resetPassword(token, password, askTerms && agreed))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err?.response?.data?.field === 'terms') setNeedsTerms(true)
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-poppins text-3xl font-bold text-slate-900">{invite ? 'Welcome! Choose your password' : 'Choose a new password'}</h1>
      {invite && <p className="mt-2 text-slate-600">Your shop is ready. Set a password to open it.</p>}
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
        {askTerms && (
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-emerald-600" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              I agree to the <Link to="/terms" target="_blank" className="font-semibold text-emerald-700 underline">Terms of Service</Link> and{' '}
              <Link to="/acceptable-use" target="_blank" className="font-semibold text-emerald-700 underline">Acceptable Use Policy</Link>.
            </span>
          </label>
        )}
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
