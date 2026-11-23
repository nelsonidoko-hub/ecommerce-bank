import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid'
import { getSetup, publishStore, removeSampleProducts } from '../../services/storeService'
import { loadStoreStatus } from '../../hooks/useStoreStatus'

const day = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })

// Top of the admin dashboard: what's left before the shop can go live, and
// the Publish button. Once published it shrinks to a one-line status.
function SetupChecklist() {
  const [setup, setSetup] = useState(null)
  const [busy, setBusy] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getSetup()
      .then(setSetup)
      .catch(() => setError('Could not load your setup checklist.'))
  }, [])

  async function removeSamples() {
    setBusy('samples')
    setError('')
    try {
      const result = await removeSampleProducts()
      setSetup(result.setup)
      setConfirmRemove(false)
      setMessage(`Removed ${result.removed.products} sample products.`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not remove the samples.')
    } finally {
      setBusy('')
    }
  }

  async function publish() {
    setBusy('publish')
    setError('')
    try {
      const result = await publishStore()
      await loadStoreStatus(true)
      setSetup(await getSetup())
      setMessage(`Your shop is live! Your free trial runs until ${day(result.trialEndsAt)}.`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not publish your shop.')
    } finally {
      setBusy('')
    }
  }

  if (!setup) return error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null

  const done = setup.steps.filter((s) => s.done).length
  const allDone = done === setup.steps.length

  // Published: a short status line, plus anything still worth doing
  if (setup.published && allDone) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
        <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-600" />
        <span>
          Your shop is live.
          {setup.state === 'trial' && setup.until && ` Free trial until ${day(setup.until)}.`}
        </span>
        {message && <span className="ml-auto font-medium">{message}</span>}
      </div>
    )
  }

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-poppins text-lg font-semibold text-gray-900">
            {setup.published ? 'Finish setting up' : 'Get your shop ready'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {done} of {setup.steps.length} done.
            {!setup.published && ` Publishing starts your ${setup.trialDays}-day free trial.`}
          </p>
        </div>
        {!setup.published && (
          <button
            type="button"
            onClick={publish}
            disabled={!setup.canPublish || busy === 'publish'}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <RocketLaunchIcon className="h-4 w-4" />
            {busy === 'publish' ? 'Publishing…' : 'Publish shop'}
          </button>
        )}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${(done / setup.steps.length) * 100}%` }} />
      </div>

      <ul className="mt-5 divide-y divide-gray-100">
        {setup.steps.map((step) => (
          <li key={step.id} className="flex items-center gap-3 py-3 text-sm">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                step.done ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'
              }`}
              aria-hidden="true"
            >
              {step.done && '✓'}
            </span>
            <span className={step.done ? 'text-gray-400 line-through' : 'text-gray-800'}>
              {step.label}
              {step.required && !step.done && <span className="ml-1 text-xs text-red-600">(needed to publish)</span>}
            </span>

            {step.id === 'samples' && !step.done ? (
              confirmRemove ? (
                <span className="ml-auto flex gap-2">
                  <button type="button" onClick={removeSamples} disabled={busy === 'samples'} className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                    {busy === 'samples' ? 'Removing…' : `Remove ${setup.sampleProducts}`}
                  </button>
                  <button type="button" onClick={() => setConfirmRemove(false)} className="text-xs text-gray-500">
                    Cancel
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmRemove(true)} className="ml-auto text-xs font-semibold text-blue-600 hover:underline">
                  Remove
                </button>
              )
            ) : (
              !step.done && step.link && (
                <Link to={step.link} className="ml-auto text-xs font-semibold text-blue-600 hover:underline">
                  Go
                </Link>
              )
            )}
          </li>
        ))}
      </ul>

      {!setup.published && !setup.canPublish && setup.blockers.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">To publish: {setup.blockers.join(', ').toLowerCase()}.</p>
      )}
      {message && <p className="mt-3 text-sm font-medium text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  )
}

export default SetupChecklist
