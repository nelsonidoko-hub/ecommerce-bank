import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import ThemePreview from '../../../components/ThemePreview'
import { listStudio } from '../../../services/studioService'
import { errorMessage } from '../../../services/platformService'
import { StudioOnly, StatusChip } from './shared'

// All Template Studio templates, newest first
function List() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    listStudio().then(setData).catch((err) => setError(errorMessage(err, 'Could not load templates.')))
  }, [])

  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
  if (!data) return <p className="text-slate-500">Loading…</p>
  if (!data.templates.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-medium text-slate-800">No templates yet</p>
        <p className="mt-1 text-sm text-slate-500">Start from one of the 8 built-in templates and make it your own.</p>
      </div>
    )
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.templates.map((t) => (
        <Link key={t._id} to={`/studio/${t._id}`} className="group block">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm group-hover:shadow-md">
            <ThemePreview theme={{ template: t.key, recipe: t.recipe, sampleSet: t.sampleSet }} compact />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <h3 className="font-poppins font-semibold text-slate-900">{t.label}</h3>
            <StatusChip status={t.status} />
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
