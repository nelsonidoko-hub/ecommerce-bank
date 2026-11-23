import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import ShopFields from '../components/ShopFields'
import { TEMPLATES } from '../../utils/themes'
import { getAccount, createShop, adminLink, errorMessage, getMyDesigns } from '../../services/platformService'

// Another shop for a merchant who already has an account
function NewShop() {
  const [params] = useSearchParams()
  const [shop, setShop] = useState({
    shopName: '',
    slug: '',
    template: TEMPLATES[params.get('template')] ? params.get('template') : 'classic',
  })
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  // Their own saved templates (Pro): start the new shop from one of them
  const [mine, setMine] = useState({ canUse: false, designs: [] })
  const [designId, setDesignId] = useState('')
  useEffect(() => {
    if (getAccount()) getMyDesigns().then(setMine).catch(() => {})
  }, [])

  if (!getAccount()) return <Navigate to={`/signup${params.get('template') ? `?template=${params.get('template')}` : ''}`} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy('Creating your shop…')
    try {
      const { shop: made } = await createShop({ ...shop, designId: designId || undefined })
      setBusy('Opening your shop…')
      const { url } = await adminLink(made._id)
      window.location.assign(url)
    } catch (err) {
      const data = err?.response?.data
      if (data?.field === 'slug' && data.suggestion) setShop((s) => ({ ...s, slug: data.suggestion }))
      setError(errorMessage(err))
      setBusy('')
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-poppins text-3xl font-bold text-slate-900">New shop</h1>
      <p className="mt-2 text-slate-600">It starts as a private draft with sample products, so you can see the design straight away.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {mine.designs.length > 0 && (
          <div>
            <label htmlFor="designId" className="mb-1.5 block text-sm font-medium text-slate-800">Start from one of your templates</label>
            <select
              id="designId"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              value={designId}
              disabled={!mine.canUse}
              onChange={(e) => setDesignId(e.target.value)}
            >
              <option value="">No, use a template below</option>
              {mine.designs.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}{d.fromStoreName ? ` (from ${d.fromStoreName})` : ''}
                </option>
              ))}
            </select>
            {!mine.canUse && <p className="mt-1 text-xs text-slate-500">Needs one of your shops on Pro.</p>}
          </div>
        )}
        <ShopFields value={shop} onChange={setShop} onReady={setReady} showTemplates={!designId} />
        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={Boolean(busy) || !ready}
          className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy || 'Create shop'}
        </button>
      </form>
    </section>
  )
}

export default NewShop
