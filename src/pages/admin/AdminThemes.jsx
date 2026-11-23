import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getSettings, updateSettings } from '../../services/settingsService'
import { setCachedSettings } from '../../hooks/useSettings'
import ThemePreview from '../../components/ThemePreview'
import {
  TEMPLATE_LIST,
  TEMPLATES,
  FONT_LABELS,
  HEADING_FONTS,
  BODY_FONTS,
  RADIUS_LABELS,
  CLASSIC_BRAND_DISPLAY,
  resolveTheme,
  isHex,
  brandReadability,
} from '../../utils/themes'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const EMPTY = { template: 'classic', brandColor: '', headingFont: '', bodyFont: '', radius: '' }

// Keeps only the five saved fields, so comparisons are never confused by extras
const pick = (theme) =>
  Object.fromEntries(Object.keys(EMPTY).map((key) => [key, theme?.[key] ?? EMPTY[key]]))

const inputClass = 'border rounded-md p-2 w-full text-sm'

function AdminThemes() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(EMPTY)
  const [draft, setDraft] = useState(EMPTY)
  const [hexText, setHexText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSettings()
      .then((data) => {
        const theme = pick(data.theme)
        setSaved(theme)
        setDraft(theme)
        setHexText(theme.brandColor)
      })
      .catch((err) => {
        console.error(err)
        setError(err.response?.data?.message || 'Could not load your theme')
      })
      .finally(() => setLoading(false))
  }, [])

  function chooseTemplate(id) {
    // A new template starts from its own colours, fonts and corners
    setDraft({ ...EMPTY, template: id })
    setHexText('')
    setPublished(false)
  }

  function change(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }))
    setPublished(false)
  }

  function changeBrand(value) {
    setHexText(value)
    if (value === '') change('brandColor', '')
    else if (isHex(value)) change('brandColor', value.toLowerCase())
  }

  function discard() {
    setDraft(saved)
    setHexText(saved.brandColor)
    setError('')
  }

  async function publish() {
    setError('')
    setSaving(true)
    try {
      const updated = await updateSettings({ theme: draft }, user.token)
      setCachedSettings(updated)
      const theme = pick(updated.theme)
      setSaved(theme)
      setDraft(theme)
      setPublished(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish this theme')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-6">Loading themes...</p>

  const resolved = resolveTheme(draft)
  const base = TEMPLATES[draft.template] || TEMPLATES.classic
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const readability = brandReadability(resolved.brand)
  const pickerColor = resolved.brand || CLASSIC_BRAND_DISPLAY

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Themes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pick a look for your store. Your products, pages and settings stay exactly the same, and
          only the colours, fonts and corners change. The admin area and emails are not affected.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      {/* Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {TEMPLATE_LIST.map((template) => {
          const selected = draft.template === template.id
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => chooseTemplate(template.id)}
              className={`text-left bg-white border-2 rounded-xl p-3 transition ${
                selected ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <ThemePreview theme={{ template: template.id }} compact />

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-900">{template.label}</span>
                {saved.template === template.id && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Live now
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{template.bestFor}</p>
              <p className="text-xs text-gray-600 mt-1">{template.description}</p>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 -mt-4 mb-8">
        More templates are on the way, including one built for restaurants and food vendors.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Customise */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-5 h-fit">
          <h3 className="font-semibold text-gray-900">Customise {base.label}</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Optional. Leave these alone to use the template exactly as designed.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Brand colour</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={pickerColor}
                  onChange={(e) => changeBrand(e.target.value)}
                  className="h-10 w-12 rounded border cursor-pointer p-0.5"
                />
                <input
                  className={`${inputClass} font-mono`}
                  value={hexText}
                  onChange={(e) => changeBrand(e.target.value)}
                  placeholder={resolved.brand || 'Original blue'}
                  maxLength={7}
                />
                {draft.brandColor && (
                  <button
                    type="button"
                    onClick={() => changeBrand('')}
                    className="text-xs text-blue-600 hover:underline shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Used for buttons, links and highlights.
              </p>

              {readability === 'blocked' && (
                <p className="flex items-start gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2 mt-2">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                  This colour is too light. White text on your buttons would be unreadable, so it
                  can't be published. Choose a darker one.
                </p>
              )}
              {readability === 'poor' && (
                <p className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                  This colour is quite light, so button text may be hard to read. Check the preview.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Heading font</label>
              <select
                className={inputClass}
                value={draft.headingFont}
                onChange={(e) => change('headingFont', e.target.value)}
              >
                <option value="">Template default ({FONT_LABELS[base.headingFont]})</option>
                {HEADING_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {FONT_LABELS[font]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Text font</label>
              <select
                className={inputClass}
                value={draft.bodyFont}
                onChange={(e) => change('bodyFont', e.target.value)}
              >
                <option value="">Template default ({FONT_LABELS[base.bodyFont]})</option>
                {BODY_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {FONT_LABELS[font]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Corners</label>
              <select
                className={inputClass}
                value={draft.radius}
                onChange={(e) => change('radius', e.target.value)}
              >
                <option value="">Template default ({RADIUS_LABELS[base.radius]})</option>
                {Object.entries(RADIUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Preview {dirty ? '(not live yet)' : '(this is your live look)'}
          </p>
          <ThemePreview theme={draft} />
          <p className="text-[11px] text-gray-400 mt-2">
            This is a sample. Your real products, banner and pages will use the same colours,
            fonts and corners.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-gray-50/90 backdrop-blur py-4 mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={publish}
          disabled={!dirty || saving || readability === 'blocked'}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Publishing...' : 'Publish to my store'}
        </button>

        {dirty && (
          <button
            type="button"
            onClick={discard}
            className="border px-4 py-2.5 rounded-md text-sm text-gray-700 hover:bg-white"
          >
            Discard changes
          </button>
        )}

        {published && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircleIcon className="h-5 w-5" /> Published. Refresh your store to see it.
          </span>
        )}
      </div>
    </div>
  )
}

export default AdminThemes