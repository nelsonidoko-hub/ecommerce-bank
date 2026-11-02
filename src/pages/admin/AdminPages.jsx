import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAllPages, createPage, updatePage, deletePage } from '../../services/pageService'
import {
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'

const emptyForm = {
  id: null,
  title: '',
  slug: '',
  content: '',
  footerColumn: 'none',
  published: true,
  order: 0,
}

const FOOTER_LABELS = {
  resources: 'Footer: Resources',
  support: 'Footer: Support',
  none: 'Not in footer',
}

const inputClass = 'border rounded-md p-2 w-full text-sm'

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Starter text uses [square brackets] for details the owner must fill in
const needsDetails = (page) => /\[[^\]]+\]/.test(page.content || '')

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function AdminPages() {
  const { user } = useAuth()
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPages()
  }, [])

  async function loadPages() {
    setError('')
    try {
      const data = await getAllPages(user.token)
      setPages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not load pages')
      setPages([])
    } finally {
      setLoading(false)
    }
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleTitleChange(value) {
    setForm((prev) => ({
      ...prev,
      title: value,
      // Fill in the web address from the title until the owner edits it themselves
      slug: !prev.id && !slugTouched ? slugify(value) : prev.slug,
    }))
  }

  function startEdit(page) {
    setForm({
      id: page._id,
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      footerColumn: page.footerColumn,
      published: page.published,
      order: page.order,
    })
    setSlugTouched(true)
    setFormError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm(emptyForm)
    setSlugTouched(false)
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!form.title.trim()) {
      setFormError('Give the page a title')
      return
    }
    if (!form.slug.trim()) {
      setFormError('The page needs a web address')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        footerColumn: form.footerColumn,
        published: form.published,
        order: Number(form.order) || 0,
      }

      if (form.id) {
        await updatePage(form.id, payload, user.token)
      } else {
        await createPage(payload, user.token)
      }

      resetForm()
      await loadPages()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save this page')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(page) {
    if (!confirm(`Delete "${page.title}"? Its footer link will disappear too.`)) return
    try {
      await deletePage(page._id, user.token)
      if (form.id === page._id) resetForm()
      await loadPages()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete this page')
    }
  }

  if (loading) return <p className="p-6">Loading pages...</p>

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Pages</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your FAQ, policies and About page. Choose a footer column and the link appears on your
          store automatically.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Page list */}
        <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">All pages ({pages.length})</h3>
          </div>

          {pages.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">
              No pages yet. Add one with the form.
            </p>
          ) : (
            <div className="divide-y">
              {pages.map((page) => (
                <div key={page._id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{page.title}</p>
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                    >
                      /{page.slug}
                      <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                    </a>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {FOOTER_LABELS[page.footerColumn]}
                      </span>
                      {!page.published && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          Hidden
                        </span>
                      )}
                      {needsDetails(page) && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                          Needs your details
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => startEdit(page)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(page)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 bg-white border rounded-xl p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {form.id ? 'Edit page' : 'Add a page'}
            </h3>
            {form.id && (
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-700"
                title="Cancel editing"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Page title">
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Size Guide"
                />
              </Field>
              <Field label="Web address" hint={`Your page will live at /${form.slug || '...'}`}>
                <input
                  className={`${inputClass} font-mono`}
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setField('slug', slugify(e.target.value))
                  }}
                  placeholder="size-guide"
                />
              </Field>
            </div>

            <Field label="Page text">
              <textarea
                className={`${inputClass} leading-relaxed`}
                rows={16}
                value={form.content}
                onChange={(e) => setField('content', e.target.value)}
              />
            </Field>

            <div className="flex items-start gap-2 text-[11px] text-gray-500 bg-gray-50 border rounded-md p-3">
              <InformationCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Leave a blank line between paragraphs. Start a line with <b>##</b> to make a
                heading, or with <b>-</b> to make a bullet point. Anything in [square brackets] is
                a detail you should replace with your own.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Show a link in the footer?">
                <select
                  className={inputClass}
                  value={form.footerColumn}
                  onChange={(e) => setField('footerColumn', e.target.value)}
                >
                  <option value="resources">Yes, under Resources</option>
                  <option value="support">Yes, under Support</option>
                  <option value="none">No</option>
                </select>
              </Field>
              <Field label="Position in the footer" hint="Lowest number shows first.">
                <input
                  type="number"
                  className={inputClass}
                  value={form.order}
                  onChange={(e) => setField('order', e.target.value)}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.published}
                onChange={(e) => setField('published', e.target.checked)}
              />
              Visible to customers
            </label>

            {formError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : form.id ? 'Update page' : 'Add page'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminPages