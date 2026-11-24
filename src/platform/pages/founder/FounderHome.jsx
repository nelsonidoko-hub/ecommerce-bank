import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { getOverview, listShops, listTeam, addDesigner, removeDesigner } from '../../../services/founderService'
import { errorMessage, saveAccount } from '../../../services/platformService'
import { FounderOnly, StateChip, STATES, ACTION_LABELS, REPORT_REASONS, naira, day } from './shared'

function Card({ label, value, note }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-poppins text-2xl font-bold text-slate-900">{value}</p>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
    </div>
  )
}

function List({ title, empty, children }) {
  const items = [children].flat().filter(Boolean)
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-poppins text-sm font-semibold text-slate-900">{title}</h2>
      {items.length ? <ul className="mt-3 divide-y divide-slate-100 text-sm">{items}</ul> : <p className="mt-3 text-sm text-slate-400">{empty}</p>}
    </section>
  )
}

const shopLink = (id, name) => <Link to={`/founder/shops/${id}`} className="font-medium text-slate-900 hover:text-emerald-700">{name || 'Shop'}</Link>

function Overview() {
  const [o, setO] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    getOverview()
      .then(setO)
      .catch((err) => {
        if (err?.response?.status === 401) saveAccount(null)
        setError(errorMessage(err, 'Could not load the overview.'))
      })
  }, [])

  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
  if (!o) return <p className="text-slate-500">Loading…</p>
  const change = o.income.lastMonth ? Math.round(((o.income.thisMonth - o.income.lastMonth) / o.income.lastMonth) * 100) : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card label="Income this month" value={naira(o.income.thisMonth)} note={change === null ? `Last month ${naira(o.income.lastMonth)}` : `${change >= 0 ? '+' : ''}${change}% on last month (${naira(o.income.lastMonth)})`} />
        <Card label="Monthly recurring" value={naira(o.income.monthlyRecurring)} note="Paying + overdue shops at plan price" />
        <Card label="Shops" value={o.shops} note={`${o.newThisWeek} new this week`} />
        <Card label="Paying" value={o.states.active} note={`${o.states.trial} on trial · ${o.states.grace} overdue`} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {Object.keys(STATES).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1">
            <StateChip state={s} /> <span className="font-semibold text-slate-700">{o.states[s] || 0}</span>
          </span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <List title="Trials ending in 3 days" empty="None right now.">
          {o.trialsEnding.map((s) => (
            <li key={s._id} className="flex justify-between gap-3 py-2">
              <span className="min-w-0 truncate">{shopLink(s._id, s.name)} <span className="text-slate-400">· {s.ownerEmail}</span></span>
              <span className="shrink-0 text-slate-500">{day(s.until)}</span>
            </li>
          ))}
        </List>
        <List title="Overdue (in grace period)" empty="No overdue shops.">
          {o.overdue.map((s) => (
            <li key={s._id} className="flex justify-between gap-3 py-2">
              <span className="min-w-0 truncate">{shopLink(s._id, s.name)} <span className="text-slate-400">· {s.ownerEmail}</span></span>
              <span className="shrink-0 text-amber-700">pauses {day(s.until)}</span>
            </li>
          ))}
        </List>
        <List title="Failed payments (last 7 days)" empty="No failed payments.">
          {o.failedPayments.map((p) => (
            <li key={p.reference} className="flex justify-between gap-3 py-2">
              <span className="min-w-0 truncate">{shopLink(p.store, p.storeName)} <span className="text-slate-400">· {p.reason || 'Declined'}</span></span>
              <span className="shrink-0 text-slate-500">{naira(p.amount)}</span>
            </li>
          ))}
        </List>
        <List title="Recent payments" empty="No payments yet.">
          {o.recentPayments.map((p) => (
            <li key={p.reference} className="flex justify-between gap-3 py-2">
              <span className="min-w-0 truncate">{shopLink(p.store, p.storeName)} <span className="capitalize text-slate-400">· {p.kind === 'gift' ? 'free months' : `${p.plan} ${p.kind}`}</span></span>
              <span className="shrink-0 text-slate-700">{p.kind === 'gift' ? 'Gift' : naira(p.amount)} <span className="text-slate-400">{day(p.date)}</span></span>
            </li>
          ))}
        </List>
      </div>

      <List title={`Market Square reports (${o.market?.shops ?? 0} shops listed)`} empty="No open reports.">
        {(o.market?.openReports || []).map((r) => (
          <li key={r._id} className="flex justify-between gap-3 py-2">
            <span className="min-w-0 truncate">
              {shopLink(r.store, r.storeName)} <span className="text-slate-500">· {r.productName}</span>
              <span className="text-rose-700"> · {REPORT_REASONS[r.reason] || r.reason}</span>
              {r.details && <span className="text-slate-400"> · {r.details}</span>}
            </span>
            <span className="shrink-0 text-slate-500">{day(r.createdAt)}</span>
          </li>
        ))}
      </List>

      <List title="Recent founder actions" empty="Nothing yet.">
        {o.recentActions.map((a) => (
          <li key={a._id} className="flex justify-between gap-3 py-2">
            <span className="min-w-0 truncate">
              {ACTION_LABELS[a.action] || a.action} {shopLink(a.store, a.storeName)}
              {a.details && <span className="text-slate-400"> · {a.details}</span>}
            </span>
            <span className="shrink-0 text-slate-500">{day(a.createdAt)}</span>
          </li>
        ))}
      </List>
    </div>
  )
}

function Shops() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const state = params.get('state') || ''
  const page = Number(params.get('page')) || 1
  const [search, setSearch] = useState(q)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setData(null)
    listShops({ q, state, page })
      .then(setData)
      .catch((err) => setError(errorMessage(err, 'Could not load shops.')))
  }, [q, state, page])

  // New search or filter starts at page 1; page 1 isn't written in the address
  const go = (next) => {
    const all = { tab: 'shops', q, state, page: 1, ...next }
    setParams(Object.fromEntries(Object.entries(all).filter(([k, v]) => v && !(k === 'page' && v === 1)).map(([k, v]) => [k, String(v)])))
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          go({ q: search.trim() })
        }}
      >
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Search shops"
            placeholder="Shop name, address or owner's email"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-emerald-600 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select aria-label="Filter by state" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={state} onChange={(e) => go({ state: e.target.value })}>
          <option value="">All states</option>
          {Object.entries(STATES).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Search</button>
      </form>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!data && !error && <p className="text-slate-500">Loading…</p>}
      {data && (
        <>
          <p className="text-sm text-slate-500">{data.total} shop{data.total === 1 ? '' : 's'}</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Shop</th>
                  <th className="px-4 py-2.5 font-medium">Owner</th>
                  <th className="px-4 py-2.5 font-medium">State</th>
                  <th className="px-4 py-2.5 font-medium">Plan</th>
                  <th className="px-4 py-2.5 font-medium">Products</th>
                  <th className="px-4 py-2.5 font-medium">Last order</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.shops.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      {shopLink(s._id, s.name)}
                      <div className="text-xs text-slate-400">{s.customDomain || s.slug}</div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{s.ownerEmail}</td>
                    <td className="px-4 py-2.5"><StateChip state={s.state} /></td>
                    <td className="px-4 py-2.5 capitalize text-slate-600">{s.plan}</td>
                    <td className="px-4 py-2.5 text-slate-600">{s.products}</td>
                    <td className="px-4 py-2.5 text-slate-600">{s.lastOrderAt ? day(s.lastOrderAt) : '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{day(s.createdAt)}</td>
                  </tr>
                ))}
                {!data.shops.length && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No shops match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 text-sm">
              <button type="button" disabled={page <= 1} onClick={() => go({ page: page - 1 })} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Previous</button>
              <span className="text-slate-500">Page {data.page} of {data.pages}</span>
              <button type="button" disabled={page >= data.pages} onClick={() => go({ page: page + 1 })} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// The platform team: who can use the Template Studio
function Team() {
  const [team, setTeam] = useState(null)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const load = () => listTeam().then(setTeam).catch((err) => setError(errorMessage(err, 'Could not load the team.')))
  useEffect(() => {
    load()
  }, [])

  async function add(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await addDesigner(email)
      setEmail('')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-slate-600">
        Designers can make templates in the <Link to="/studio" className="font-semibold text-emerald-700">Template Studio</Link> and send them to you for
        review. They can't see money, shops or customers. They need a platform account first (they can sign up), then
        log out and in again after you add them.
      </p>
      <form onSubmit={add} className="flex gap-2">
        <input type="email" required aria-label="Designer's email" placeholder="Their account email" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Adding…' : 'Add designer'}</button>
      </form>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <List title="Team" empty="Nobody yet.">
        {(team || []).map((u) => (
          <li key={u._id} className="flex items-center justify-between gap-3 py-2">
            <span className="min-w-0 truncate">
              <span className="font-medium text-slate-900">{u.name}</span> <span className="text-slate-500">· {u.email}</span>
            </span>
            {u.founder ? (
              <span className="text-xs font-semibold text-slate-500">Founder</span>
            ) : (
              <button type="button" className="text-sm text-red-600 hover:underline" onClick={async () => { await removeDesigner(u._id).catch(() => {}); load() }}>
                Remove
              </button>
            )}
          </li>
        ))}
      </List>
    </div>
  )
}

// The founder's view of the whole platform
function FounderHome() {
  const [params, setParams] = useSearchParams()
  const tab = ['shops', 'team'].includes(params.get('tab')) ? params.get('tab') : 'overview'
  const tabClass = (t) =>
    `border-b-2 px-1 pb-2 text-sm font-semibold ${tab === t ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`

  return (
    <FounderOnly>
      <section className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="font-poppins text-3xl font-bold text-slate-900">Founder</h1>
          <p className="mt-1 text-slate-600">Every shop on the platform. Demo shops aren't counted.</p>
          <div className="mt-6 flex gap-6 border-b border-slate-200">
            <button type="button" className={tabClass('overview')} onClick={() => setParams({})}>Overview</button>
            <button type="button" className={tabClass('shops')} onClick={() => setParams({ tab: 'shops' })}>Shops</button>
            <button type="button" className={tabClass('team')} onClick={() => setParams({ tab: 'team' })}>Team</button>
          </div>
          <div className="mt-6">{tab === 'shops' ? <Shops /> : tab === 'team' ? <Team /> : <Overview />}</div>
        </div>
      </section>
    </FounderOnly>
  )
}

export default FounderHome
