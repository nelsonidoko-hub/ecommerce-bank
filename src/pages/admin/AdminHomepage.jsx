import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getSettings, updateSettings } from '../../services/settingsService'
import { getCategories } from '../../services/categoryService'
import { uploadHeroMedia } from '../../services/heroService'
import { setCachedSettings, defaultSettings } from '../../hooks/useSettings'
import {
  SparklesIcon,
  FireIcon,
  PhotoIcon,
  TagIcon,
  RectangleGroupIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const SECTION_KEYS = [
  'homeArrivals',
  'homeBestSellers',
  'homeBanner',
  'homeCategoryRow',
  'homeFeatured',
]

const inputClass = 'border rounded-md p-2 w-full text-sm'

function Card({ icon: Icon, title, description, enabled, onToggle, children }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div className="flex items-center gap-2 text-gray-900">
          <Icon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          Show on homepage
        </label>
      </div>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
      <div className={`flex flex-col gap-3 ${enabled ? '' : 'opacity-50'}`}>{children}</div>
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

function ImageField({ label, hint, value, onChange, token }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose a photo, not a video.')
      return
    }

    setError('')
    setUploading(true)
    try {
      const { url } = await uploadHeroMedia(file, token)
      onChange(url)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try a smaller photo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img src={value} alt="" className="h-20 w-32 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-white border rounded-full p-0.5 shadow text-gray-500 hover:text-red-600"
              title="Remove and use the default picture"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="h-20 w-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-[11px] text-gray-400 text-center px-2">
            Using default picture
          </div>
        )}

        <label className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline cursor-pointer">
          <ArrowUpTrayIcon className="h-4 w-4" />
          {value ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      </div>
      {uploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </Field>
  )
}

function AdminHomepage() {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getSettings(), getCategories()])
      .then(([settings, tree]) => {
        const next = {}
        // Fill any missing fields from defaults so older data never breaks the form
        SECTION_KEYS.forEach((key) => {
          next[key] = { ...defaultSettings[key], ...(settings[key] || {}) }
        })
        setForm(next)
        setCategories(Array.isArray(tree) ? tree : [])
      })
      .catch((err) => {
        console.error(err)
        setError(err.response?.data?.message || 'Could not load homepage settings')
        const next = {}
        SECTION_KEYS.forEach((key) => {
          next[key] = { ...defaultSettings[key] }
        })
        setForm(next)
      })
      .finally(() => setLoading(false))
  }, [])

  function setField(section, field, value) {
    setSaved(false)
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      // Only the homepage sections are sent, so other settings are never touched
      const updated = await updateSettings(form, user.token)
      setCachedSettings(updated)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <p className="p-6">Loading homepage settings...</p>

  const categoryOptions = categories.flatMap((cat) => [
    { value: cat.name, label: cat.label },
    ...(cat.children || []).map((child) => ({
      value: child.name,
      label: `${cat.label} › ${child.label}`,
    })),
  ])

  const a = form.homeArrivals
  const b = form.homeBestSellers
  const ban = form.homeBanner
  const row = form.homeCategoryRow
  const feat = form.homeFeatured

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Homepage</h2>
        <p className="text-sm text-gray-500 mt-1">
          Edit the sections below the main banner. The big top banner is managed under Hero
          Banner.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <Card
          icon={SparklesIcon}
          title="New arrivals"
          description="Your newest products, shown automatically in a grid."
          enabled={a.enabled}
          onToggle={(v) => setField('homeArrivals', 'enabled', v)}
        >
          <Field label="Heading">
            <input
              className={inputClass}
              value={a.title}
              onChange={(e) => setField('homeArrivals', 'title', e.target.value)}
            />
          </Field>
          <Field label="Short description">
            <input
              className={inputClass}
              value={a.subtitle}
              onChange={(e) => setField('homeArrivals', 'subtitle', e.target.value)}
            />
          </Field>
          <Field label="How many products to show" hint="Between 1 and 24.">
            <input
              type="number"
              min="1"
              max="24"
              className={inputClass}
              value={a.count}
              onChange={(e) => setField('homeArrivals', 'count', e.target.value)}
            />
          </Field>
        </Card>

        <Card
          icon={FireIcon}
          title="Best sellers"
          description="Shows products you've marked as Best Seller in the product form."
          enabled={b.enabled}
          onToggle={(v) => setField('homeBestSellers', 'enabled', v)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Small label above">
              <input
                className={inputClass}
                value={b.label}
                onChange={(e) => setField('homeBestSellers', 'label', e.target.value)}
              />
            </Field>
            <Field label="Heading">
              <input
                className={inputClass}
                value={b.title}
                onChange={(e) => setField('homeBestSellers', 'title', e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card
          icon={PhotoIcon}
          title="Promo banner"
          description="The wide picture banner in the middle of the page."
          enabled={ban.enabled}
          onToggle={(v) => setField('homeBanner', 'enabled', v)}
        >
          <ImageField
            label="Banner photo"
            hint="Wide photos work best. Remove it to go back to the default picture."
            value={ban.image}
            onChange={(url) => setField('homeBanner', 'image', url)}
            token={user.token}
          />
          <Field label="Heading">
            <input
              className={inputClass}
              value={ban.heading}
              onChange={(e) => setField('homeBanner', 'heading', e.target.value)}
            />
          </Field>
          <Field label="Text">
            <input
              className={inputClass}
              value={ban.text}
              onChange={(e) => setField('homeBanner', 'text', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Button text" hint="Leave empty to hide the button.">
              <input
                className={inputClass}
                value={ban.buttonLabel}
                onChange={(e) => setField('homeBanner', 'buttonLabel', e.target.value)}
              />
            </Field>
            <Field label="Button link" hint="e.g. /shop or /category/women">
              <input
                className={inputClass}
                value={ban.buttonLink}
                onChange={(e) => setField('homeBanner', 'buttonLink', e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card
          icon={TagIcon}
          title="Category row"
          description="A scrolling row of products from one category."
          enabled={row.enabled}
          onToggle={(v) => setField('homeCategoryRow', 'enabled', v)}
        >
          <Field label="Heading">
            <input
              className={inputClass}
              value={row.title}
              onChange={(e) => setField('homeCategoryRow', 'title', e.target.value)}
            />
          </Field>
          <Field label="Which category?" hint="Add more under Categories.">
            <select
              className={inputClass}
              value={row.category}
              onChange={(e) => setField('homeCategoryRow', 'category', e.target.value)}
            >
              <option value="">Choose a category</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </Card>

        <Card
          icon={RectangleGroupIcon}
          title="Featured collection"
          description="Four products beside a large photo, near the bottom of the page."
          enabled={feat.enabled}
          onToggle={(v) => setField('homeFeatured', 'enabled', v)}
        >
          <ImageField
            label="Large photo"
            hint="Tall photos work best. Remove it to go back to the default picture."
            value={feat.image}
            onChange={(url) => setField('homeFeatured', 'image', url)}
            token={user.token}
          />
          <Field label="Title on the photo">
            <input
              className={inputClass}
              value={feat.title}
              onChange={(e) => setField('homeFeatured', 'title', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Button text" hint="Leave empty to hide the button.">
              <input
                className={inputClass}
                value={feat.buttonLabel}
                onChange={(e) => setField('homeFeatured', 'buttonLabel', e.target.value)}
              />
            </Field>
            <Field label="Button link" hint="Links on your own site, e.g. /shop">
              <input
                className={inputClass}
                value={feat.buttonLink}
                onChange={(e) => setField('homeFeatured', 'buttonLink', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Which products?" hint="Newest products is the default.">
            <select
              className={inputClass}
              value={feat.category}
              onChange={(e) => setField('homeFeatured', 'category', e.target.value)}
            >
              <option value="">Newest products</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </Card>
      </div>

      <div className="sticky bottom-0 bg-gray-50/90 backdrop-blur py-4 mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
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

export default AdminHomepage