import { Link } from 'react-router-dom'
import ThemePreview from '../../components/ThemePreview'

// One template in the gallery: a live mini-preview, who it suits, and the two
// actions: look at the full demo shop, or start a shop with it.
function TemplateCard({ template, demoUrl, startTo, selected = false, onSelect }) {
  const body = (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow group-hover:shadow-md">
        <ThemePreview theme={{ template: template.id }} compact />
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-poppins text-base font-semibold text-slate-900">{template.label}</h3>
          {selected && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Selected</span>}
        </div>
        <p className="text-xs font-medium text-emerald-700">{template.bestFor}</p>
        {!onSelect && <p className="mt-1 text-sm text-slate-600">{template.description}</p>}
      </div>
    </>
  )

  // Picker mode (inside sign-up): the whole card is a button
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(template.id)}
        aria-pressed={selected}
        className={`group rounded-2xl p-2 text-left transition-colors ${selected ? 'bg-emerald-50 ring-2 ring-emerald-600' : 'hover:bg-slate-50'}`}
      >
        {body}
      </button>
    )
  }

  return (
    <div className="group flex flex-col">
      {body}
      <div className="mt-4 flex gap-2">
        <Link
          to={startTo}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Start with this
        </Link>
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View demo
          </a>
        )}
      </div>
    </div>
  )
}

export default TemplateCard
