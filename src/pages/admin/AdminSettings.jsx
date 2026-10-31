import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getSettings, updateSettings } from '../../services/settingsService'
import { setCachedSettings, defaultSettings } from '../../hooks/useSettings'
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  GlobeAltIcon,
  TruckIcon,
  MegaphoneIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const inputClass = 'border rounded-md p-2 w-full text-sm'

function Card({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1 text-gray-900">
        <Icon className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {description && <p className="text-xs text-gray-500 mb-4">{description}</p>}
      <div className={`flex flex-col gap-3 ${description ? '' : 'mt-4'}`}>{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function AdminSettings() {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings()
      .then((data) => setForm(data))
      .catch((err) => {
        console.error(err)
        setError(err.response?.data?.message || 'Could not load settings')
        setForm(defaultSettings)
      })
      .finally(() => setLoading(false))
  }, [])

  function setTop(field, value) {
    setSaved(false)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function setNested(section, field, value) {
    setSaved(false)
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      const updated = await updateSettings(form, user.token)
      setForm(updated)
      setCachedSettings(updated)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <p className="p-6">Loading settings...</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Store Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Change these any time. The footer, checkout and homepage update straight away.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <Card
          icon={BuildingStorefrontIcon}
          title="Store details"
          description="Shown in the footer and used for your customers' contact."
        >
          <Field label="Store name">
            <input
              className={inputClass}
              value={form.storeName}
              onChange={(e) => setTop('storeName', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Contact email">
              <input
                type="email"
                className={inputClass}
                value={form.contactEmail}
                onChange={(e) => setTop('contactEmail', e.target.value)}
                placeholder="hello@yourstore.com"
              />
            </Field>
            <Field label="Contact phone">
              <input
                className={inputClass}
                value={form.contactPhone}
                onChange={(e) => setTop('contactPhone', e.target.value)}
                placeholder="0801 234 5678"
              />
            </Field>
          </div>
          <Field label="WhatsApp number" hint="With country code, no spaces, e.g. 2348012345678">
            <input
              className={inputClass}
              value={form.whatsappNumber}
              onChange={(e) => setTop('whatsappNumber', e.target.value)}
            />
          </Field>
        </Card>

        <Card
          icon={MapPinIcon}
          title="Store address"
          description="Shown in the footer."
        >
          <Field label="Street address">
            <input
              className={inputClass}
              value={form.address.line1}
              onChange={(e) => setNested('address', 'line1', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="City">
              <input
                className={inputClass}
                value={form.address.city}
                onChange={(e) => setNested('address', 'city', e.target.value)}
              />
            </Field>
            <Field label="State">
              <input
                className={inputClass}
                value={form.address.state}
                onChange={(e) => setNested('address', 'state', e.target.value)}
              />
            </Field>
            <Field label="Country">
              <input
                className={inputClass}
                value={form.address.country}
                onChange={(e) => setNested('address', 'country', e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card
          icon={GlobeAltIcon}
          title="Social links"
          description="Leave a box empty and that icon won't show in the footer."
        >
          <Field label="Instagram">
            <input
              className={inputClass}
              value={form.social.instagram}
              onChange={(e) => setNested('social', 'instagram', e.target.value)}
              placeholder="https://instagram.com/yourstore"
            />
          </Field>
          <Field label="X (Twitter)">
            <input
              className={inputClass}
              value={form.social.x}
              onChange={(e) => setNested('social', 'x', e.target.value)}
              placeholder="https://x.com/yourstore"
            />
          </Field>
          <Field label="TikTok">
            <input
              className={inputClass}
              value={form.social.tiktok}
              onChange={(e) => setNested('social', 'tiktok', e.target.value)}
              placeholder="https://tiktok.com/@yourstore"
            />
          </Field>
        </Card>

        <Card
          icon={TruckIcon}
          title="Delivery, tax and pickup"
          description="These are applied on the server when an order is placed, so customers always pay exactly what checkout shows."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Delivery fee (₦)" hint="Charged on every delivery order.">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.shipping.flatRate}
                onChange={(e) => setNested('shipping', 'flatRate', e.target.value)}
              />
            </Field>
            <Field
              label="Free delivery from (₦)"
              hint="Orders at or above this amount ship free. Use 0 to turn this off."
            >
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.shipping.freeShippingThreshold}
                onChange={(e) => setNested('shipping', 'freeShippingThreshold', e.target.value)}
              />
            </Field>
            <Field label="Tax rate (%)" hint="Use 0 for no tax. Nigerian VAT is 7.5.">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className={inputClass}
                value={form.tax.rate}
                onChange={(e) => setNested('tax', 'rate', e.target.value)}
              />
            </Field>
            <Field label="Tax name" hint="What customers see, e.g. VAT.">
              <input
                className={inputClass}
                value={form.tax.label}
                onChange={(e) => setNested('tax', 'label', e.target.value)}
              />
            </Field>
          </div>

          <div className="border-t pt-4 mt-1">
            <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer mb-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.pickup.enabled}
                onChange={(e) => setNested('pickup', 'enabled', e.target.checked)}
              />
              Let customers pick up orders in store
            </label>

            {form.pickup.enabled && (
              <div className="flex flex-col gap-3">
                <Field label="Pickup location name">
                  <input
                    className={inputClass}
                    value={form.pickup.name}
                    onChange={(e) => setNested('pickup', 'name', e.target.value)}
                  />
                </Field>
                <Field label="Pickup address">
                  <input
                    className={inputClass}
                    value={form.pickup.address}
                    onChange={(e) => setNested('pickup', 'address', e.target.value)}
                  />
                </Field>
                <Field label="Ready time message">
                  <input
                    className={inputClass}
                    value={form.pickup.readyTime}
                    onChange={(e) => setNested('pickup', 'readyTime', e.target.value)}
                  />
                </Field>
              </div>
            )}
          </div>
        </Card>

        <Card
          icon={MegaphoneIcon}
          title="Announcement bar"
          description="A thin strip across the top of every storefront page. Good for sales and free-delivery notices."
        >
          <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.announcement.enabled}
              onChange={(e) => setNested('announcement', 'enabled', e.target.checked)}
            />
            Show the announcement bar
          </label>
          <Field label="Message">
            <input
              className={inputClass}
              value={form.announcement.text}
              onChange={(e) => setNested('announcement', 'text', e.target.value)}
              placeholder="Free delivery on orders over ₦50,000"
            />
          </Field>
          <Field label="Link (optional)" hint="e.g. /shop. Leave empty for no link.">
            <input
              className={inputClass}
              value={form.announcement.link}
              onChange={(e) => setNested('announcement', 'link', e.target.value)}
            />
          </Field>
        </Card>
      </div>

      <div className="sticky bottom-0 bg-gray-50/90 backdrop-blur py-4 mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save settings'}
        </button>

        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircleIcon className="h-5 w-5" /> Saved
          </span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  )
}

export default AdminSettings