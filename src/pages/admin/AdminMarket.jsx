import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline'
import { getMarketSettings, saveMarketSettings } from '../../services/marketService'
import { platformUrl } from '../../utils/storeContext'

const message = (err, fallback) => err?.response?.data?.message || fallback

// List the shop's products in the platform's Market Square (free)
function AdminMarket() {
  const [m, setM] = useState(null)
  const [form, setForm] = useState({ category: '', city: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    getMarketSettings()
      .then((data) => {
        setM(data)
        setForm({ category: data.category, city: data.city })
      })
      .catch((err) => setError(message(err, "Couldn't load your Market Square settings.")))
  }, [])

  async function save(values, done) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await saveMarketSettings(values)
      setM(data)
      setForm({ category: data.category, city: data.city })
      setNotice(done)
    } catch (err) {
      setError(message(err, 'Could not save. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  if (!m) return <p className="p-2 text-sm text-gray-500">{error || 'Loading…'}</p>
  const changed = form.category !== m.category || form.city !== m.city

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Market Square</h1>
        <p className="mt-1 text-sm text-gray-500">
          Show your products to shoppers browsing every shop on the platform. It's free. Shoppers who tap a product come
          straight to your shop and pay you as usual.{' '}
          <a href={platformUrl('/market')} target="_blank" rel="noreferrer" className="font-medium text-gray-900 underline">See the Market Square</a>
        </p>
      </div>

      {notice && <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <BuildingStorefrontIcon className="mt-0.5 h-6 w-6 shrink-0 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">List my products in the Market Square</p>
              <p className="mt-0.5 text-sm text-gray-500">
                {m.shown
                  ? `Live: ${m.productsShown} product${m.productsShown === 1 ? '' : 's'} showing.`
                  : m.listed
                    ? `Not showing: ${m.reason}`
                    : 'Off. Turn it on to be found by more shoppers.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={m.listed}
            aria-label="List my products in the Market Square"
            disabled={busy}
            onClick={() => save({ listed: !m.listed, ...form }, m.listed ? 'Removed from the Market Square.' : 'You are in the Market Square.')}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${m.listed ? 'bg-green-600' : 'bg-gray-300'} disabled:opacity-50`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${m.listed ? 'left-[1.375rem]' : 'left-0.5'}`} />
          </button>
        </div>
        {m.needsPro && (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            The Market Square is part of the Pro plan. <Link to="/admin/billing" className="font-semibold underline">See plans</Link>
          </p>
        )}
      </section>

      <form
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault()
          save(form, 'Saved.')
        }}
      >
        <div>
          <label htmlFor="mcat" className="block text-sm font-medium text-gray-800">What does your shop sell?</label>
          <select id="mcat" required className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Choose a category</option>
            {m.categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="mcity" className="block text-sm font-medium text-gray-800">City</label>
          <input id="mcity" maxLength={40} placeholder="e.g. Abuja" className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <p className="mt-1 text-xs text-gray-500">Shoppers can filter by city. Leave empty if you deliver everywhere.</p>
        </div>
        <button type="submit" disabled={busy || !changed} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? 'Saving…' : 'Save'}
        </button>
      </form>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">Visits from the Market Square (last 30 days)</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">{m.visits30}</p>
        <p className="mt-2 text-xs text-gray-500">
          Tips: clear photos and real prices get more taps. Only products with a photo and a price above ₦0 are shown;
          sample products never are.
        </p>
      </section>
    </div>
  )
}

export default AdminMarket
