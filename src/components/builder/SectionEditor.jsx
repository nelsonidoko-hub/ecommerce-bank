import { useState, useContext, createContext } from 'react'
import { PlusIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { SECTION_TYPES } from '../../utils/sections'
import { uploadImage } from '../../services/uploadService'
import { storedUser } from '../../utils/storeContext'

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600'

// The Template Studio uploads to the platform's template photos instead of a
// shop's own pictures; it wraps the editor in this with its own upload.
export const SectionUploadContext = createContext(null)

function ImageField({ value, onChange }) {
  const custom = useContext(SectionUploadContext)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function upload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setError('Pictures must be under 5 MB')
    setBusy(true)
    setError('')
    try {
      onChange(custom ? await custom.upload(file) : await uploadImage(file, storedUser()?.token))
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="h-14 w-20 rounded-md border object-cover" />
        ) : (
          <div className="flex h-14 w-20 items-center justify-center rounded-md border border-dashed px-1 text-center text-[10px] text-gray-400">{custom?.emptyText || 'No picture'}</div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
          <ArrowUpTrayIcon className="h-4 w-4" />
          {busy ? 'Uploading…' : value ? 'Change' : 'Upload'}
          <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={busy} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-xs text-gray-500 hover:text-red-600">
            Remove
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Field({ field, value, onChange, categories }) {
  switch (field.kind) {
    case 'textarea':
      return <textarea className={inputClass} rows={4} maxLength={field.max} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'select':
      return (
        <select className={inputClass} value={value ?? field.options[0][0]} onChange={(e) => onChange(e.target.value)}>
          {field.options.map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      )
    case 'number':
      return (
        <input type="number" className={inputClass} min={field.min} max={field.max} value={value ?? ''} onChange={(e) => onChange(Math.min(field.max, Math.max(field.min, Number(e.target.value) || field.min)))} />
      )
    case 'category':
      return (
        <select className={inputClass} value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">{field.label.includes('empty') ? 'Newest products' : 'Choose a category'}</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>{c.parent ? `– ${c.label}` : c.label}</option>
          ))}
        </select>
      )
    case 'image':
      return <ImageField value={value} onChange={onChange} />
    case 'link':
      return (
        <>
          <input className={inputClass} value={value ?? ''} placeholder="/shop or https://…" maxLength={300} onChange={(e) => onChange(e.target.value.trim())} />
          <p className="mt-1 text-[11px] text-gray-400">A page of your shop like /shop or /category/shoes, or a full https:// link.</p>
        </>
      )
    default:
      return <input className={inputClass} maxLength={field.max} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  }
}

function ListField({ field, value = [], onChange }) {
  const set = (i, key, v) => onChange(value.map((item, j) => (j === i ? { ...item, [key]: v } : item)))
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
          {field.of.map((sub) => (
            <div key={sub.name}>
              <label className="mb-1 block text-[11px] font-medium text-gray-500">{sub.label}</label>
              <Field field={sub} value={item[sub.name]} onChange={(v) => set(i, sub.name, v)} categories={[]} />
            </div>
          ))}
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600">
            <TrashIcon className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      ))}
      {value.length < field.max && (
        <button
          type="button"
          onClick={() => onChange([...value, Object.fromEntries(field.of.map((s) => [s.name, '']))])}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
        >
          <PlusIcon className="h-4 w-4" /> Add
        </button>
      )}
    </div>
  )
}

// The form for one section, built from its type's field list
function SectionEditor({ section, onChange, categories }) {
  const def = SECTION_TYPES[section.type]
  const data = section.data || {}
  const set = (name, value) => onChange({ ...section, data: { ...data, [name]: value } })

  if (!def) return <p className="text-xs text-gray-500">This section type can't be edited here.</p>
  if (def.fields.length === 0) return <p className="text-xs text-gray-500">{def.description}</p>

  return (
    <div className="space-y-4">
      {def.fields
        .filter((f) => !f.showIf || f.showIf(data))
        .map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-xs font-medium text-gray-600">{field.label}</label>
            {field.kind === 'list' ? (
              <ListField field={field} value={data[field.name]} onChange={(v) => set(field.name, v)} />
            ) : (
              <Field field={field} value={data[field.name]} onChange={(v) => set(field.name, v)} categories={categories} />
            )}
          </div>
        ))}
    </div>
  )
}

export default SectionEditor
