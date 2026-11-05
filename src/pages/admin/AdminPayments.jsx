import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { API_BASE } from '../../config'
import {
  getPaymentSettings,
  updatePaymentSettings,
  testPaystack,
} from '../../services/paymentSettingsService'
import {
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const inputClass = 'border rounded-md p-2 w-full text-sm'

function Banner({ tone, icon: Icon, children }) {
  const tones = {
    green: 'bg-green-50 border-green-200 text-green-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    red: 'bg-red-50 border-red-200 text-red-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
  }
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-4 text-sm ${tones[tone]}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  )
}

function Card({ title, description, children }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-500 mt-1 mb-4">{description}</p>}
      <div className={`flex flex-col gap-4 ${description ? '' : 'mt-4'}`}>{children}</div>
    </div>
  )
}

// One key (test or live). The saved key is never shown, only its last 4 characters.
function KeyField({
  label,
  prefix,
  saved,
  value,
  onChange,
  removed,
  onToggleRemove,
  onCheck,
  checking,
  disabled,
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>

      {saved.configured && (
        <div className="flex items-center justify-between gap-3 bg-gray-50 border rounded-md px-3 py-2 mb-2 text-sm">
          <span className={removed ? 'line-through text-gray-400' : 'font-mono text-gray-700'}>
            {prefix}••••••••{saved.last4}
          </span>
          <span className="flex items-center gap-3 text-xs shrink-0">
            {removed ? (
              <button type="button" onClick={onToggleRemove} className="text-blue-600 hover:underline">
                Undo remove
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onCheck}
                  disabled={checking}
                  className="text-blue-600 hover:underline disabled:opacity-50"
                >
                  {checking ? 'Checking...' : 'Check'}
                </button>
                <button
                  type="button"
                  onClick={onToggleRemove}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-600"
                >
                  <TrashIcon className="h-3.5 w-3.5" /> Remove
                </button>
              </>
            )}
          </span>
        </div>
      )}

      <input
        type="password"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        className={`${inputClass} font-mono disabled:bg-gray-50`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={saved.configured ? `Paste a new ${prefix}... key to replace it` : `Paste your ${prefix}... key`}
      />
    </div>
  )
}

function AdminPayments() {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [mode, setMode] = useState('test')
  const [testKey, setTestKey] = useState('')
  const [liveKey, setLiveKey] = useState('')
  const [removeTest, setRemoveTest] = useState(false)
  const [removeLive, setRemoveLive] = useState(false)
  const [password, setPassword] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const [checking, setChecking] = useState('') // '' | 'active' | 'test' | 'live'
  const [checkResult, setCheckResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getPaymentSettings(user.token)
      .then((data) => {
        setStatus(data)
        setMode(data.mode)
      })
      .catch((err) => {
        console.error(err)
        setLoadError(err.response?.data?.message || 'Could not load payment settings')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleCheck(which) {
    setChecking(which || 'active')
    setCheckResult(null)
    try {
      const result = await testPaystack(which, user.token)
      setCheckResult({ ...result, which: which || 'active' })
    } catch (err) {
      setCheckResult({
        ok: false,
        which: which || 'active',
        message: err.response?.data?.message || 'Could not run the check',
      })
    } finally {
      setChecking('')
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    setSaved(false)

    if (!password) {
      setSaveError('Enter your admin password to confirm this change.')
      return
    }

    const payload = { password }
    if (mode !== status.mode) payload.mode = mode
    if (testKey.trim()) payload.testSecretKey = testKey.trim()
    if (liveKey.trim()) payload.liveSecretKey = liveKey.trim()
    if (removeTest) payload.removeTest = true
    if (removeLive) payload.removeLive = true

    if (
      payload.mode === 'live' &&
      !confirm('Switch to LIVE mode? Customers will be charged real money.')
    ) {
      return
    }

    setSaving(true)
    try {
      const updated = await updatePaymentSettings(payload, user.token)
      setStatus(updated)
      setMode(updated.mode)
      setTestKey('')
      setLiveKey('')
      setRemoveTest(false)
      setRemoveLive(false)
      setPassword('')
      setCheckResult(null)
      setSaved(true)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save these settings')
    } finally {
      setSaving(false)
    }
  }

  async function copyWebhook(url) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Could not copy automatically. Select the address and copy it by hand.')
    }
  }

  if (loading) return <p className="p-6">Loading payment settings...</p>
  if (loadError || !status) {
    return <p className="p-6 text-red-600">{loadError || 'Could not load payment settings'}</p>
  }

  const changed =
    mode !== status.mode || testKey.trim() || liveKey.trim() || removeTest || removeLive
  const webhookUrl = `${API_BASE}${status.webhookPath}`
  const webhookIsLocal = /localhost|127\.0\.0\.1/.test(webhookUrl)

  return (
    <form onSubmit={handleSave} className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payments</h2>
        <p className="text-sm text-gray-500 mt-1">
          Connect your Paystack account so customers can pay online.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Where things stand */}
        {status.problem && (
          <Banner tone="red" icon={ExclamationTriangleIcon}>
            <p className="font-semibold">There is a problem with the saved key</p>
            <p>{status.problem}</p>
          </Banner>
        )}

        {!status.encryptionReady && (
          <Banner tone="amber" icon={ExclamationTriangleIcon}>
            <p className="font-semibold">One-time setup needed by your developer</p>
            <p>
              Keys can't be saved here until <b>SETTINGS_ENCRYPTION_KEY</b> (32 or more random
              characters) is added on the server. This keeps your keys encrypted.
            </p>
          </Banner>
        )}

        {status.activeSource === 'none' && (
          <Banner tone="red" icon={XCircleIcon}>
            <p className="font-semibold">Paystack isn't connected</p>
            <p>Customers can't pay online yet. Add a key below.</p>
          </Banner>
        )}

        {status.activeSource === 'dashboard' && status.activeMode === 'live' && (
          <Banner tone="green" icon={ShieldCheckIcon}>
            <p className="font-semibold">Live mode</p>
            <p>Paystack is connected and customers are being charged real money.</p>
          </Banner>
        )}

        {status.activeSource === 'dashboard' && status.activeMode === 'test' && (
          <Banner tone="amber" icon={ExclamationTriangleIcon}>
            <p className="font-semibold">Test mode</p>
            <p>No real money moves. Switch to live mode when you're ready to sell.</p>
          </Banner>
        )}

        {status.activeSource === 'environment' && (
          <Banner tone="blue" icon={CreditCardIcon}>
            <p className="font-semibold">Using the key set on the server ({status.activeMode} mode)</p>
            <p>Save a key below if you'd like to manage it from this page instead.</p>
          </Banner>
        )}

        {/* Mode and keys */}
        <Card
          title="Paystack keys"
          description="Find these in your Paystack dashboard under Settings → API Keys & Webhooks. Only the last 4 characters are ever shown here."
        >
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['test', 'Test', 'Practice payments. No real money.'],
                ['live', 'Live', 'Real payments from real customers.'],
              ].map(([value, title, text]) => (
                <label
                  key={value}
                  className={`border rounded-lg p-3 cursor-pointer text-sm ${
                    mode === value ? 'border-blue-600 bg-blue-50/40' : 'border-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium text-gray-900">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === value}
                      onChange={() => setMode(value)}
                    />
                    {title}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1 ml-6">{text}</span>
                </label>
              ))}
            </div>
          </div>

          <KeyField
            label="Test secret key"
            prefix="sk_test_"
            saved={status.test}
            value={testKey}
            onChange={setTestKey}
            removed={removeTest}
            onToggleRemove={() => setRemoveTest((v) => !v)}
            onCheck={() => handleCheck('test')}
            checking={checking === 'test'}
            disabled={!status.encryptionReady}
          />

          <KeyField
            label="Live secret key"
            prefix="sk_live_"
            saved={status.live}
            value={liveKey}
            onChange={setLiveKey}
            removed={removeLive}
            onToggleRemove={() => setRemoveLive((v) => !v)}
            onCheck={() => handleCheck('live')}
            checking={checking === 'live'}
            disabled={!status.encryptionReady}
          />

          {checkResult && (
            <p
              className={`flex items-center gap-2 text-sm rounded-md border p-3 ${
                checkResult.ok
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {checkResult.ok ? (
                <CheckCircleIcon className="h-5 w-5 shrink-0" />
              ) : (
                <XCircleIcon className="h-5 w-5 shrink-0" />
              )}
              {checkResult.ok
                ? `Paystack accepted the ${checkResult.mode} key.`
                : checkResult.message}
            </p>
          )}

          <div className="border-t pt-4">
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Your admin password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Needed to confirm any change here"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              We also email the store owner whenever these settings change, so an unexpected
              change is noticed straight away.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving || !changed || !status.encryptionReady}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={() => handleCheck()}
              disabled={!!checking || status.activeSource === 'none'}
              className="flex items-center gap-1.5 border px-4 py-2.5 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${checking === 'active' ? 'animate-spin' : ''}`} />
              Check the key in use
            </button>

            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircleIcon className="h-5 w-5" /> Saved
              </span>
            )}
            {saveError && <span className="text-sm text-red-600">{saveError}</span>}
          </div>
        </Card>

        {/* Webhook */}
        <Card
          title="Webhook address"
          description="Paystack uses this to tell your store a payment succeeded, even if the customer closes their browser. Add it once in Paystack."
        >
          <div className="flex items-center gap-2">
            <input readOnly className={`${inputClass} font-mono bg-gray-50`} value={webhookUrl} />
            <button
              type="button"
              onClick={() => copyWebhook(webhookUrl)}
              className="flex items-center gap-1.5 border px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 shrink-0"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {webhookIsLocal && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
              This is a local address, so Paystack can't reach it. On your live site this will show
              your real backend address.
            </p>
          )}

          <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
            <li>Open your Paystack dashboard and go to Settings → API Keys & Webhooks.</li>
            <li>Paste the address above into the Webhook URL box for each mode you use.</li>
            <li>Save it in Paystack.</li>
          </ol>
        </Card>
      </div>
    </form>
  )
}

export default AdminPayments