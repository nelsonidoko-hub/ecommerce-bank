import { useEffect, useRef, useState } from 'react'
import { checkSlug } from '../../services/platformService'
import { PLATFORM_DOMAIN } from '../../utils/storeContext'
import { useAllTemplates } from '../usePlatformData'
import TemplateCard from './TemplateCard'

export const inputClass =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30'

// Same rule as the server's slugify, so the suggestion matches what is saved
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .replace(/-$/g, '')
}

// Shop name, address (checked as they type) and template.
// value: { shopName, slug, template }, onChange(next)
// Reports whether the address is usable through onReady(boolean).
function ShopFields({ value, onChange, onReady, showTemplates = true }) {
  const templates = useAllTemplates()
  const [slugEdited, setSlugEdited] = useState(Boolean(value.slug))
  const [check, setCheck] = useState({ state: 'idle' })
  const latest = useRef(0)

  const slug = slugEdited ? value.slug : slugify(value.shopName)

  // Keep the parent's slug in step with the automatic one
  useEffect(() => {
    if (!slugEdited && value.slug !== slug) onChange({ ...value, slug })
  }, [slug, slugEdited]) // eslint-disable-line react-hooks/exhaustive-deps

  // Ask the server, a moment after typing stops
  useEffect(() => {
    if (!slug) {
      setCheck({ state: 'idle' })
      onReady?.(false)
      return
    }
    const id = ++latest.current
    setCheck({ state: 'checking' })
    onReady?.(false)
    const timer = setTimeout(async () => {
      try {
        const result = await checkSlug({ slug })
        if (id !== latest.current) return
        setCheck({ state: result.available ? 'ok' : 'bad', ...result })
        onReady?.(Boolean(result.available))
      } catch {
        if (id !== latest.current) return
        // Can't check right now: let them try; the server checks again on submit
        setCheck({ state: 'unknown' })
        onReady?.(true)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const address = PLATFORM_DOMAIN ? `${slug || 'yourshop'}.${PLATFORM_DOMAIN}` : `${slug || 'yourshop'}`

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="shopName" className="mb-1.5 block text-sm font-medium text-slate-800">Shop name</label>
        <input
          id="shopName"
          className={inputClass}
          value={value.shopName}
          maxLength={80}
          required
          placeholder="e.g. Mama's Kitchen"
          onChange={(e) => onChange({ ...value, shopName: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-slate-800">Shop address</label>
        <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/30">
          <input
            id="slug"
            className="min-w-0 flex-1 px-3.5 py-2.5 text-sm outline-none"
            value={slug}
            maxLength={40}
            placeholder="yourshop"
            onChange={(e) => {
              setSlugEdited(true)
              onChange({ ...value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
            }}
          />
          {PLATFORM_DOMAIN && <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">.{PLATFORM_DOMAIN}</span>}
        </div>
        <p className="mt-1.5 min-h-5 text-xs" aria-live="polite">
          {check.state === 'checking' && <span className="text-slate-500">Checking {address}…</span>}
          {check.state === 'ok' && <span className="text-emerald-700">✓ {address} is yours</span>}
          {check.state === 'bad' && (
            <span className="text-red-600">
              {check.reason}.
              {check.suggestion && (
                <>
                  {' '}
                  <button
                    type="button"
                    className="font-semibold underline"
                    onClick={() => {
                      setSlugEdited(true)
                      onChange({ ...value, slug: check.suggestion })
                    }}
                  >
                    Use {check.suggestion}
                  </button>
                </>
              )}
            </span>
          )}
          {check.state === 'idle' && <span className="text-slate-500">Letters, numbers and dashes. You can add your own .com later on Pro.</span>}
        </p>
      </div>

      {showTemplates && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-800">
            Template: <span className="text-emerald-700">{templates.find((t) => t.id === value.template)?.label || value.template}</span>
            <span className="font-normal text-slate-500"> (you can switch any time)</span>
          </p>
          <div className="grid max-h-[28rem] grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-slate-200 p-2 sm:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} selected={value.template === t.id} onSelect={(id) => onChange({ ...value, template: id })} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ShopFields
