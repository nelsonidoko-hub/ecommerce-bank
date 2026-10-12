import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProductById, createProduct, updateProduct } from '../../services/productService'
import { uploadImage } from '../../services/uploadService'
import { getCategories } from '../../services/categoryService'
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  XCircleIcon,
  TagIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  SparklesIcon,
  FireIcon,
  PlusCircleIcon,
  TrashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

function ProductForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sizeStock, setSizeStock] = useState([{ size: '', stock: '' }])
  const [form, setForm] = useState({
    name: '',
    price: '',
    oldPrice: '',
    onSale: false,
    bestSeller: false,
    category: '',
    image: '',
    hoverImage: '',
    images: [],
    sizes: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [hoverUploading, setHoverUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setCategoriesLoading(false))
  }, [])

  useEffect(() => {
    if (isEditMode) {
      getProductById(id).then((data) => {
        setForm({
          ...data,
          oldPrice: data.oldPrice ?? '',
          onSale: Boolean(data.onSale),
          bestSeller: Boolean(data.bestSeller),
          images: data.images || [],
        })
        setSizeStock(data.sizes || [{ size: '', stock: '' }])
      })
    }
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSizeChange(index, field, value) {
    const updated = [...sizeStock]
    updated[index][field] = value
    setSizeStock(updated)
  }

  function addSizeRow() {
    setSizeStock([...sizeStock, { size: '', stock: '' }])
  }

  function removeSizeRow(index) {
    setSizeStock(sizeStock.filter((_, i) => i !== index))
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadImage(file, user.token)
      setForm((prev) => ({ ...prev, image: url }))
    } catch (err) {
      setError('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleHoverImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setHoverUploading(true)
    try {
      const url = await uploadImage(file, user.token)
      setForm((prev) => ({ ...prev, hoverImage: url }))
    } catch (err) {
      setError('Image upload failed')
    } finally {
      setHoverUploading(false)
    }
  }

  // Gallery supports multiple files at once (back view, another color, etc.)
  async function handleGalleryUpload(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setGalleryUploading(true)
    try {
      const urls = await Promise.all(files.map((file) => uploadImage(file, user.token)))
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
    } catch (err) {
      setError('Gallery image upload failed')
    } finally {
      setGalleryUploading(false)
      e.target.value = '' // allow re-selecting the same file(s) later
    }
  }

  function removeGalleryImage(index) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: form.onSale && form.oldPrice ? Number(form.oldPrice) : null,
      onSale: Boolean(form.onSale),
      bestSeller: Boolean(form.bestSeller),
      sizes: sizeStock
        .filter((s) => s.size.trim())
        .map((s) => ({ size: s.size.trim(), stock: Number(s.stock) || 0 })),
    }

    try {
      if (isEditMode) {
        await updateProduct(id, payload, user.token)
      } else {
        await createProduct(payload, user.token)
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-xl pt-30 pb-16">
      <h2 className="text-2xl font-bold mb-1">{isEditMode ? 'Edit' : 'Add'} Product</h2>
      <p className="text-sm text-gray-500 mb-6">
        Fill in the details below. Fields marked with an icon show what kind of info goes there.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic info */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3 text-gray-700">
            <TagIcon className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Product Info</h3>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Product Name</label>
              <input
                name="name"
                placeholder="e.g. Ankara Print Tote Bag"
                value={form.name}
                onChange={handleChange}
                required
                className="border rounded-md p-2 w-full"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <CurrencyDollarIcon className="h-4 w-4" /> Price (₦)
              </label>
              <input
                name="price"
                type="number"
                placeholder="e.g. 15000"
                value={form.price}
                onChange={handleChange}
                required
                className="border rounded-md p-2 w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">Category</label>
                <Link
                  to="/admin/categories"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Manage categories
                </Link>
              </div>

              {categoriesLoading ? (
                <p className="text-xs text-gray-400">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-xs text-gray-500 bg-gray-50 border rounded-md p-2">
                  No categories yet.{' '}
                  <Link to="/admin/categories" className="text-blue-600 hover:underline">
                    Add one first
                  </Link>
                  .
                </p>
              ) : (
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="border rounded-md p-2 w-full"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) =>
                    cat.children && cat.children.length > 0 ? (
                      <optgroup key={cat._id} label={cat.label}>
                        <option value={cat.name}>{cat.label} (general)</option>
                        {cat.children.map((child) => (
                          <option key={child._id} value={child.name}>
                            {child.label}
                          </option>
                        ))}
                      </optgroup>
                    ) : (
                      <option key={cat._id} value={cat.name}>
                        {cat.label}
                      </option>
                    )
                  )}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1 text-gray-700">
            <PhotoIcon className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Product Photos</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4 flex items-start gap-1">
            <InformationCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
            Click any box below to choose a photo from your device.
          </p>

          {/* Main image */}
          <div className="mb-5">
            <label className="text-xs font-medium text-gray-600 block mb-2">
              Main Photo <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal"> — shown first in the shop</span>
            </label>

            {form.image ? (
              <div className="relative w-28 h-28">
                <img
                  src={form.image}
                  alt="Main preview"
                  className="w-28 h-28 object-cover rounded-lg border"
                />
                <label className="absolute -bottom-2 -right-2 bg-white border rounded-full p-1.5 shadow cursor-pointer hover:bg-gray-50">
                  <ArrowUpTrayIcon className="h-4 w-4 text-gray-600" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
                <PhotoIcon className="h-7 w-7 text-gray-400 mb-1" />
                <span className="text-[11px] text-gray-500 text-center px-1">Click to upload</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
            {uploading && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <ArrowUpTrayIcon className="h-3 w-3 animate-bounce" /> Uploading...
              </p>
            )}
          </div>

          {/* Hover image */}
          <div className="mb-5">
            <label className="text-xs font-medium text-gray-600 block mb-2">
              Back / Hover Photo
              <span className="text-gray-400 font-normal"> — optional, shows when a shopper hovers</span>
            </label>

            {form.hoverImage ? (
              <div className="relative w-28 h-28">
                <img
                  src={form.hoverImage}
                  alt="Hover preview"
                  className="w-28 h-28 object-cover rounded-lg border"
                />
                <label className="absolute -bottom-2 -right-2 bg-white border rounded-full p-1.5 shadow cursor-pointer hover:bg-gray-50">
                  <ArrowUpTrayIcon className="h-4 w-4 text-gray-600" />
                  <input type="file" accept="image/*" onChange={handleHoverImageUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
                <PhotoIcon className="h-7 w-7 text-gray-400 mb-1" />
                <span className="text-[11px] text-gray-500 text-center px-1">Click to upload</span>
                <input type="file" accept="image/*" onChange={handleHoverImageUpload} className="hidden" />
              </label>
            )}
            {hoverUploading && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <ArrowUpTrayIcon className="h-3 w-3 animate-bounce" /> Uploading...
              </p>
            )}
          </div>

          {/* Gallery */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">
              Gallery Photos
              <span className="text-gray-400 font-normal"> — optional, other angles or colors, pick many at once</span>
            </label>

            <div className="flex flex-wrap gap-3">
              {form.images.map((url, index) => (
                <div key={url} className="relative w-20 h-20">
                  <img src={url} alt={`Gallery ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full shadow"
                    aria-label="Remove image"
                  >
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
                <PlusCircleIcon className="h-6 w-6 text-gray-400" />
                <span className="text-[10px] text-gray-500 mt-0.5">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>
            {galleryUploading && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <ArrowUpTrayIcon className="h-3 w-3 animate-bounce" /> Uploading...
              </p>
            )}
          </div>
        </div>

        {/* Sizes & stock */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3 text-gray-700">
            <Squares2X2Icon className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Sizes & Stock</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Add each size you sell and how many are in stock.
          </p>

          {sizeStock.map((row, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                placeholder="Size (e.g. M)"
                value={row.size}
                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                className="border rounded-md p-2 flex-1"
              />
              <input
                type="number"
                placeholder="Stock"
                value={row.stock}
                onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                className="border rounded-md p-2 w-24"
              />
              <button
                type="button"
                onClick={() => removeSizeRow(index)}
                className="text-red-500 p-1.5 hover:bg-red-50 rounded"
                aria-label="Remove size"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSizeRow}
            className="flex items-center gap-1 text-blue-600 text-sm hover:underline mt-1"
          >
            <PlusCircleIcon className="h-4 w-4" /> Add another size
          </button>
        </div>

        {/* Description */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3 text-gray-700">
            <DocumentTextIcon className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Description</h3>
          </div>
          <textarea
            name="description"
            placeholder="Tell shoppers about the material, fit, and details..."
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="border rounded-md p-2 w-full"
          />
        </div>

        {/* Sale & Best seller toggles */}
        <div className="border rounded-lg p-4 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.onSale}
              onChange={(e) => setForm((prev) => ({ ...prev, onSale: e.target.checked }))}
              className="h-4 w-4"
            />
            <FireIcon className="h-4 w-4 text-orange-500" />
            On Sale
          </label>

          {form.onSale && (
            <div className="pl-6">
              <label className="text-xs text-gray-500 block mb-1">Original price (before discount)</label>
              <input
                name="oldPrice"
                type="number"
                placeholder="e.g. 20000"
                value={form.oldPrice}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.bestSeller}
              onChange={(e) => setForm((prev) => ({ ...prev, bestSeller: e.target.checked }))}
              className="h-4 w-4"
            />
            <SparklesIcon className="h-4 w-4 text-yellow-500" />
            Best Seller
          </label>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
        >
          {isEditMode ? 'Update' : 'Create'} Product
        </button>
      </form>
    </div>
  )
}

export default ProductForm