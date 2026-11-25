import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import ThemePreview from '../../../components/ThemePreview'
import { TEMPLATE_LIST, TEMPLATES, isHex } from '../../../utils/themes'
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

const blank = () => ({ key: '', label: '', bestFor: '', description: '', sampleSet: 'classic', recipe: recipeFromBuiltIn('classic'), pictures: {}, builtIn: '', samples: null })

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
        <p className="mb-1 text-xs font-medium text-slate-700">Categories (these become the shop's menu, up to 8)</p>
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
        {cats.length < 8 && (
          <button type="button" disabled={disabled} onClick={() => onChange({ ...samples, categories: [...cats, { label: '' }] })} className="mt-2 text-sm font-medium text-emerald-700">+ Add category</button>
        )}
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-700">Products (up to 12)</p>
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
        {products.length < 12 && (
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
  useEffect(() => {
    getStudioOptions().then(setOptions).catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) return
    getStudioTemplate(id)
      .then((data) => {
        setSaved(data)
        setT({ key: data.key, label: data.label, bestFor: data.bestFor, description: data.description, sampleSet: data.sampleSet, recipe: data.recipe, pictures: data.pictures || {}, builtIn: data.builtIn || '', samples: data.samples ? withLabels(data.samples) : null })
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
      <div className="order-2 space-y-4 lg:order-1">
        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
        {t.builtIn && (
          <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
            You're editing the built-in <b>{TEMPLATES[t.builtIn]?.label}</b> template. Once published, every shop using it gets this look. "Reset to original" brings the original back.
          </p>
        )}
        {locked && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This template is in the gallery. Only the founder can change it now.</p>}

        <fieldset disabled={locked || Boolean(busy)} className="space-y-4">
          {isNew && !t.builtIn && (
            <Section title="Start from" hint="Copies a built-in template's look. Then change anything below.">
              <select aria-label="Start from" className={input} defaultValue="classic" onChange={(e) => setT({ ...t, recipe: recipeFromBuiltIn(e.target.value), sampleSet: e.target.value })}>
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

          <Section title="Banner and footer">
            <Choice name="Banner" value={r.layout.hero} options={PART_LABELS.hero} onChange={(v) => setLayout({ hero: v })} columns="sm:grid-cols-3" />
            <Choice name="Footer" value={r.layout.footer} options={PART_LABELS.footer} onChange={(v) => setLayout({ footer: v })} />
          </Section>
        </fieldset>

        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
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
              className="ml-auto rounded-lg px-3 py-2 text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              {t.builtIn ? 'Reset to original' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-24">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-700">Live preview</p>
            {saved && <StatusChip status={saved.status} />}
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <ThemePreview theme={{ template: t.key || 'new', recipe: r, sampleSet: t.sampleSet, pictures: pics, samples: t.sampleSet === 'custom' ? previewSamples(t.samples) : null }} />
          </div>
          {saved && (
            <p className="mt-2 text-xs text-slate-500">
              {saved.shops} shop{saved.shops === 1 ? '' : 's'} using it
              {saved.demoUrl && (
                <>
                  {' · '}
                  <a href={saved.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    Open demo shop <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </a>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function StudioEditor() {
  return (
    <StudioOnly>
      <section className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link to="/studio" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
            <ArrowLeftIcon className="h-4 w-4" /> Template Studio
          </Link>
          <Editor />
        </div>
      </section>
    </StudioOnly>
  )
}

export default StudioEditor
