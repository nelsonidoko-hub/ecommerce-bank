import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import ThemePreview from '../../../components/ThemePreview'
import { TEMPLATE_LIST, isHex } from '../../../utils/themes'
import { getAccount, errorMessage } from '../../../services/platformService'
import { getStudioTemplate, createStudioTemplate, updateStudioTemplate, setStudioStatus, deleteStudioTemplate } from '../../../services/studioService'
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
}
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

const blank = () => ({ key: '', label: '', bestFor: '', description: '', sampleSet: 'classic', recipe: recipeFromBuiltIn('classic') })

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

  useEffect(() => {
    if (isNew) return
    getStudioTemplate(id)
      .then((data) => {
        setSaved(data)
        setT({ key: data.key, label: data.label, bestFor: data.bestFor, description: data.description, sampleSet: data.sampleSet, recipe: data.recipe })
      })
      .catch((err) => setError(errorMessage(err, 'Could not load this template.')))
  }, [id, isNew])

  if (!t) return error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : <p className="text-slate-500">Loading…</p>

  const r = t.recipe
  const setRecipe = (patch) => setT({ ...t, recipe: { ...r, ...patch } })
  const setLayout = (patch) => setRecipe({ layout: { ...r.layout, ...patch } })
  const locked = saved?.status === 'published' && !founder

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
        {locked && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This template is in the gallery. Only the founder can change it now.</p>}

        <fieldset disabled={locked || Boolean(busy)} className="space-y-4">
          {isNew && (
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
                <input id="key" disabled={!isNew} maxLength={30} className={`${input} font-mono disabled:bg-slate-50`} placeholder="luxe" value={t.key} onChange={(e) => { setKeyTouched(true); setT({ ...t, key: slugify(e.target.value) }) }} />
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

          <Section title="Sample products" hint="What a new shop starts with (with pictures), and what the preview shows. Merchants replace them with their own.">
            <select aria-label="Sample products" className={input} value={t.sampleSet} onChange={(e) => setT({ ...t, sampleSet: e.target.value })}>
              {Object.entries(SAMPLE_SETS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
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
          {!isNew && saved?.status !== 'published' && (founder || saved?.status !== 'hidden') && (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={async () => {
                if (!window.confirm('Delete this template?')) return
                if (await run('delete', () => deleteStudioTemplate(id), 'Deleted.')) navigate('/studio')
              }}
              className="ml-auto rounded-lg px-3 py-2 text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              Delete
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
            <ThemePreview theme={{ template: t.key || 'new', recipe: r, sampleSet: t.sampleSet }} />
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
