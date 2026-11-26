import { useState } from 'react'
import { ArrowUpIcon, ArrowDownIcon, EyeIcon, EyeSlashIcon, TrashIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline'
import { SECTION_TYPES, ADDABLE_TYPES, MAX_SECTIONS, newSection, sectionTitle } from '../../utils/sections'
import SectionEditor from './SectionEditor'

// A homepage as a list of sections: open one to edit it, move it up or down,
// hide it, delete it, or add a new one. The builder and the Template Studio
// both use it.
function SectionList({ sections, onChange, categories = [], intro = 'Your homepage, top to bottom. Click a section to edit it.' }) {
  const [open, setOpen] = useState('')
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState('')
  const setSections = onChange
  const move = (i, dir) => {
    const list = [...sections]
    const j = i + dir
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    setSections(list)
  }
  const add = (type) => {
    const s = newSection(type)
    setSections([...sections, s])
    setOpen(s.id)
    setAdding(false)
  }

  return (

          <div className="space-y-3">
            <p className="text-xs text-gray-500">{intro}</p>
            <ul className="space-y-2">
              {sections.map((s, i) => {
                const isOpen = open === s.id
                return (
                  <li key={s.id} className={`rounded-lg border bg-white ${s.enabled === false ? 'border-dashed border-gray-300 opacity-60' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-1 p-2">
                      <button type="button" onClick={() => setOpen(isOpen ? '' : s.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm">
                        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                        <span className="truncate font-medium text-gray-800">{sectionTitle(s)}</span>
                      </button>
                      <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Move down" disabled={i === sections.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={s.enabled === false ? 'Show section' : 'Hide section'}
                        onClick={() => setSections(sections.map((x) => (x.id === s.id ? { ...x, enabled: x.enabled === false } : x)))}
                        className="rounded p-1 text-gray-500 hover:bg-gray-100"
                      >
                        {s.enabled === false ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                      {confirmDelete === s.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSections(sections.filter((x) => x.id !== s.id))
                            setConfirmDelete('')
                          }}
                          className="rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white"
                        >
                          Delete
                        </button>
                      ) : (
                        <button type="button" aria-label="Delete section" onClick={() => setConfirmDelete(s.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {isOpen && (
                      <div className="border-t border-gray-100 p-3">
                        <SectionEditor section={s} categories={categories} onChange={(next) => setSections(sections.map((x) => (x.id === s.id ? next : x)))} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            {sections.length < MAX_SECTIONS &&
              (adding ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-2">
                  <p className="px-1 pb-2 text-xs font-semibold text-gray-700">Add a section</p>
                  <ul className="space-y-1">
                    {ADDABLE_TYPES.map((type) => {
                      const def = SECTION_TYPES[type]
                      const taken = def.single && sections.some((s) => s.type === type)
                      return (
                        <li key={type}>
                          <button type="button" disabled={taken} onClick={() => add(type)} className="w-full rounded-md p-2 text-left hover:bg-white disabled:opacity-40">
                            <span className="block text-sm font-medium text-gray-900">{def.label}</span>
                            <span className="block text-[11px] text-gray-500">{taken ? 'Already on the homepage' : def.description}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                  <button type="button" onClick={() => setAdding(false)} className="mt-1 px-2 text-xs text-gray-500">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:border-blue-600 hover:text-blue-700">
                  <PlusIcon className="h-4 w-4" /> Add section
                </button>
              ))}
          </div>
  )
}

export default SectionList
