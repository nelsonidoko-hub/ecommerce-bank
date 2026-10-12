import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService'
import {
  FolderIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const emptyForm = { id: null, name: '', label: '', parent: '' }

function AdminCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setError('')
    try {
      const data = await getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  function startEdit(cat, parentName = '') {
    setForm({ id: cat._id, name: cat.name, label: cat.label, parent: parentName })
    setFormError('')
  }

  function startAddChild(parentName) {
    setForm({ id: null, name: '', label: '', parent: parentName })
    setFormError('')
  }

  function resetForm() {
    setForm(emptyForm)
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim() || !form.label.trim()) {
      setFormError('Name and label are required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        label: form.label.trim(),
        parent: form.parent || null,
      }

      if (form.id) {
        await updateCategory(form.id, payload, user.token)
      } else {
        await createCategory(payload, user.token)
      }

      resetForm()
      await loadCategories()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save category')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Delete "${cat.label}"? This cannot be undone.`)) return
    try {
      await deleteCategory(cat._id, user.token)
      await loadCategories()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete category')
    }
  }

  if (loading) return <p className="p-6">Loading categories...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">
            These show up in the storefront menu and the product form — no developer needed.
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category list */}
        <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">All Categories</h3>
          </div>

          {categories.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">
              No categories yet — add your first one on the right.
            </p>
          ) : (
            <div className="divide-y">
              {categories.map((cat) => (
                <div key={cat._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TagIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{cat.label}</span>
                      <span className="text-xs text-gray-400 font-mono">({cat.name})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startAddChild(cat.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                        title="Add subcategory"
                      >
                        <PlusCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {cat.children?.length > 0 && (
                    <div className="mt-3 ml-6 space-y-2 border-l-2 border-gray-100 pl-4">
                      {cat.children.map((child) => (
                        <div key={child._id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-700">{child.label}</span>
                            <span className="text-xs text-gray-400 font-mono">({child.name})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(child, cat.name)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(child)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add / edit form */}
        <div className="bg-white border rounded-xl p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {form.id ? 'Edit Category' : 'Add Category'}
            </h3>
            {(form.id || form.parent) && (
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-700"
                title="Cancel"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {form.parent && !form.id && (
            <p className="text-xs text-blue-600 bg-blue-50 rounded-md px-3 py-2 mb-3">
              Adding a subcategory under <strong>{form.parent}</strong>
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Display Name</label>
              <input
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Sunglasses"
                className="border rounded-md p-2 w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">
                URL Slug <span className="text-gray-400">(lowercase, use hyphens)</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. sunglasses"
                className="border rounded-md p-2 w-full text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Parent Category <span className="text-gray-400">(optional)</span>
              </label>
              <select
                value={form.parent}
                onChange={(e) => setForm((prev) => ({ ...prev, parent: e.target.value }))}
                className="border rounded-md p-2 w-full text-sm"
              >
                <option value="">None — top level</option>
                {categories
                  .filter((c) => c.name !== form.name)
                  .map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </div>

            {formError && <p className="text-xs text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mt-1"
            >
              {saving ? 'Saving...' : form.id ? 'Update Category' : 'Add Category'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminCategories