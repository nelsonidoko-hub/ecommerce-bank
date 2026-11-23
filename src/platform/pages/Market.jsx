import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MagnifyingGlassIcon, MapPinIcon, FlagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getMarketMeta, getMarketProducts, countClick, reportListing } from '../../services/marketService'
import { PLATFORM_NAME } from '../../utils/storeContext'

const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`
const SORTS = [
  ['newest', 'Newest'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
]
const REASONS = [
  ['fake', 'Fake or counterfeit'],
  ['scam', 'Looks like a scam'],
  ['offensive', 'Offensive or not allowed'],
  ['wrong-info', 'Wrong price or details'],
  ['other', 'Something else'],
]

export function ProductCard({ product, onReport }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <a href={product.url} onClick={() => countClick(product._id)} className="relative block aspect-square overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        {product.soldOut && <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-semibold text-white">Sold out</span>}
        {!product.soldOut && product.oldPrice && <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">Sale</span>}
      </a>
      <div className="flex flex-1 flex-col p-3">
        <a href={product.url} onClick={() => countClick(product._id)} className="line-clamp-2 text-sm font-medium text-slate-900 hover:text-emerald-700">
          {product.name}
        </a>
        <p className="mt-1 text-sm">
          <span className="font-semibold text-slate-900">{naira(product.price)}</span>
          {product.oldPrice && <span className="ml-1.5 text-xs text-slate-400 line-through">{naira(product.oldPrice)}</span>}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <a href={product.shop.url} className="min-w-0 truncate text-xs text-slate-500 hover:text-emerald-700">
            {product.shop.name}
            {product.shop.city && <span className="text-slate-400"> · {product.shop.city}</span>}
          </a>
          <button type="button" onClick={() => onReport(product)} className="shrink-0 text-slate-300 hover:text-rose-600" aria-label={`Report ${product.name}`} title="Report this listing">
            <FlagIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ReportBox({ product, onClose }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [state, setState] = useState('') // '', 'sending', 'sent', or an error message

  async function send(e) {
    e.preventDefault()
    setState('sending')
    try {
      await reportListing(product._id, reason, details)
      setState('sent')
    } catch (err) {
      setState(err?.response?.data?.message || 'Could not send. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Report a listing">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-poppins text-lg font-semibold text-slate-900">Report “{product.name}”</h2>
          <button type="button" onClick={onClose} aria-label="Close"><XMarkIcon className="h-5 w-5 text-slate-500" /></button>
        </div>
        {state === 'sent' ? (
          <>
            <p className="mt-4 text-sm text-slate-700">Thanks. We'll take a look.</p>
            <button type="button" onClick={onClose} className="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white">Close</button>
          </>
        ) : (
          <form onSubmit={send} className="mt-4 space-y-3">
            {REASONS.map(([id, label]) => (
              <label key={id} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" name="reason" value={id} required checked={reason === id} onChange={() => setReason(id)} className="accent-emerald-600" />
                {label}
              </label>
            ))}
            <textarea maxLength={500} rows={3} placeholder="Anything else we should know? (optional)" className="w-full rounded-lg border border-slate-300 p-2 text-sm" value={details} onChange={(e) => setDetails(e.target.value)} />
            {state && state !== 'sending' && <p className="text-sm text-rose-700">{state}</p>}
            <button type="submit" disabled={state === 'sending' || !reason} className="w-full rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {state === 'sending' ? 'Sending…' : 'Send report'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// The Market Square: browse and search products from every listed shop.
// Buying happens in the merchant's own shop.
function Market() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const city = params.get('city') || ''
  const sort = params.get('sort') || 'newest'
  const min = params.get('min') || ''
  const max = params.get('max') || ''
  const page = Number(params.get('page')) || 1

  const [meta, setMeta] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(q)
  const [range, setRange] = useState({ min, max })
  const [reporting, setReporting] = useState(null)

  useEffect(() => {
    getMarketMeta().then(setMeta).catch(() => {})
  }, [])
  useEffect(() => {
    setData(null)
    setError('')
    getMarketProducts({ q, category, city, sort, min, max, page })
      .then(setData)
      .catch(() => setError("Couldn't load products. Please try again."))
  }, [q, category, city, sort, min, max, page])

  // Changing anything except the page goes back to page 1
  const go = (next) => {
    const all = { q, category, city, sort, min, max, page: 1, ...next }
    const keep = Object.entries(all).filter(([k, v]) => v && !(k === 'page' && Number(v) === 1) && !(k === 'sort' && v === 'newest'))
    setParams(Object.fromEntries(keep.map(([k, v]) => [k, String(v)])))
    if (next.page) window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }
  const chip = (active) =>
    `whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`
  const categories = (meta?.categories || []).filter((c) => c.shops > 0)

  return (
    <section className="min-h-[70vh] bg-slate-50">
      <div className="bg-emerald-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="font-poppins text-3xl font-bold sm:text-4xl">Market Square</h1>
          <p className="mt-1 text-emerald-100">
            Shop from {meta?.shops ? `${meta.shops} independent ${meta.shops === 1 ? 'shop' : 'shops'}` : 'independent shops'} on {PLATFORM_NAME}. You pay the shop directly.
          </p>
          <form
            className="mt-6 flex max-w-2xl gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              go({ q: search.trim() })
            }}
          >
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search products"
                placeholder="Search for sneakers, ankara, phones…"
                className="w-full rounded-lg border-0 py-3 pl-10 pr-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="rounded-lg bg-slate-900 px-5 font-semibold text-white hover:bg-slate-800">Search</button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {categories.length > 0 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            <button type="button" className={chip(!category)} onClick={() => go({ category: '' })}>All</button>
            {categories.map((c) => (
              <button key={c.id} type="button" className={chip(category === c.id)} onClick={() => go({ category: c.id })}>{c.label}</button>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {meta?.cities?.length > 0 && (
            <label className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5">
              <MapPinIcon className="h-4 w-4 text-slate-400" />
              <select aria-label="City" className="bg-transparent focus:outline-none" value={city} onChange={(e) => go({ city: e.target.value })}>
                <option value="">All cities</option>
                {meta.cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </label>
          )}
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault()
              go({ min: range.min, max: range.max })
            }}
          >
            <input type="number" min={0} inputMode="numeric" aria-label="Lowest price" placeholder="Min ₦" className="w-24 rounded-lg border border-slate-300 px-2 py-1.5" value={range.min} onChange={(e) => setRange({ ...range, min: e.target.value })} />
            <span className="text-slate-400">–</span>
            <input type="number" min={0} inputMode="numeric" aria-label="Highest price" placeholder="Max ₦" className="w-24 rounded-lg border border-slate-300 px-2 py-1.5" value={range.max} onChange={(e) => setRange({ ...range, max: e.target.value })} />
            <button type="submit" className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">Go</button>
          </form>
          <select aria-label="Sort" className="ml-auto rounded-lg border border-slate-300 bg-white px-2 py-1.5" value={sort} onChange={(e) => go({ sort: e.target.value })}>
            {SORTS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </div>

        {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!data && !error && <p className="mt-10 text-center text-slate-500">Loading…</p>}
        {data && (
          <>
            <p className="mt-5 text-sm text-slate-500">
              {data.total} product{data.total === 1 ? '' : 's'}
              {q && <> for “{q}”</>}
            </p>
            {data.products.length ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {data.products.map((p) => <ProductCard key={p._id} product={p} onReport={setReporting} />)}
              </div>
            ) : (
              <div className="mt-10 text-center">
                <p className="font-medium text-slate-800">Nothing found</p>
                <p className="mt-1 text-sm text-slate-500">Try a different word, or clear the filters.</p>
                {(q || category || city || min || max) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setRange({ min: '', max: '' })
                      setParams({})
                    }}
                    className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
            {data.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3 text-sm">
                <button type="button" disabled={page <= 1} onClick={() => go({ page: page - 1 })} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40">Previous</button>
                <span className="text-slate-500">Page {data.page} of {data.pages}</span>
                <button type="button" disabled={page >= data.pages} onClick={() => go({ page: page + 1 })} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}
      </div>
      {reporting && <ReportBox product={reporting} onClose={() => setReporting(null)} />}
    </section>
  )
}

export default Market
