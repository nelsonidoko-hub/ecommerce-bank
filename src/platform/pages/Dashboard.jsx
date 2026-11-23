import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { getAccount, getMe, adminLink, saveAccount, errorMessage } from '../../services/platformService'

const STATE = {
  draft: ['Draft', 'bg-slate-100 text-slate-700', 'Only you can see it. Publish when ready.'],
  trial: ['Free trial', 'bg-emerald-100 text-emerald-800', 'Live. Free until'],
  active: ['Live', 'bg-emerald-100 text-emerald-800', 'Paid until'],
  grace: ['Payment overdue', 'bg-amber-100 text-amber-800', 'Still live until'],
  paused: ['Paused', 'bg-red-100 text-red-700', 'Hidden from customers until you renew.'],
  suspended: ['Suspended', 'bg-red-100 text-red-700', 'Switched off by the platform. Contact support.'],
}
const day = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })

// "My shops": every shop the merchant runs, with a one-click way into each
function Dashboard() {
  const account = getAccount()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [opening, setOpening] = useState('')

  useEffect(() => {
    if (!account) return
    getMe()
      .then(setData)
      .catch((err) => {
        if (err?.response?.status === 401) saveAccount(null)
        setError(errorMessage(err, 'Could not load your shops.'))
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!account) return <Navigate to="/login" replace />

  async function open(shop, next) {
    setOpening(`${shop._id}:${next}`)
    try {
      const { url } = await adminLink(shop._id, next)
      window.location.assign(url)
    } catch (err) {
      setError(errorMessage(err))
      setOpening('')
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-poppins text-3xl font-bold text-slate-900">My shops</h1>
          <p className="mt-1 text-slate-600">Hello {data?.account.name || account.name}.</p>
        </div>
        {data && data.shops.length < data.maxShops && (
          <Link to="/new-shop" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            <PlusIcon className="h-4 w-4" /> New shop
          </Link>
        )}
      </div>

      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!data && !error && <p className="mt-10 text-slate-500">Loading your shops…</p>}

      {data && data.shops.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-600">You don't have a shop yet.</p>
          <Link to="/new-shop" className="mt-4 inline-block font-semibold text-emerald-700">Create your first shop →</Link>
        </div>
      )}

      <ul className="mt-8 space-y-4">
        {data?.shops.map((shop) => {
          const [label, chip, note] = STATE[shop.state] || STATE.draft
          return (
            <li key={shop._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-poppins text-lg font-semibold text-slate-900">{shop.name}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip}`}>{label}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">{shop.plan}</span>
                  {!shop.isOwner && <span className="text-xs text-slate-500">Staff</span>}
                </div>
                <p className="mt-1 truncate text-sm text-slate-500">{shop.url.replace(/^https?:\/\//, '').replace(/[?&]store=.*$/, '')}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {note}
                  {shop.until && ['trial', 'active', 'grace'].includes(shop.state) ? ` ${day(shop.until)}.` : ''}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => open(shop, 'shop')}
                  disabled={Boolean(opening)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {opening === `${shop._id}:shop` ? 'Opening…' : 'View shop'}
                </button>
                <button
                  type="button"
                  onClick={() => open(shop, 'admin')}
                  disabled={Boolean(opening)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {opening === `${shop._id}:admin` ? 'Opening…' : 'Manage'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default Dashboard
