import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon, ComputerDesktopIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import SectionList from '../../../components/builder/SectionList'
import { SectionUploadContext } from '../../../components/builder/SectionEditor'
import ThemePreview from '../../../components/ThemePreview'
import { TEMPLATE_LIST, TEMPLATES, LAYOUT_DEFAULTS, isHex } from '../../../utils/themes'
import { PREVIEW_SETS } from '../../../utils/pictureIcons'
import { getAccount, errorMessage } from '../../../services/platformService'
import { getStudioTemplate, createStudioTemplate, updateStudioTemplate, setStudioStatus, deleteStudioTemplate, getStudioOptions, uploadStudioPicture } from '../../../services/studioService'
import { forgetStudioGallery } from '../../usePlatformData'
import { StudioOnly, StatusChip, PART_LABELS, recipeFromBuiltIn } from './shared'

const SAMPLE_SETS = {
  classic: 'Everyday clothing',
  minimal: 'Fashion and boutique',
  bold: 'Streetwear and sneakers',
  fresh: 'Food and restaurant menu',
  catalog: 'Big general store (home and kitchen)',
  glow: 'Beauty and skincare',
  tech: 'Phones and gadgets',
  playful: 'Babies and kids',
  custom: 'My own products (type them in)',
}
// The server keeps category names (e.g. "grains-tubers"); the editor works with labels
const withLabels = (samples) => ({
  ...samples,
  products: (samples.products || []).map((p) => ({ ...p, category: samples.categories?.find((c) => c.name === p.category)?.label || p.category })),
})
// What the live preview shows while typing (skips half-filled rows)
const previewSamples = (samples) =>
  samples && { ...samples, categories: (samples.categories || []).filter((c) => c.label.trim()), products: (samples.products || []).filter((p) => p.name.trim()) }

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none'
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30)

function Section({ title, hint, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-poppins text-sm font-semibold text-slate-900">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

// Pick one of a few options, each with a short explanation
function Choice({ name, value, options, onChange, columns = 'sm:grid-cols-2' }) {
  return (
    <div className={`grid gap-2 ${columns}`} role="radiogroup" aria-label={name}>
      {Object.entries(options).map(([id, [label, help]]) => (
        <label key={id} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm ${value === id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
          <input type="radio" name={name} className="mt-0.5 accent-emerald-600" checked={value === id} onChange={() => onChange(id)} />
          <span>
            <span className="block font-medium text-slate-900">{label}</span>
            {help && <span className="block text-xs text-slate-500">{help}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

function Colour({ label, value, onChange, optional }) {
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={label} value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} className="h-9 w-11 cursor-pointer rounded border p-0.5" />
        <input
          className={`${input} font-mono`}
          value={text}
          maxLength={7}
          placeholder={optional ? 'None (white / standard)' : '#000000'}
          onChange={(e) => {
            setText(e.target.value)
            if (isHex(e.target.value) || (optional && e.target.value === '')) onChange(e.target.value.toLowerCase())
          }}
        />
        {optional && value && <button type="button" onClick={() => onChange('')} className="shrink-0 text-xs text-slate-500 underline">None</button>}
      </div>
    </div>
  )
}

const blank = () => ({ key: '', label: '', bestFor: '', description: '', sampleSet: 'classic', recipe: recipeFromBuiltIn('classic'), pictures: {}, builtIn: '', samples: null, visibility: 'public', allowedEmails: '', content: null })
const clone = (v) => (v ? JSON.parse(JSON.stringify(v)) : v)

// The categories a section can show: the sample set's, or the template's own
const slug = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
function sampleCategories(t, options) {
  if (t.sampleSet === 'custom') {
    return (t.samples?.categories || []).filter((c) => c.label?.trim()).map((c) => ({ _id: slug(c.label), name: slug(c.label), label: c.label.trim() }))
  }
  return (options?.sampleCategories?.[t.sampleSet] || []).map((c) => ({ _id: c.name, ...c }))
}

// What the preview frame is sent
function studioMessage(t) {
  return {
    type: 'studio:design',
    theme: { template: t.builtIn || t.key || 'studio-new', recipe: t.recipe, sampleSet: t.sampleSet },
    homeSections: t.content?.homeSections || [],
    hero: t.content?.hero || null,
  }
}

// Pictures in homepage sections go to the platform's template photos
const studioUpload = { upload: async (file) => (await uploadStudioPicture(file)).url, emptyText: 'Sample picture' }

// Starting point when switching to "My own products": the chosen set's
// categories and first products (and any photos already added for them)
function samplesFrom(set, names, pictures) {
  const preset = PREVIEW_SETS[set] || PREVIEW_SETS.classic
  const products = (names?.length ? names.slice(0, 6) : preset.products.map((p) => p[0])).map((name) => {
    const known = preset.products.find((p) => p[0] === name)
    return { name, price: known ? Number(known[1].replace(/[^0-9]/g, '')) : 5000, category: preset.menu[0], description: '', image: pictures?.products?.[name] || '' }
  })
  return { heading: preset.banner, text: '', categories: preset.menu.map((label) => ({ label })), products }
}

// "My own products": the template's own menu (categories) and products
function OwnProducts({ samples, onChange, disabled }) {
  const cats = samples.categories || []
  const products = samples.products || []
  const setProduct = (i, patch) => onChange({ ...samples, products: products.map((p, j) => (j === i ? { ...p, ...patch } : p)) })
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Banner heading</label>
          <input maxLength={60} aria-label="Banner heading" className={input} placeholder="e.g. Straight from the farm" value={samples.heading || ''} onChange={(e) => onChange({ ...samples, heading: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Banner line</label>
          <input maxLength={120} aria-label="Banner line" className={input} placeholder="e.g. Harvested this week" value={samples.text || ''} onChange={(e) => onChange({ ...samples, text: e.target.value })} />
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-700">Categories (these become the shop's menu, up to 20)</p>
        <div className="space-y-2">
          {cats.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input maxLength={30} aria-label={`Category ${i + 1}`} className={input} placeholder="e.g. Vegetables" value={c.label} onChange={(e) => onChange({ ...samples, categories: cats.map((x, j) => (j === i ? { label: e.target.value } : x)) })} />
              {cats.length > 1 && (
                <button type="button" disabled={disabled} onClick={() => onChange({ ...samples, categories: cats.filter((_, j) => j !== i) })} className="shrink-0 text-xs text-slate-500 underline">Remove</button>
              )}
            </div>
          ))}
        </div>
        {cats.length < 20 && (
          <button type="button" disabled={disabled} onClick={() => onChange({ ...samples, categories: [...cats, { label: '' }] })} className="mt-2 text-sm font-medium text-emerald-700">+ Add category</button>
        )}
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-700">Products (up to 60)</p>
        <div className="space-y-3">
          {products.map((p, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_8rem_10rem]">
                <input maxLength={60} aria-label={`Product ${i + 1} name`} className={input} placeholder="Product name" value={p.name} onChange={(e) => setProduct(i, { name: e.target.value })} />
                <input type="number" min={0} aria-label={`Product ${i + 1} price`} className={input} placeholder="Price ₦" value={p.price} onChange={(e) => setProduct(i, { price: e.target.value })} />
                <select aria-label={`Product ${i + 1} category`} className={input} value={p.category} onChange={(e) => setProduct(i, { category: e.target.value })}>
                  {cats.filter((c) => c.label.trim()).map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
                </select>
              </div>
              <input maxLength={200} aria-label={`Product ${i + 1} description`} className={input} placeholder="Short description (optional)" value={p.description || ''} onChange={(e) => setProduct(i, { description: e.target.value })} />
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <PhotoSlot label="Photo" url={p.image} onChange={(u) => setProduct(i, { image: u })} disabled={disabled} />
                </div>
                {products.length > 1 && (
                  <button type="button" disabled={disabled} onClick={() => onChange({ ...samples, products: products.filter((_, j) => j !== i) })} className="shrink-0 text-xs text-red-600 underline">Remove product</button>
                )}
              </div>
            </div>
          ))}
        </div>
        {products.length < 60 && (
          <button type="button" disabled={disabled} onClick={() => onChange({ ...samples, products: [...products, { name: '', price: '', category: cats[0]?.label || '', description: '', image: '' }] })} className="mt-2 text-sm font-medium text-emerald-700">+ Add product</button>
        )}
      </div>
    </div>
  )
}

// One photo slot: thumbnail, upload, remove
function PhotoSlot({ label, url, onChange, disabled }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange((await uploadStudioPicture(file)).url)
    } catch (err) {
      setError(errorMessage(err, 'Upload failed.'))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100 bg-cover bg-center" style={url ? { backgroundImage: `url("${url}")` } : undefined} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{label}</p>
        <p className={`text-xs ${error ? 'text-red-600' : 'text-slate-400'}`}>{error || (url ? 'Photo added' : 'Drawn picture for now')}</p>
      </div>
      <label className={`shrink-0 cursor-pointer rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 ${disabled || busy ? 'pointer-events-none opacity-50' : ''}`}>
        {busy ? 'Uploading…' : url ? 'Change' : 'Upload'}
        <input type="file" accept="image/*" className="sr-only" disabled={disabled || busy} onChange={pick} />
      </label>
      {url && !disabled && (
        <button type="button" onClick={() => onChange('')} className="shrink-0 text-xs text-slate-500 underline">Remove</button>
      )}
    </div>
  )
}

// An older recipe has no "rest of the shop" structure yet: start from the
// built-in it edits (or the standard one), so the choices shown are what the
// shop really looks like
function withStructure(recipe, builtIn) {
  const base = TEMPLATES[builtIn]?.layout || LAYOUT_DEFAULTS
  const fill = Object.fromEntries(Object.keys(LAYOUT_DEFAULTS).filter((k) => k !== 'nav' && k !== 'home').map((k) => [k, base[k]]))
  return { ...recipe, layout: { ...fill, ...(recipe?.layout || {}) } }
}

function Editor() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const founder = getAccount()?.role === 'superadmin'
  const [t, setT] = useState(isNew ? blank() : null)
  const [saved, setSaved] = useState(null) // server copy (status, shops, demoUrl)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [keyTouched, setKeyTouched] = useState(false)
  const [options, setOptions] = useState(null)
  const [tab, setTab] = useState('details')
  const [device, setDevice] = useState('desktop')
  const [mobilePreview, setMobilePreview] = useState(false)
  useEffect(() => {
    getStudioOptions().then(setOptions).catch(() => {})
  }, [])
  // A new template starts with the homepage of the template it starts from
  useEffect(() => {
    if (options?.builtInContent && t && !t.content) {
      setT((cur) => (cur && !cur.content ? { ...cur, content: clone(options.builtInContent[cur.builtIn || cur.sampleSet] || options.builtInContent.classic) } : cur))
    }
  }, [options, t])

  // The live preview: a real demo shop in a frame, showing this template as
  // it is being made (look, homepage, banner and button words)
  const frame = useRef(null)
  const latest = useRef(null)
  latest.current = t
  const previewUrl = useMemo(() => {
    const raw = saved?.previewUrl || options?.demoUrls?.[`demo-${t?.sampleSet}`] || options?.demoUrls?.['demo-classic'] || ''
    if (!raw) return ''
    try {
      const url = new URL(raw, typeof window !== 'undefined' ? window.location.href : undefined)
      url.searchParams.set('studio', '1')
      return url.href
    } catch {
      return ''
    }
  }, [saved?.previewUrl, options, t?.sampleSet])
  const push = useCallback(() => {
    const cur = latest.current
    const win = frame.current?.contentWindow
    if (!cur || !win || !previewUrl) return
    win.postMessage(studioMessage(cur), new URL(previewUrl).origin)
  }, [previewUrl])
  useEffect(() => {
    push()
  }, [t, push])
  useEffect(() => {
    if (!previewUrl) return
    const origin = new URL(previewUrl).origin
    const onMessage = (event) => {
      if (event.origin === origin && event.data?.type === 'studio:ready') push()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [previewUrl, push])

  useEffect(() => {
    if (isNew) return
    getStudioTemplate(id)
      .then((data) => {
        setSaved(data)
        setT({ key: data.key, label: data.label, bestFor: data.bestFor, description: data.description, sampleSet: data.sampleSet, recipe: withStructure(data.recipe, data.builtIn), pictures: data.pictures || {}, builtIn: data.builtIn || '', samples: data.samples ? withLabels(data.samples) : null, visibility: data.visibility || 'public', allowedEmails: (data.allowedEmails || []).join(', '), content: clone(data.content) || null })
      })
      .catch((err) => setError(errorMessage(err, 'Could not load this template.')))
  }, [id, isNew])

  if (!t) return error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : <p className="text-slate-500">Loading…</p>

  const r = t.recipe
  const setRecipe = (patch) => setT({ ...t, recipe: { ...r, ...patch } })
  const setLayout = (patch) => setRecipe({ layout: { ...r.layout, ...patch } })
  const locked = saved?.status === 'published' && !founder
  const pics = t.pictures || {}
  const setPicture = (slot, url) => setT({ ...t, pictures: { ...pics, [slot]: url } })
  const setProductPicture = (name, url) => setT({ ...t, pictures: { ...pics, products: { ...(pics.products || {}), [name]: url } } })
  const sampleNames = options?.sampleProducts?.[t.sampleSet] || []

  async function run(kind, fn, done) {
    setBusy(kind)
    setError('')
    setNotice('')
    try {
      const data = await fn()
      forgetStudioGallery()
      if (data?._id) {
        setSaved(data)
        if (isNew) navigate(`/studio/${data._id}`, { replace: true })
      }
      setNotice(done)
      return data
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy('')
    }
  }
  const save = () => run('save', () => (isNew ? createStudioTemplate(t) : updateStudioTemplate(id, t)), 'Saved.')
  const status = (s, done) => run(s, async () => {
    if (!isNew) await updateStudioTemplate(id, t)
    return setStudioStatus(id, s)
  }, done)

  const content = t.content || { hero: {}, homeSections: [] }
  const setContent = (patch) => setT({ ...t, content: { ...content, ...patch } })
  const setHero = (patch) => setContent({ hero: { ...(content.hero || {}), ...patch } })
  const words = r.words || {}
  const base = TEMPLATES[t.builtIn] || TEMPLATES[t.sampleSet] || TEMPLATES.classic
  const categories = sampleCategories(t, options)
  const tabs = [
    ['details', 'Details'],
    ['look', 'Look'],
    ['layout', 'Layout'],
    ['homepage', 'Homepage & words'],
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <Link to="/studio" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeftIcon className="h-4 w-4" /> Studio
        </Link>
        <div className="mr-auto min-w-0">
          <p className="truncate font-semibold text-slate-900">{t.label || 'New template'}</p>
          <p className="text-xs text-slate-500">
            {saved ? `${saved.shops} shop${saved.shops === 1 ? '' : 's'} using it` : 'Not saved yet'}
            {saved?.demoUrl && (
              <>
                {' · '}
                <a href={saved.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  Open demo shop <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                </a>
              </>
            )}
          </p>
        </div>
        {saved && <StatusChip status={saved.status} />}
        <div className="hidden rounded-md border border-slate-200 p-0.5 lg:flex">
          <button type="button" aria-label="Laptop view" onClick={() => setDevice('desktop')} className={`rounded p-1.5 ${device === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
            <ComputerDesktopIcon className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Phone view" onClick={() => setDevice('phone')} className={`rounded p-1.5 ${device === 'phone' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
            <DevicePhoneMobileIcon className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={() => setMobilePreview(!mobilePreview)} className="rounded-md border px-3 py-2 text-sm lg:hidden">
          {mobilePreview ? 'Edit' : 'Preview'}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {!locked && (
            <button type="button" disabled={Boolean(busy)} onClick={save} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy === 'save' ? 'Saving…' : isNew ? 'Create draft' : 'Save'}
            </button>
          )}
          {!isNew && saved?.status === 'draft' && (
            <button type="button" disabled={Boolean(busy)} onClick={() => status('review', 'Sent to the founder for review.')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50">
              Send for review
            </button>
          )}
          {!isNew && founder && saved?.status !== 'published' && (
            <button type="button" disabled={Boolean(busy)} onClick={() => status('published', 'Published. It is in the gallery, with its own demo shop.')} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy === 'published' ? 'Publishing…' : 'Publish to gallery'}
            </button>
          )}
          {!isNew && founder && saved?.status === 'published' && (
            <button type="button" disabled={Boolean(busy)} onClick={() => window.confirm('Hide it from the gallery? Shops already using it keep it.') && status('hidden', 'Hidden from the gallery.')} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">
              Hide from gallery
            </button>
          )}
          {!isNew && saved?.status === 'review' && (
            <button type="button" disabled={Boolean(busy)} onClick={() => status('draft', 'Back to draft.')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50">
              Back to draft
            </button>
          )}
          {!isNew && (t.builtIn ? founder || !['published', 'hidden'].includes(saved?.status) : saved?.status !== 'published' && (founder || saved?.status !== 'hidden')) && (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={async () => {
                if (!window.confirm(t.builtIn ? 'Reset to the original? Shops using it go back to the original look.' : 'Delete this template?')) return
                if (await run('delete', () => deleteStudioTemplate(id), 'Deleted.')) navigate('/studio')
              }}
              className="rounded-lg px-3 py-2 text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              {t.builtIn ? 'Reset to original' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className={`w-full shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 lg:block lg:w-[460px] ${mobilePreview ? 'hidden' : 'block'}`}>
          <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-white">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex-1 px-2 py-3 text-xs font-medium sm:text-sm ${tab === id ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-4 p-4">
          {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
          {t.builtIn && (
            <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
              You're editing the built-in <b>{TEMPLATES[t.builtIn]?.label}</b> template. Once published, every shop using it gets this look. "Reset to original" brings the original back.
            </p>
          )}
          {locked && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This template is in the gallery. Only the founder can change it now.</p>}
            <fieldset disabled={locked || Boolean(busy)} className="space-y-4">
              {tab === 'details' && (
                <>
                {isNew && !t.builtIn && (
                  <Section title="Start from" hint="Copies a built-in template's look. Then change anything below.">
                    <select aria-label="Start from" className={input} defaultValue="classic" onChange={(e) => setT({ ...t, recipe: recipeFromBuiltIn(e.target.value), sampleSet: e.target.value, content: clone(options?.builtInContent?.[e.target.value]) || t.content })}>
                      {TEMPLATE_LIST.map((b) => <option key={b.id} value={b.id}>{b.label} ({b.bestFor})</option>)}
                    </select>
                  </Section>
                )}

                <Section title="Name and description" hint="What merchants see in the gallery.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="label" className="mb-1 block text-xs font-medium text-slate-700">Template name</label>
                      <input id="label" required maxLength={40} className={input} placeholder="e.g. Luxe" value={t.label} onChange={(e) => setT({ ...t, label: e.target.value, ...(isNew && !keyTouched ? { key: slugify(e.target.value) } : {}) })} />
                    </div>
                    <div>
                      <label htmlFor="key" className="mb-1 block text-xs font-medium text-slate-700">Short name (can't change later)</label>
                      <input id="key" disabled={!isNew || Boolean(t.builtIn)} maxLength={30} className={`${input} font-mono disabled:bg-slate-50`} placeholder="luxe" value={t.key} onChange={(e) => { setKeyTouched(true); setT({ ...t, key: slugify(e.target.value) }) }} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bestFor" className="mb-1 block text-xs font-medium text-slate-700">Best for</label>
                    <input id="bestFor" maxLength={60} className={input} placeholder="e.g. Jewellery and luxury shops" value={t.bestFor} onChange={(e) => setT({ ...t, bestFor: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="description" className="mb-1 block text-xs font-medium text-slate-700">Description</label>
                    <textarea id="description" rows={2} maxLength={240} className={input} placeholder="e.g. Black and gold, elegant serif headings, centred products." value={t.description} onChange={(e) => setT({ ...t, description: e.target.value })} />
                  </div>
                </Section>

                {!t.builtIn && (
                  <Section title="Who can use it" hint="Public templates go in the gallery for everyone. Private ones are made for particular clients: only their accounts can use them, and they never show in the gallery.">
                    <Choice
                      name="Who can use it"
                      value={t.visibility}
                      options={{ public: ['Everyone (gallery)', 'Any merchant can pick it'], private: ['Private (for clients)', 'Only the emails below'] }}
                      onChange={(v) => setT({ ...t, visibility: v })}
                    />
                    {t.visibility === 'private' && (
                      <div>
                        <label htmlFor="allowed" className="mb-1 block text-xs font-medium text-slate-700">Client emails (their platform account emails, separated by commas)</label>
                        <textarea id="allowed" rows={2} className={input} placeholder="amaka@gmail.com, amaka.shop@gmail.com" value={t.allowedEmails} onChange={(e) => setT({ ...t, allowedEmails: e.target.value })} />
                        <p className="mt-1 text-xs text-slate-500">Tip: use Founder → Clients to make the client's shop with this template for them.</p>
                      </div>
                    )}
                  </Section>
                )}

                <Section title="Sample products" hint="What a new shop starts with (menu, products and pictures), and what the preview shows. Merchants replace them with their own. Nothing fits? Choose “My own products” and type them in.">
                  <select aria-label="Sample products" className={input} value={t.sampleSet} onChange={(e) => setT({ ...t, sampleSet: e.target.value, samples: e.target.value === 'custom' ? t.samples || samplesFrom(t.sampleSet, sampleNames, pics) : t.samples })}>
                    {Object.entries(SAMPLE_SETS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                  {t.sampleSet === 'custom' && t.samples && <OwnProducts samples={t.samples} onChange={(samples) => setT({ ...t, samples })} disabled={locked} />}
                </Section>

                <Section
                  title="Photos (optional)"
                  hint="Real photos make the template easier to imagine. New shops and the demo shop start with them; anything without a photo gets a drawn picture. Use your own photos or free-licence stock (e.g. Unsplash, Pexels), never pictures copied from other shops or Google. Up to 5 MB each."
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <PhotoSlot label="Top banner (big picture)" url={pics.hero} onChange={(u) => setPicture('hero', u)} disabled={locked} />
                    <PhotoSlot label="Middle banner" url={pics.banner} onChange={(u) => setPicture('banner', u)} disabled={locked} />
                    <PhotoSlot label="Featured picture" url={pics.featured} onChange={(u) => setPicture('featured', u)} disabled={locked} />
                    {t.sampleSet !== 'custom' && sampleNames.map((name) => (
                      <PhotoSlot key={name} label={name} url={pics.products?.[name]} onChange={(u) => setProductPicture(name, u)} disabled={locked} />
                    ))}
                  </div>
                </Section>
                </>
              )}
              {tab === 'look' && (
                <>
                <Section title="Colours">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Colour label="Accent (buttons, links)" value={r.brand} onChange={(v) => setRecipe({ brand: v })} />
                    <Colour label="Dark text and buttons" value={r.ink} optional onChange={(v) => setRecipe({ ink: v })} />
                    <Colour label="Page background" value={r.surface} optional onChange={(v) => setRecipe({ surface: v })} />
                  </div>
                </Section>

                <Section title="Fonts and corners">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">Headings</label>
                      <select aria-label="Heading font" className={input} value={r.headingFont} onChange={(e) => setRecipe({ headingFont: e.target.value })}>
                        {Object.entries(PART_LABELS.headingFont).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">Body text</label>
                      <select aria-label="Body font" className={input} value={r.bodyFont} onChange={(e) => setRecipe({ bodyFont: e.target.value })}>
                        {Object.entries(PART_LABELS.bodyFont).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">Heading thickness</label>
                      <select aria-label="Heading thickness" className={input} value={r.headingWeight} onChange={(e) => setRecipe({ headingWeight: Number(e.target.value) })}>
                        {Object.entries(PART_LABELS.headingWeight).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">Corners</label>
                      <select aria-label="Corners" className={input} value={r.radius} onChange={(e) => setRecipe({ radius: e.target.value })}>
                        {Object.entries(PART_LABELS.radius).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" className="accent-emerald-600" checked={r.uppercase} onChange={(e) => setRecipe({ uppercase: e.target.checked })} />
                    HEADINGS IN CAPITALS
                  </label>
                </Section>
                </>
              )}
              {tab === 'layout' && (
                <>
                <Section title="Page structure" hint="What makes templates really different: where the menu, banner and products go.">
                  <p className="text-xs font-medium text-slate-700">Menu bar</p>
                  <Choice name="Menu bar" value={r.layout.nav || 'standard'} options={PART_LABELS.nav} onChange={(v) => setLayout({ nav: v })} columns="sm:grid-cols-3" />
                  <p className="text-xs font-medium text-slate-700">Banner</p>
                  <Choice name="Banner" value={r.layout.hero} options={PART_LABELS.hero} onChange={(v) => setLayout({ hero: v })} columns="sm:grid-cols-3" />
                  <p className="text-xs font-medium text-slate-700">Homepage</p>
                  <Choice name="Homepage" value={r.layout.home || 'sections'} options={PART_LABELS.home} onChange={(v) => setLayout({ home: v })} />
                </Section>

                <Section title="Product cards" hint="How each product looks in the shop.">
                  <Choice name="Product card style" value={r.layout.card} options={PART_LABELS.card} onChange={(v) => setLayout(v === 'menu' ? { card: v, grid: 'list' } : { card: v, grid: r.layout.grid === 'list' ? 'grid' : r.layout.grid })} />
                </Section>

                <Section title="Product layout">
                  <Choice name="Product layout" value={r.layout.grid} options={PART_LABELS.grid} onChange={(v) => setLayout({ grid: v })} />
                  {r.layout.grid === 'grid' && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">Products per row on a computer (phones always show 2)</label>
                      <select aria-label="Products per row" className={input} value={r.layout.columns} onChange={(e) => setLayout({ columns: Number(e.target.value) })}>
                        {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" className="accent-emerald-600" checked={r.layout.search} onChange={(e) => setLayout({ search: e.target.checked })} />
                    Big search box above the products (good for shops with lots of products)
                  </label>
                </Section>

                <Section title="Homepage sections" hint="How the sections under the banner look.">
                  <p className="text-xs font-medium text-slate-700">Product rows</p>
                  <Choice name="Product rows" value={r.layout.rows || 'grid'} options={PART_LABELS.rows} onChange={(v) => setLayout({ rows: v })} />
                  <p className="text-xs font-medium text-slate-700">Shop by category (under the banner)</p>
                  <Choice name="Shop by category" value={r.layout.categories || 'none'} options={PART_LABELS.categories} onChange={(v) => setLayout({ categories: v })} columns="sm:grid-cols-3" />
                  <p className="text-xs font-medium text-slate-700">Customer reviews</p>
                  <Choice name="Customer reviews" value={r.layout.quotes || 'cards'} options={PART_LABELS.quotes} onChange={(v) => setLayout({ quotes: v })} columns="sm:grid-cols-3" />
                </Section>

                <Section title="Product page" hint="The page a customer sees after tapping a product.">
                  <Choice name="Product page" value={r.layout.product || 'classic'} options={PART_LABELS.product} onChange={(v) => setLayout({ product: v })} />
                </Section>

                <Section title="Shop & category pages" hint="The pages that list all products, or one category.">
                  <Choice name="Shop pages" value={r.layout.listing || 'standard'} options={PART_LABELS.listing} onChange={(v) => setLayout({ listing: v })} />
                </Section>

                <Section title="Spacing & feel">
                  <Choice name="Spacing" value={r.layout.density || 'normal'} options={PART_LABELS.density} onChange={(v) => setLayout({ density: v })} columns="sm:grid-cols-3" />
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" className="accent-emerald-600" checked={r.layout.bands === true} onChange={(e) => setLayout({ bands: e.target.checked })} />
                    Coloured bands: every other homepage section on a soft tint of the accent colour
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" className="accent-emerald-600" checked={r.layout.dividers === true} onChange={(e) => setLayout({ dividers: e.target.checked })} />
                    Thin lines between homepage sections
                  </label>
                </Section>

                <Section title="Footer">
                  <Choice name="Footer" value={r.layout.footer} options={PART_LABELS.footer} onChange={(v) => setLayout({ footer: v })} />
                </Section>
                </>
              )}
              {tab === 'homepage' && (
                <>
                  <Section title="Banner words" hint="The words on the big banner at the top. {shop} becomes the shop's name.">
                    <div>
                      <label htmlFor="heroHeading" className="mb-1 block text-xs font-medium text-slate-700">Heading</label>
                      <input id="heroHeading" maxLength={120} className={input} placeholder="Welcome to {shop}" value={content.hero?.heading || ''} onChange={(e) => setHero({ heading: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="heroText" className="mb-1 block text-xs font-medium text-slate-700">Small text</label>
                      <input id="heroText" maxLength={300} className={input} placeholder="Fresh picks, fair prices, fast delivery." value={content.hero?.text || ''} onChange={(e) => setHero({ text: e.target.value })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="heroButton" className="mb-1 block text-xs font-medium text-slate-700">Button text</label>
                        <input id="heroButton" maxLength={40} className={input} placeholder="Shop now" value={content.hero?.buttonLabel || ''} onChange={(e) => setHero({ buttonLabel: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor="heroLink" className="mb-1 block text-xs font-medium text-slate-700">Button goes to</label>
                        <select id="heroLink" className={input} value={content.hero?.buttonLink || '/shop'} onChange={(e) => setHero({ buttonLink: e.target.value })}>
                          <option value="/shop">All products</option>
                          {categories.map((c) => <option key={c.name} value={`/category/${c.name}`}>{c.label}</option>)}
                          <option value="/about">About page</option>
                          <option value="/contact">Contact page</option>
                        </select>
                      </div>
                    </div>
                  </Section>

                  <Section title="Button words" hint="The words on the product buttons in every shop using this template. Merchants can change them for their own shop.">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="wordAdd" className="mb-1 block text-xs font-medium text-slate-700">Add button</label>
                        <input id="wordAdd" maxLength={24} className={input} placeholder={base.words?.add} value={words.add || ''} onChange={(e) => setRecipe({ words: { ...words, add: e.target.value } })} />
                      </div>
                      <div>
                        <label htmlFor="wordBuy" className="mb-1 block text-xs font-medium text-slate-700">Buy button</label>
                        <input id="wordBuy" maxLength={24} className={input} placeholder={base.words?.buy} value={words.buy || ''} onChange={(e) => setRecipe({ words: { ...words, buy: e.target.value } })} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">For example a restaurant: "Add to order" and "Order now".</p>
                  </Section>

                  <Section title="Homepage sections" hint="What a new shop's homepage starts with, top to bottom: product rows, promo banners, your story, reviews, WhatsApp. Merchants can change everything later in their builder.">
                    <SectionUploadContext.Provider value={studioUpload}>
                      <SectionList
                        sections={content.homeSections || []}
                        onChange={(homeSections) => setContent({ homeSections })}
                        categories={categories}
                        intro="Click a section to change its words, pictures and products. Pictures left empty get a sample picture."
                      />
                    </SectionUploadContext.Provider>
                  </Section>
                </>
              )}
            </fieldset>
          </div>
        </aside>

        <div className={`min-w-0 flex-1 items-start justify-center overflow-auto bg-slate-200 p-4 lg:flex ${mobilePreview ? 'flex' : 'hidden'}`}>
          {previewUrl ? (
            <iframe
              ref={frame}
              title="Template preview"
              src={previewUrl}
              onLoad={push}
              className={`h-full rounded-lg border border-slate-300 bg-white shadow-sm ${device === 'phone' ? 'w-[390px]' : 'w-full'}`}
            />
          ) : (
            <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <ThemePreview theme={{ template: t.key || 'new', recipe: r, sampleSet: t.sampleSet, pictures: pics, samples: t.sampleSet === 'custom' ? previewSamples(t.samples) : null }} />
              <p className="p-3 text-xs text-slate-500">The full shop preview appears once the demo shops exist (Founder: run npm run seed-demos).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StudioEditor() {
  return (
    <StudioOnly>
      <section className="bg-slate-50">
        <Editor />
      </section>
    </StudioOnly>
  )
}

export default StudioEditor
