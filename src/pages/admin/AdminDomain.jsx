import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircleIcon, ClipboardDocumentIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { getDomain, setDomain, verifyDomain, removeDomain } from '../../services/domainService'
import { loadStoreStatus } from '../../hooks/useStoreStatus'

const message = (err, fallback) => err?.response?.data?.message || fallback

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard blocked: the value is on screen to copy by hand
    }
  }
  return (
    <button type="button" onClick={copy} className="inline-flex shrink-0 items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50" aria-label={`Copy ${text}`}>
      <ClipboardDocumentIcon className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// The shop's own web address (Pro): add it, set the DNS records, verify
function AdminDomain() {
  const [d, setD] = useState(null)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    getDomain()
      .then((data) => {
        setD(data)
        setInput(data.domain)
      })
      .catch((err) => setError(message(err, "Couldn't load your domain settings.")))
  }, [])

  async function run(kind, fn, done) {
    setBusy(kind)
    setError('')
    setNotice('')
    try {
      const data = await fn()
      setD(data)
      setInput(data.domain)
      if (done) setNotice(done)
      if (kind !== 'save') loadStoreStatus(true)
    } catch (err) {
      const data = err?.response?.data
      if (data?.records) setD(data)
      setError(message(err, 'Something went wrong. Please try again.'))
    } finally {
      setBusy('')
    }
  }

  if (!d) return <p className="p-2 text-sm text-gray-500">{error || 'Loading…'}</p>

  if (!d.allowed) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Your own domain</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <GlobeAltIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 font-medium text-gray-900">Use your own .com address on the Pro plan</p>
          <p className="mt-1 text-sm text-gray-500">Your shop keeps working on its current address either way.</p>
          <Link to="/admin/billing" className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white">See plans</Link>
        </div>
        {d.domain && <p className="text-sm text-gray-500">{d.domain} is saved but switched off until the shop is on Pro.</p>}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Your own domain</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect a domain you've bought (from Whogohost, Namecheap, GoDaddy…). Your current shop address keeps working too.
        </p>
      </div>

      {notice && <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form
        className="rounded-xl border border-gray-200 bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault()
          run('save', () => setDomain(input), 'Saved. Now add the records below at your domain company.')
        }}
      >
        <label htmlFor="domain" className="block text-sm font-medium text-gray-800">Domain</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <input
            id="domain"
            placeholder="myshop.com"
            className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={Boolean(busy) || !input.trim()} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy === 'save' ? 'Saving…' : d.domain ? 'Change' : 'Add domain'}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-gray-500">Without "www" or "https://". We set up www for you.</p>
      </form>

      {d.domain && (
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{d.domain}</span>
              {d.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                  <CheckCircleIcon className="h-3.5 w-3.5" /> Connected
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Waiting for DNS</span>
              )}
            </div>
            <div className="flex gap-2">
              {!d.verified && (
                <button type="button" disabled={Boolean(busy)} onClick={() => run('verify', verifyDomain, 'Domain verified. It can take a few minutes for the secure (https) certificate to be ready.')} className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                  {busy === 'verify' ? 'Checking…' : 'Verify'}
                </button>
              )}
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => window.confirm(`Disconnect ${d.domain}? The shop stays on its current address.`) && run('remove', removeDomain, 'Domain removed.')}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {busy === 'remove' ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>

          {d.verified && d.hosting === 'error' && (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Verified, but we couldn't finish setting it up on our side{d.error ? ` (${d.error})` : ''}. Please contact platform support so they can finish it.
            </p>
          )}
          {d.verified && d.hosting === 'manual' && (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Verified. The platform team will switch it on shortly.
            </p>
          )}

          <div>
            <p className="text-sm text-gray-700">
              {d.verified ? 'Keep these records at your domain company:' : 'At your domain company, open DNS settings and add these 3 records, then press Verify.'}
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Type</th>
                    <th className="py-2 pr-3 font-medium">Name / Host</th>
                    <th className="py-2 pr-3 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {d.records.map((r) => (
                    <tr key={r.type + r.name}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold">{r.type}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2"><code className="break-all text-xs">{r.name}</code><CopyButton text={r.name} /></div>
                        <p className="mt-0.5 text-xs text-gray-400">{r.purpose}</p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2"><code className="break-all text-xs">{r.value}</code><CopyButton text={r.value} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Some domain companies want only the first part in the Name box (for example <code>_shopverify</code> or <code>www</code>) and add your domain themselves.
              Changes can take from a few minutes to a few hours to show up.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}

export default AdminDomain
