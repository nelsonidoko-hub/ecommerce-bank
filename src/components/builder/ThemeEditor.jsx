import { useEffect, useState } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import ThemePreview from '../ThemePreview'
import { useAllTemplates, previewTheme } from '../../platform/usePlatformData'
import {
  TEMPLATES,
  recipeTemplate,
  FONT_LABELS,
  HEADING_FONTS,
  BODY_FONTS,
  RADIUS_LABELS,
  CLASSIC_BRAND_DISPLAY,
  resolveTheme,
  isHex,
  brandReadability,
} from '../../utils/themes'

export const EMPTY_THEME = { template: 'classic', brandColor: '', headingFont: '', bodyFont: '', radius: '' }
const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm'

// Template, colour, fonts and corners. Controlled: value + onChange(theme).
function ThemeEditor({ value, onChange, liveTemplate }) {
  const theme = { ...EMPTY_THEME, ...value }
  const [hex, setHex] = useState(theme.brandColor)
  useEffect(() => setHex(theme.brandColor), [theme.brandColor])

  const resolved = resolveTheme(theme)
  const gallery = useAllTemplates()
  // A template made just for this shop (private) isn't in the gallery: show it first
  const own = !gallery.some((t) => t.id === theme.template) && theme.recipe ? recipeTemplate(theme.template, theme.recipe, { label: 'Your own template', sampleSet: theme.sampleSet, pictures: theme.pictures, samples: theme.samples }) : null
  const templates = own ? [own, ...gallery] : gallery
  const base = TEMPLATES[theme.template] || recipeTemplate(theme.template, theme.recipe) || TEMPLATES.classic
  const readability = brandReadability(resolved.brand)
  const set = (field, v) => onChange({ ...theme, [field]: v })

  function changeBrand(v) {
    setHex(v)
    if (v === '') set('brandColor', '')
    else if (isHex(v)) set('brandColor', v.toLowerCase())
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Template</h3>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => {
            const selected = theme.template === t.id
            return (
              <button
                key={t.id}
                type="button"
                // a new template starts from its own colours, fonts and corners
                onClick={() => onChange({ ...EMPTY_THEME, template: t.id, ...(t.studio ? { recipe: t, sampleSet: t.sampleSet } : {}) })}
                aria-pressed={selected}
                className={`rounded-lg border-2 p-2 text-left transition ${selected ? 'border-blue-600' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <ThemePreview theme={previewTheme(t)} compact />
                <span className="mt-1.5 flex items-center justify-between gap-1 text-xs font-semibold text-gray-900">
                  {t.label}
                  {liveTemplate === t.id && <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">Live</span>}
                </span>
                <span className="block text-[10px] text-gray-400">{t.bestFor}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Customise {base.label}</h3>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Brand colour (buttons, links, highlights)</label>
          <div className="flex items-center gap-2">
            <input type="color" value={resolved.brand || CLASSIC_BRAND_DISPLAY} onChange={(e) => changeBrand(e.target.value)} className="h-10 w-12 cursor-pointer rounded border p-0.5" aria-label="Pick brand colour" />
            <input className={`${inputClass} font-mono`} value={hex} maxLength={7} placeholder={resolved.brand || 'Template colour'} onChange={(e) => changeBrand(e.target.value)} />
            {theme.brandColor && (
              <button type="button" onClick={() => changeBrand('')} className="shrink-0 text-xs text-blue-600 hover:underline">Reset</button>
            )}
          </div>
          {readability === 'blocked' && (
            <p className="mt-2 flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
              Too light: white button text would be unreadable. Choose a darker colour to publish.
            </p>
          )}
          {readability === 'poor' && (
            <p className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
              Quite light: button text may be hard to read. Check the preview.
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Heading font</label>
          <select className={inputClass} value={theme.headingFont} onChange={(e) => set('headingFont', e.target.value)}>
            <option value="">Template default ({FONT_LABELS[base.headingFont]})</option>
            {HEADING_FONTS.map((f) => <option key={f} value={f}>{FONT_LABELS[f]}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Text font</label>
          <select className={inputClass} value={theme.bodyFont} onChange={(e) => set('bodyFont', e.target.value)}>
            <option value="">Template default ({FONT_LABELS[base.bodyFont]})</option>
            {BODY_FONTS.map((f) => <option key={f} value={f}>{FONT_LABELS[f]}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Corners</label>
          <select className={inputClass} value={theme.radius} onChange={(e) => set('radius', e.target.value)}>
            <option value="">Template default ({RADIUS_LABELS[base.radius]})</option>
            {Object.entries(RADIUS_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

export const themeBlocked = (theme) => brandReadability(resolveTheme(theme).brand) === 'blocked'

export default ThemeEditor
