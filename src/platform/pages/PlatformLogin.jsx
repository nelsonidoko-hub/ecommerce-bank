import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { inputClass } from '../components/ShopFields'
import { login, saveAccount, errorMessage } from '../../services/platformService'

// Merchant login on the platform site; leads to "My shops"
function PlatformLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      saveAccount(await login(email, password))
      navigate('/dashboard')
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-poppins text-3xl font-bold text-slate-900">Log in</h1>
      <p className="mt-2 text-slate-600">To manage your shops.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">Email</label>
          <input id="email" type="email" required autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-800">Password</label>
          <input id="password" type="password" required autoComplete="current-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
          {busy ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-center text-sm text-slate-500">
          New here? <Link to="/signup" className="font-semibold text-emerald-700">Start a shop free</Link>
        </p>
        <p className="text-center text-sm">
          <Link to="/forgot-password" className="text-slate-500 hover:text-slate-900">Forgot your password?</Link>
        </p>
      </form>
    </section>
  )
}

export default PlatformLogin
