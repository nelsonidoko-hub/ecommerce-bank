import { useEffect, useState } from 'react'
import { listDesigns, saveDesign, applyDesign, deleteDesign } from '../../services/designService'
import { TEMPLATES } from '../../utils/themes'

const message = (err, fallback) => err?.response?.data?.message || fallback

// Save the design you're working on as your own template, and reuse it later
// here or when starting another shop (Pro).
function MyTemplates({ isPro, onApplied }) {
  const [designs, setDesigns] = useState(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState('')
  const [confirmDelete, setConfirmDelete] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const load = () => listDesigns().then(setDesigns).catch(() => setDesigns([]))
  useEffect(() => {
    load()
  }, [])

  async function save(e) {
    e.preventDefault()
    setBusy('save')
    setError('')
    try {
      await saveDesign(name)
      setName('')
      setNote('Saved to your templates.')
      await load()
    } catch (err) {
      setError(message(err, 'Could not save your template.'))
    } finally {
      setBusy('')
    }
  }

  async function apply(design) {
    setBusy(design._id)
    setError('')
    try {
      await applyDesign(design._id)
      setNote(`"${design.name}" loaded. Check the preview, then publish when ready.`)
      await onApplied()
    } catch (err) {
      setError(message(err, 'Could not use that template.'))
    } finally {
      setBusy('')
    }
  }

  async function remove(design) {
    setBusy(design._id)
    try {
      await deleteDesign(design._id)
      setConfirmDelete('')
      await load()
    } catch (err) {
      setError(message(err, 'Could not delete it.'))
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-500">
        Save this design (template, colours, fonts and homepage sections) to use again on this shop, or to start another shop with it.
      </p>

      {isPro ? (
        <form onSubmit={save} className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Name, e.g. Christmas look"
            maxLength={60}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" disabled={busy === 'save'} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy === 'save' ? 'Saving…' : 'Save'}
          </button>
        </form>
      ) : (
        <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
          Saving your own templates is part of the <b>Pro</b> plan.
        </p>
      )}

      {note && <p className="text-xs font-medium text-green-700">{note}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
        {designs === null && <li className="p-3 text-xs text-gray-400">Loading…</li>}
        {designs?.length === 0 && <li className="p-3 text-xs text-gray-400">No saved templates yet.</li>}
        {designs?.map((d) => (
          <li key={d._id} className="flex items-center gap-2 p-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">{d.name}</p>
              <p className="text-[11px] text-gray-500">
                {TEMPLATES[d.template]?.label || d.template} · {d.sections} sections{d.fromStoreName ? ` · from ${d.fromStoreName}` : ''}
              </p>
            </div>
            {confirmDelete === d._id ? (
              <>
                <button type="button" onClick={() => remove(d)} className="text-xs font-semibold text-red-600">Delete</button>
                <button type="button" onClick={() => setConfirmDelete('')} className="text-xs text-gray-500">Cancel</button>
              </>
            ) : (
              <>
                <button type="button" disabled={!isPro || Boolean(busy)} onClick={() => apply(d)} className="text-xs font-semibold text-blue-600 disabled:text-gray-300">
                  {busy === d._id ? 'Loading…' : 'Use'}
                </button>
                <button type="button" onClick={() => setConfirmDelete(d._id)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MyTemplates
