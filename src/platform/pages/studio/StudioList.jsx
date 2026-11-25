import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import ThemePreview from '../../../components/ThemePreview'
import { listStudio, createStudioTemplate } from '../../../services/studioService'
import { TEMPLATE_LIST } from '../../../utils/themes'
import { errorMessage } from '../../../services/platformService'
import { StudioOnly, StatusChip, recipeFromBuiltIn } from './shared'

// The 8 built-in templates: open an edited version, or start one
function BuiltIns({ edits, onError }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState('')
  async function startEdit(t) {
    setBusy(t.id)
    try {
      const made = await createStudioTemplate({ builtIn: t.id, label: t.label, bestFor: t.bestFor, description: t.description, sampleSet: t.id, recipe: recipeFromBuiltIn(t.id), pictures: {} })
      navigate(`/studio/${made._id}`)
    } catch (err) {
      onError(errorMessage(err))
      setBusy('')
    }
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {TEMPLATE_LIST.map((t) => {
        const e = edits.find((x) => x.builtIn === t.id)
        return (
          <div key={t.id}>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <ThemePreview theme={e ? { template: t.id, recipe: e.recipe, sampleSet: e.sampleSet, pictures: e.pictures, samples: e.samples } : { template: t.id }} compact />
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-1">
              <span className="text-sm font-semibold text-slate-900">{t.label}</span>
              {e ? <StatusChip status={e.status} /> : <span className="text-[11px] text-slate-400">Original</span>}
            </div>
            {e ? (
              <Link to={`/studio/${e._id}`} className="mt-1 block text-sm font-medium text-emerald-700">Open edited version</Link>
            ) : (
              <button type="button" disabled={Boolean(busy)} onClick={() => startEdit(t)} className="mt-1 text-sm font-medium text-emerald-700 disabled:opacity-50">
                {busy === t.id ? 'Opening…' : 'Edit'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// All Template Studio templates, newest first
function List() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    listStudio().then(setData).catch((err) => setError(errorMessage(err, 'Could not load templates.')))
  }, [])

  if (!data) return error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : <p className="text-slate-500">Loading…</p>
  const mine = data.templates.filter((t) => !t.builtIn)
  return (
    <div className="space-y-10">
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section>
        <h2 className="font-poppins text-lg font-semibold text-slate-900">Built-in templates</h2>
        <p className="mb-4 text-sm text-slate-500">Edit their look and add real photos. Published edits replace the original everywhere; "Reset to original" brings it back.</p>
        <BuiltIns edits={data.templates.filter((t) => t.builtIn)} onError={setError} />
      </section>
      <section>
        <h2 className="mb-4 font-poppins text-lg font-semibold text-slate-900">New templates</h2>
        <NewOnes templates={mine} />
      </section>
    </div>
  )
}

function NewOnes({ templates }) {
  if (!templates.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-medium text-slate-800">No templates yet</p>
        <p className="mt-1 text-sm text-slate-500">Start from one of the 8 built-in templates and make it your own.</p>
      </div>
    )
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <Link key={t._id} to={`/studio/${t._id}`} className="group block">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm group-hover:shadow-md">
            <ThemePreview theme={{ template: t.key, recipe: t.recipe, sampleSet: t.sampleSet, pictures: t.pictures, samples: t.samples }} compact />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <h3 className="font-poppins font-semibold text-slate-900">{t.label}</h3>
            <span className="flex items-center gap-1">
              {t.visibility === 'private' && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">Private</span>}
              <StatusChip status={t.status} />
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t.bestFor || 'No description yet'} · {t.shops} shop{t.shops === 1 ? '' : 's'} using it{t.createdByName ? ` · by ${t.createdByName}` : ''}
          </p>
        </Link>
      ))}
    </div>
  )
}

function StudioList() {
  return (
    <StudioOnly>
      <section className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-poppins text-3xl font-bold text-slate-900">Template Studio</h1>
              <p className="mt-1 max-w-2xl text-slate-600">
                Make new templates without code by choosing colours, fonts and layout parts. The team sends them for
                review; the founder publishes them to the gallery.
              </p>
            </div>
            <Link to="/studio/new" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              <PlusIcon className="h-4 w-4" /> New template
            </Link>
          </div>
          <div className="mt-8"><List /></div>
        </div>
      </section>
    </StudioOnly>
  )
}

export default StudioList
