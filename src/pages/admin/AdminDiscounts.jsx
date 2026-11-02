import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from '../../services/discountService'
import {
  TicketIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const emptyForm = {
  id: null,
  code: '',
  description: '',
  discountType: 'percent',
  value: '',
  minOrder: '',
  maxDiscount: '',
  usageLimit: '',
  oncePerCustomer: false,
  expiresAt: '',
  active: true,
}

const inputClass = 'border rounded-md p-2 w-full text-sm'

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function describeStatus(d) {
  if (!d.active) return { label: 'Paused', className: 'bg-gray-100 text-gray-600' }
  if (d.expiresAt && new Date(d.expiresAt) < new Date()) {
    return { label: 'Expired', className: 'bg-red-100 text-red-700' }
  }
  if (d.usageLimit > 0 && d.used >= d.usageLimit) {
    return { label: 'Used up', className: 'bg-orange-100 text-orange-700' }
  }
  return { label: 'Active', className: 'bg-green-100 text-green-700' }
}

function AdminDiscounts() {
  const { user } = useAuth()
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadDiscounts()
  }, [])

  async function loadDiscounts() {
    setError('')
    try {
      const data = await getDiscounts(user.token)
      setDiscounts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not load discount codes')
      setDiscounts([])
    } finally {
      setLoading(false)
    }
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function startEdit(d) {
    setForm({
      id: d._id,
      code: d.code,
      description: d.description || '',
      discountType: d.discountType,
      value: d.value,
      minOrder: d.minOrder || '',
      maxDiscount: d.maxDiscount || '',
      usageLimit: d.usageLimit || '',
      oncePerCustomer: d.oncePerCustomer,
      expiresAt: d.expiresAt ? d.expiresAt.slice(0, 10) : '',
      active: d.active,
    })
    setFormError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm(emptyForm)
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!form.code.trim()) {
      setFormError('Type the code customers will enter, e.g. WELCOME10')
      return
    }
    if (!(Number(form.value) > 0)) {
      setFormError('Enter how much the code takes off')
      return
    }

    setSaving(true)
    try {
      const payload = {
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxDiscount: form.discountType === 'percent' ? Number(form.maxDiscount) || 0 : 0,
        usageLimit: Number(form.usageLimit) || 0,
        oncePerCustomer: form.oncePerCustomer,
        expiresAt: form.expiresAt || null,
        active: form.active,
      }

      if (form.id) {
        await updateDiscount(form.id, payload, user.token)
      } else {
        await createDiscount(payload, user.token)
      }

      resetForm()
      await loadDiscounts()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save this code')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(d) {
    try {
      await updateDiscount(d._id, { active: !d.active }, user.token)
      await loadDiscounts()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update this code')
    }
  }

  async function handleDelete(d) {
    if (!confirm(`Delete the code ${d.code}? Past orders that used it are not affected.`)) return
    try {
      await deleteDiscount(d._id, user.token)
      if (form.id === d._id) resetForm()
      await loadDiscounts()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete this code')
    }
  }

  if (loading) return <p className="p-6">Loading discount codes...</p>

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Discount Codes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create codes customers can enter at checkout. The discount is checked and applied by
          the server, so it can't be faked.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code list */}
        <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <TicketIcon className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">All codes ({discounts.length})</h3>
          </div>

          {discounts.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">
              No codes yet. Create your first one on the right.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-gray-50 text-left text-xs text-gray-500">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Takes off</th>
                    <th className="p-3">Used</th>
                    <th className="p-3">Expires</th>
                    <th className="p-3">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((d) => {
                    const status = describeStatus(d)
                    return (
                      <tr key={d._id} className="border-t">
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-mono font-semibold text-gray-900">{d.code}</p>
                          {d.description && (
                            <p className="text-xs text-gray-500">{d.description}</p>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-medium">
                            {d.discountType === 'percent'
                              ? `${d.value}%`
                              : `₦${d.value.toLocaleString()}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {d.minOrder > 0 && `Min ₦${d.minOrder.toLocaleString()}`}
                            {d.minOrder > 0 && d.maxDiscount > 0 && ' · '}
                            {d.maxDiscount > 0 && `Max ₦${d.maxDiscount.toLocaleString()}`}
                          </p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {d.used}
                          {d.usageLimit > 0 ? ` / ${d.usageLimit}` : ''}
                          {d.oncePerCustomer && (
                            <p className="text-xs text-gray-500">Once each</p>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap text-gray-600">
                          {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`text-xs px-2 py-1 rounded-full ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => toggleActive(d)}
                              className="p-1.5 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100"
                              title={d.active ? 'Pause this code' : 'Turn this code back on'}
                            >
                              {d.active ? (
                                <EyeIcon className="h-4 w-4" />
                              ) : (
                                <EyeSlashIcon className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => startEdit(d)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(d)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / edit form */}
        <div className="bg-white border rounded-xl p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{form.id ? 'Edit code' : 'New code'}</h3>
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
            <Field label="Code" hint="What customers type. Letters and numbers, e.g. WELCOME10.">
              <input
                className={`${inputClass} font-mono uppercase`}
                value={form.code}
                onChange={(e) => setField('code', e.target.value.toUpperCase())}
                placeholder="WELCOME10"
              />
            </Field>

            <Field label="Note for yourself (optional)">
              <input
                className={inputClass}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="e.g. First-time customers"
              />
            </Field>

            <div>
              <label className="text-xs text-gray-500 block mb-2">Type of discount</label>
              <div className="flex gap-4 text-sm text-gray-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    checked={form.discountType === 'percent'}
                    onChange={() => setField('discountType', 'percent')}
                  />
                  Percentage (%)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    checked={form.discountType === 'fixed'}
                    onChange={() => setField('discountType', 'fixed')}
                  />
                  Fixed amount (₦)
                </label>
              </div>
            </div>

            <Field
              label={form.discountType === 'percent' ? 'Percentage off' : 'Naira off'}
              hint={form.discountType === 'percent' ? 'e.g. 10 for 10% off.' : 'e.g. 2000 for ₦2,000 off.'}
            >
              <input
                type="number"
                min="0"
                step="any"
                className={inputClass}
                value={form.value}
                onChange={(e) => setField('value', e.target.value)}
              />
            </Field>

            <Field label="Minimum order (₦)" hint="Leave empty for no minimum.">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.minOrder}
                onChange={(e) => setField('minOrder', e.target.value)}
              />
            </Field>

            {form.discountType === 'percent' && (
              <Field
                label="Most it can take off (₦)"
                hint="Optional cap, so a big order can't get a huge discount."
              >
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.maxDiscount}
                  onChange={(e) => setField('maxDiscount', e.target.value)}
                />
              </Field>
            )}

            <Field label="Total times it can be used" hint="Leave empty for unlimited.">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.usageLimit}
                onChange={(e) => setField('usageLimit', e.target.value)}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.oncePerCustomer}
                onChange={(e) => setField('oncePerCustomer', e.target.checked)}
              />
              Each customer can use it once
            </label>

            <Field label="Last day it works" hint="Leave empty if it never expires.">
              <input
                type="date"
                className={inputClass}
                value={form.expiresAt}
                onChange={(e) => setField('expiresAt', e.target.value)}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.active}
                onChange={(e) => setField('active', e.target.checked)}
              />
              Code is switched on
            </label>

            {formError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : form.id ? 'Update code' : 'Create code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminDiscounts