import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { getShop, shopAction } from '../../../services/founderService'
import { errorMessage } from '../../../services/platformService'
import { FounderOnly, StateChip, ACTION_LABELS, REPORT_REASONS, naira, day } from './shared'

const inputSm = 'w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm'
const btn = 'rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-50'

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{children}</dd>
    </div>
  )
}

// The shop in the Market Square: status, hide/show, shoppers' reports
function MarketBox({ s, busy, act, hideReason, setHideReason }) {
  const m = s.market
  const open = m.reports.filter((r) => r.status === 'open').length
  const status = m.hidden ? `Hidden: ${m.hiddenReason}` : m.shown ? 'Showing' : m.listed ? 'Switched on, not showing (shop not live or plan not allowed)' : 'Not listed'
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-poppins text-sm font-semibold text-slate-900">Market Square</h2>
          <p className="mt-1 text-sm text-slate-600">
            {status}
            {m.category && <span className="text-slate-400"> · {m.category}{m.city ? `, ${m.city}` : ''}</span>}
          </p>
        </div>
        {m.hidden ? (
          <button type="button" disabled={Boolean(busy)} onClick={() => act('market-unhide', {}, 'Shown in the Market Square again.')} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
            {busy === 'market-unhide' ? 'Saving…' : 'Show again'}
          </button>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              act('market-hide', { reason: hideReason }, 'Hidden from the Market Square. The shop itself still works.').then(() => setHideReason(''))
            }}
          >
            <input required maxLength={300} aria-label="Reason for hiding" placeholder="Reason (the owner sees it)" className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" value={hideReason} onChange={(e) => setHideReason(e.target.value)} />
            <button type="submit" disabled={Boolean(busy)} className={`${btn} border border-rose-300 text-rose-700 hover:bg-rose-50`}>{busy === 'market-hide' ? 'Hiding…' : 'Hide from market'}</button>
          </form>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-800">Shoppers' reports{open ? ` (${open} open)` : ''}</h3>
        {open > 0 && (
          <button type="button" disabled={Boolean(busy)} onClick={() => act('close-reports', {}, 'Reports marked as dealt with.')} className="text-sm font-medium text-slate-600 underline disabled:opacity-50">
            Mark all dealt with
          </button>
        )}
      </div>
      {m.reports.length ? (
        <ul className="mt-2 divide-y divide-slate-100 text-sm">
          {m.reports.map((r) => (
            <li key={r._id} className={`flex justify-between gap-3 py-2 ${r.status === 'closed' ? 'opacity-50' : ''}`}>
              <span className="min-w-0">
                {r.productName} <span className="text-rose-700">· {REPORT_REASONS[r.reason] || r.reason}</span>
                {r.details && <span className="text-slate-400"> · {r.details}</span>}
              </span>
              <span className="shrink-0 text-slate-500">{day(r.createdAt)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-400">None.</p>
      )}
    </section>
  )
}

// One shop, with the founder's tools: suspend/restore, trial, free months, plan
function ShopDetail() {
  const { id } = useParams()
  const [s, setS] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState('')
  const [reason, setReason] = useState('')
  const [days, setDays] = useState(7)
  const [months, setMonths] = useState(1)
  const [hideReason, setHideReason] = useState('')

  useEffect(() => {
    getShop(id).then(setS).catch((err) => setError(errorMessage(err, 'Could not load this shop.')))
  }, [id])

  async function act(action, extra, done) {
    setBusy(action)
    setError('')
    setNotice('')
    try {
      setS(await shopAction(id, action, extra))
      setNotice(done)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy('')
    }
  }

  if (!s) {
    return error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : <p className="text-slate-500">Loading…</p>
  }
  const published = Boolean(s.publishedAt)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-poppins text-2xl font-bold text-slate-900">{s.name}</h1>
            <StateChip state={s.state} />
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">{s.plan}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{s.ownerName} · {s.ownerEmail}</p>
        </div>
        <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Open shop <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
      </div>

      {notice && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {s.state === 'suspended' && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Suspended: {s.suspendedReason}. Customers see "this shop is unavailable"; the owner sees this reason.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-poppins text-sm font-semibold text-slate-900">Details</h2>
          <dl className="mt-2 divide-y divide-slate-100">
            <Row label="Address">{s.url.replace(/^https?:\/\//, '')}</Row>
            <Row label="Own domain">{s.domain ? `${s.domain.name} ${s.domain.verified ? (s.domain.hosting === 'added' ? '(live)' : `(verified, hosting: ${s.domain.hosting || 'not set up'})`) : '(not verified)'}` : '—'}</Row>
            <Row label="Created">{day(s.createdAt)}</Row>
            <Row label="Published">{day(s.publishedAt)}</Row>
            <Row label="Trial ends">{day(s.trialEndsAt)}</Row>
            <Row label="Paid until">{day(s.currentPeriodEnd)}</Row>
            <Row label="Auto-renew">{s.autoRenew ? `On${s.card ? ` · ${s.card}` : ' · no card saved'}` : 'Off'}</Row>
            <Row label="Products / orders">{s.counts.products} / {s.counts.orders} ({s.counts.paidOrders} paid)</Row>
          </dl>
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-poppins text-sm font-semibold text-slate-900">Actions</h2>

          {s.state === 'suspended' ? (
            <div>
              <button type="button" disabled={Boolean(busy)} onClick={() => act('unsuspend', {}, 'Shop restored.')} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
                {busy === 'unsuspend' ? 'Restoring…' : 'Restore shop'}
              </button>
            </div>
          ) : (
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (window.confirm(`Suspend ${s.name}? Customers won't be able to see it.`)) act('suspend', { reason }, 'Shop suspended.').then(() => setReason(''))
              }}
            >
              <label htmlFor="reason" className="block text-sm text-slate-700">Suspend (the owner sees the reason)</label>
              <div className="flex gap-2">
                <input id="reason" required maxLength={300} placeholder="e.g. Selling counterfeit goods" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" value={reason} onChange={(e) => setReason(e.target.value)} />
                <button type="submit" disabled={Boolean(busy)} className={`${btn} bg-red-600 text-white hover:bg-red-700`}>{busy === 'suspend' ? 'Suspending…' : 'Suspend'}</button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-700">Extend trial by</span>
            <input type="number" min={1} max={60} aria-label="Days" className={inputSm} value={days} onChange={(e) => setDays(e.target.value)} />
            <span className="text-sm text-slate-700">days</span>
            <button type="button" disabled={Boolean(busy) || !published} onClick={() => act('extend-trial', { days: Number(days) }, `Trial extended by ${days} days.`)} className={`${btn} border border-slate-300 text-slate-800 hover:bg-slate-50`}>
              {busy === 'extend-trial' ? 'Saving…' : 'Extend'}
            </button>
            {!published && <span className="w-full text-xs text-slate-400">Only after the shop is published.</span>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-700">Give</span>
            <input type="number" min={1} max={12} aria-label="Months" className={inputSm} value={months} onChange={(e) => setMonths(e.target.value)} />
            <span className="text-sm text-slate-700">free month(s)</span>
            <button type="button" disabled={Boolean(busy)} onClick={() => act('free-months', { months: Number(months) }, `${months} free month(s) added.`)} className={`${btn} border border-slate-300 text-slate-800 hover:bg-slate-50`}>
              {busy === 'free-months' ? 'Saving…' : 'Give'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-700">Plan</span>
            {['basic', 'pro'].map((p) => (
              <button
                key={p}
                type="button"
                disabled={Boolean(busy) || s.plan === p}
                onClick={() => act('plan', { plan: p }, `Plan set to ${p}. No charge was made.`)}
                className={`${btn} capitalize ${s.plan === p ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-800 hover:bg-slate-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>
      </div>

      {s.market && <MarketBox s={s} busy={busy} act={act} hideReason={hideReason} setHideReason={setHideReason} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-poppins text-sm font-semibold text-slate-900">Payments to the platform</h2>
          {s.payments.length ? (
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {s.payments.map((p) => (
                <li key={p.reference} className="flex justify-between gap-3 py-2">
                  <span className="capitalize text-slate-700">
                    {p.kind === 'gift' ? 'Free months (gift)' : `${p.plan} ${p.kind}`}
                    {p.status === 'failed' && <span className="normal-case text-red-600"> · failed{p.reason ? `: ${p.reason}` : ''}</span>}
                  </span>
                  <span className="shrink-0 text-slate-500">{p.kind === 'gift' ? '' : naira(p.amount)} {day(p.date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-400">None yet.</p>
          )}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-poppins text-sm font-semibold text-slate-900">Founder actions on this shop</h2>
          {s.actions.length ? (
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {s.actions.map((a) => (
                <li key={a._id} className="flex justify-between gap-3 py-2">
                  <span className="text-slate-700">{ACTION_LABELS[a.action] || a.action}{a.details && <span className="text-slate-400"> · {a.details}</span>}</span>
                  <span className="shrink-0 text-slate-500">{day(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-400">None.</p>
          )}
        </section>
      </div>
    </div>
  )
}

function FounderShop() {
  return (
    <FounderOnly>
      <section className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Link to="/founder?tab=shops" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
            <ArrowLeftIcon className="h-4 w-4" /> All shops
          </Link>
          <ShopDetail />
        </div>
      </section>
    </FounderOnly>
  )
}

export default FounderShop
