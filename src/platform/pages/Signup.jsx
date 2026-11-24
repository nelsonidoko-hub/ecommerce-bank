import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ShopFields, { inputClass } from '../components/ShopFields'
import { signup, saveAccount, adminLink, errorMessage } from '../../services/platformService'
import { PLATFORM_NAME } from '../../utils/storeContext'

const isTemplateId = (id) => typeof id === 'string' && /^[a-z][a-z0-9-]{1,29}$/.test(id)

// Account + first shop in one form. On success the merchant lands straight in
// their new shop's admin, already wearing the chosen template.
function Signup() {
  const [params] = useSearchParams()
  // Built-in or Template Studio; the server falls back to Classic if unknown
  const initialTemplate = isTemplateId(params.get('template')) ? params.get('template') : 'classic'

  const [account, setAccount] = useState({ name: '', email: '', password: '' })
  const [shop, setShop] = useState({ shopName: '', slug: '', template: initialTemplate })
  const [slugReady, setSlugReady] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy('Creating your shop…')
    try {
      const result = await signup({ ...account, ...shop, acceptTerms: agreed })
      saveAccount(result.account)
      setBusy('Opening your shop…')
      const { url } = await adminLink(result.shop._id)
      window.location.assign(url)
    } catch (err) {
      const data = err?.response?.data
      if (data?.field === 'slug' && data.suggestion) setShop((s) => ({ ...s, slug: data.suggestion }))
      setError(errorMessage(err))
      setBusy('')
    }
  }

  const set = (field) => (e) => setAccount({ ...account, [field]: e.target.value })

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-poppins text-3xl font-bold text-slate-900">Start your shop</h1>
      <p className="mt-2 text-slate-600">
        Free to build and preview. Your shop stays private until you publish it.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-10">
        <fieldset className="space-y-5">
          <legend className="mb-4 font-poppins text-lg font-semibold text-slate-900">1. About you</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-800">Your name</label>
              <input id="name" className={inputClass} required maxLength={80} autoComplete="name" value={account.name} onChange={set('name')} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">Email</label>
              <input id="email" type="email" className={inputClass} required autoComplete="email" value={account.email} onChange={set('email')} />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-800">Password</label>
            <input id="password" type="password" className={inputClass} required minLength={8} maxLength={72} autoComplete="new-password" value={account.password} onChange={set('password')} />
            <p className="mt-1.5 text-xs text-slate-500">At least 8 characters.</p>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 font-poppins text-lg font-semibold text-slate-900">2. Your shop</legend>
          <ShopFields value={shop} onChange={setShop} onReady={setSlugReady} />
        </fieldset>

        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-emerald-600" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>
            I agree to the {PLATFORM_NAME}{' '}
            <Link to="/terms" target="_blank" className="font-semibold text-emerald-700 underline">Terms of Service</Link> and{' '}
            <Link to="/acceptable-use" target="_blank" className="font-semibold text-emerald-700 underline">Acceptable Use Policy</Link>.
          </span>
        </label>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={Boolean(busy) || !slugReady || !agreed}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy || 'Create my shop'}
          </button>
          <p className="mt-3 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-emerald-700">Log in</Link>
          </p>
        </div>
      </form>
    </section>
  )
}

export default Signup
