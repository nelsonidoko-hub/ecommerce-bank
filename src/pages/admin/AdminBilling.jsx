import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { getBilling, startCheckout, confirmPayment, changePlan, setAutoRenew } from '../../services/billingService'
import { loadStoreStatus } from '../../hooks/useStoreStatus'

const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`
const day = (d) => (d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '')
const message = (err, fallback) => err?.response?.data?.message || fallback

const STATE = {
  draft: ['Not published', 'bg-gray-100 text-gray-700'],
  trial: ['Free trial', 'bg-green-100 text-green-800'],
  active: ['Active', 'bg-green-100 text-green-800'],
  grace: ['Payment overdue', 'bg-amber-100 text-amber-800'],
  paused: ['Paused', 'bg-red-100 text-red-700'],
  suspended: ['Suspended', 'bg-red-100 text-red-700'],
}
const FEATURES = {
  basic: ['All templates and the builder', 'LIMIT', 'Orders, customers, discount codes', 'Your shop address', 'Small "Powered by" line'],
  pro: ['Everything in Basic', 'Unlimited products', 'Your own .com address', 'Staff accounts', 'Save your own templates', 'No platform branding'],
}

// Which button a plan card shows, given the billing state:
//   none | current | keep | upgrade | switch-at-renewal | switching | choose
export function planActionFor(b, plan) {
  if (!b.ready) return 'none'
  const paid = b.state === 'active'
  if (paid && b.plan === plan) return b.nextPlan && b.nextPlan !== plan ? 'keep' : 'current'
  if (paid && plan === 'pro') return 'upgrade'
  if (paid && plan === 'basic') return b.nextPlan === 'basic' ? 'switching' : 'switch-at-renewal'
  return 'choose'
}

// What the merchant pays the platform: plan, renewals, card and receipts
function AdminBilling() {
  const [params, setParams] = useSearchParams()
  const [b, setB] = useState(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const confirmed = useRef(false)

  useEffect(() => {
    // Back from Paystack: ?reference=... (sometimes ?trxref=...)
    const reference = params.get('reference') || params.get('trxref')
    const load = async () => {
      if (reference && !confirmed.current) {
        confirmed.current = true
        setBusy('confirm')
        try {
          await confirmPayment(reference)
          setNotice('Payment received. Thank you! A receipt is on its way to your email.')
          await loadStoreStatus(true)
        } catch (err) {
          setError(message(err, "We couldn't confirm that payment."))
        } finally {
          setBusy('')
          setParams({}, { replace: true })
        }
      }
      setB(await getBilling())
    }
    load().catch((err) => setError(message(err, 'Could not load billing.')))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function pay(plan) {
    setBusy(plan)
    setError('')
    try {
      const { url } = await startCheckout(plan)
      window.location.assign(url)
    } catch (err) {
      setError(message(err, 'Could not start the payment.'))
      setBusy('')
    }
  }

  async function act(key, fn, note) {
    setBusy(key)
    setError('')
    try {
      const next = await fn()
      setB((prev) => ({ ...prev, ...next }))
      if (note) setNotice(note)
      await loadStoreStatus(true)
    } catch (err) {
      setError(message(err, 'Something went wrong.'))
    } finally {
      setBusy('')
    }
  }

  if (!b) return <p className="p-2 text-sm text-gray-500">{error || (busy === 'confirm' ? 'Confirming your payment…' : 'Loading billing…')}</p>

  const [label, chip] = STATE[b.state] || STATE.draft

  function planButton(plan) {
    const base = 'w-full rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-50'
    const name = plan === 'pro' ? 'Pro' : 'Basic'
    switch (planActionFor(b, plan)) {
      case 'none':
        return null
      case 'current':
        return <p className="rounded-md bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-600">Your plan</p>
      case 'keep':
        return (
          <button type="button" disabled={Boolean(busy)} onClick={() => act('plan', () => changePlan(plan), 'Your switch was cancelled.')} className={`${base} border`}>
            Keep {name}
          </button>
        )
      case 'upgrade':
        return (
          <button type="button" disabled={Boolean(busy)} onClick={() => pay('pro')} className={`${base} bg-blue-600 text-white hover:bg-blue-700`}>
            {busy === 'pro' ? 'Opening Paystack…' : `Upgrade now: pay ${naira(b.upgradeQuote)}`}
          </button>
        )
      case 'switching':
        return <p className="rounded-md bg-amber-50 py-2.5 text-center text-xs font-medium text-amber-800">Switching on {day(b.currentPeriodEnd)}</p>
      case 'switch-at-renewal':
        return (
          <button type="button" disabled={Boolean(busy)} onClick={() => act('plan', () => changePlan('basic'), `You'll move to Basic on ${day(b.currentPeriodEnd)}.`)} className={`${base} border`}>
            Switch at renewal
          </button>
        )
      default:
        return (
          <button type="button" disabled={Boolean(busy)} onClick={() => pay(plan)} className={`${base} ${plan === 'pro' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
            {busy === plan ? 'Opening Paystack…' : `Choose ${name}: ${naira(b.prices[plan])}/month`}
          </button>
        )
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">Your plan for keeping the shop open. Paid by card through Paystack.</p>
      </div>

      {notice && <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!b.ready && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Paying for plans isn't switched on yet. Your shop keeps working; check back soon.
        </p>
      )}

      {/* Where the shop stands */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${chip}`}>{label}</span>
          <span className="text-sm font-medium capitalize text-gray-900">{b.plan} plan</span>
        </div>
        <p className="mt-3 text-sm text-gray-700">
          {b.state === 'draft' && `Publish your shop to start your ${b.trialDays}-day free trial. You can also pay now; your month starts when the trial ends.`}
          {b.state === 'trial' && `Free trial until ${day(b.trialEndsAt)}. Choose a plan any time; your paid month starts when the trial ends, so you lose no free days.`}
          {b.state === 'active' && `Paid until ${day(b.currentPeriodEnd)}. ${b.autoRenew && b.card ? `We'll charge your card on that day${b.nextPlan ? ' for Basic' : ''}.` : 'Renew before then to stay open.'}`}
          {b.state === 'grace' && `Your payment is overdue. The shop stays open until ${day(b.until)}, then it pauses. Pay now to avoid that.`}
          {b.state === 'paused' && 'Your shop is hidden from customers. Nothing is deleted. Pay for a plan and it opens again straight away.'}
          {b.state === 'suspended' && 'Your shop has been switched off by the platform. Please contact support.'}
        </p>

        {b.card && (
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm">
            <span className="inline-flex items-center gap-2 text-gray-700">
              <CreditCardIcon className="h-5 w-5 text-gray-400" />
              <span className="capitalize">{b.card.brand || 'Card'}</span> ending {b.card.last4}
            </span>
            <label className="ml-auto inline-flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={b.autoRenew}
                disabled={Boolean(busy)}
                onChange={(e) => act('renew', () => setAutoRenew(e.target.checked), e.target.checked ? 'Automatic renewal is on.' : "Automatic renewal is off. Your shop stays open until your paid time runs out.")}
              />
              Renew automatically
            </label>
          </div>
        )}
        {b.ready && b.card && (b.state === 'grace' || b.state === 'paused') && (
          <p className="mt-2 text-xs text-gray-500">Paying with a different card replaces the saved one.</p>
        )}
      </section>

      {/* Plans */}
      <section className="grid gap-4 md:grid-cols-2">
        {['basic', 'pro'].map((plan) => (
          <div key={plan} className={`flex flex-col rounded-xl border bg-white p-5 ${b.plan === plan ? 'border-blue-600' : 'border-gray-200'}`}>
            <h2 className="text-lg font-bold text-gray-900">{plan === 'pro' ? 'Pro' : 'Basic'}</h2>
            <p className="mt-1">
              <span className="text-2xl font-bold text-gray-900">{naira(b.prices[plan])}</span>
              <span className="text-sm text-gray-500"> / month</span>
            </p>
            <ul className="mt-4 flex-1 space-y-1.5">
              {FEATURES[plan].map((f) => (f === 'LIMIT' ? `Up to ${b.basicProductLimit} products` : f)).map((f) => (
                <li key={f} className="flex gap-2 text-sm text-gray-700">
                  <CheckIcon className="h-5 w-5 shrink-0 text-green-600" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-5">{planButton(plan)}</div>
          </div>
        ))}
      </section>

      {/* History */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <h2 className="border-b border-gray-100 px-5 py-3 text-sm font-semibold text-gray-900">Payments</h2>
        {b.history.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-500">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-5 py-2 font-medium">For</th>
                  <th className="px-5 py-2 font-medium">Amount</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {b.history.map((p) => (
                  <tr key={p.reference}>
                    <td className="whitespace-nowrap px-5 py-2.5 text-gray-700">{day(p.date)}</td>
                    <td className="px-5 py-2.5 text-gray-700">
                      {p.kind === 'upgrade' ? 'Upgrade to Pro' : `${p.plan === 'pro' ? 'Pro' : 'Basic'}, 1 month`}
                      {p.kind === 'renewal' && <span className="text-gray-400"> (automatic)</span>}
                    </td>
                    <td className="px-5 py-2.5 text-gray-900">{naira(p.amount)}</td>
                    <td className="px-5 py-2.5">
                      {p.status === 'paid' ? (
                        <span className="text-green-700">Paid</span>
                      ) : (
                        <span className="text-red-600" title={p.failureReason}>Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminBilling
