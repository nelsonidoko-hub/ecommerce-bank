import { useState } from 'react'
import { Link } from 'react-router-dom'
import { inputClass } from '../components/ShopFields'
import { forgotPassword, errorMessage } from '../../services/platformService'

// Merchant forgot password (for the account that owns the shops)
function PlatformForgot() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-poppins text-3xl font-bold text-slate-900">Forgot your password?</h1>
      {sent ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            If that email has an account, we've sent a link to reset your password. It works once and expires in 30 minutes.
          </p>
          <p className="text-sm text-slate-500">No email? Check your spam folder, or <button type="button" className="font-semibold text-emerald-700" onClick={() => setSent(false)}>try again</button>.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <p className="text-slate-600">Enter the email you signed up with and we'll send you a reset link.</p>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">Email</label>
            <input id="email" type="email" required autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-emerald-700">Back to log in</Link>
      </p>
    </section>
  )
}

export default PlatformForgot
