import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  uploadHeroMedia,
} from '../../services/heroService'
import {
  PhotoIcon,
  VideoCameraIcon,
  ArrowUpTrayIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

const emptyForm = {
  id: null,
  mediaType: 'image',
  mediaUrl: '',
  heading: '',
  text: '',
  buttonLabel: 'Shop Now',
  buttonLink: '/shop',
  active: true,
}

function MediaPreview({ type, url, className = '' }) {
  if (!url) return null
  if (type === 'video') {
    return (
      <video
        src={`${url}#t=0.1`}
        className={className}
        muted
        playsInline
        preload="metadata"
      />
    )
  }
  return <img src={url} alt="Preview" className={className} />
}

function AdminHero() {
  const { user } = useAuth()
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSlides()
  }, [])

  async function loadSlides() {
    setError('')
    try {
      const data = await getAllHeroSlides(user.token)
      setSlides(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not load hero slides')
      setSlides([])
    } finally {
      setLoading(false)
    }
  }

  function startEdit(slide) {
    setForm({
      id: slide._id,
      mediaType: slide.mediaType,
      mediaUrl: slide.mediaUrl,
      heading: slide.heading || '',
      text: slide.text || '',
      buttonLabel: slide.buttonLabel || '',
      buttonLink: slide.buttonLink || '',
      active: slide.active,
    })
    setFormError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm(emptyForm)
    setFormError('')
  }

  async function handleMediaUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setFormError('')
    try {
      const { url, mediaType } = await uploadHeroMedia(file, user.token)
      setForm((prev) => ({ ...prev, mediaUrl: url, mediaType }))
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          'Upload failed. If this is a video, you can paste a link to it below instead.'
      )
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!form.mediaUrl.trim()) {
      setFormError('Please upload an image or video, or paste a link to one.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        mediaType: form.mediaType,
        mediaUrl: form.mediaUrl.trim(),
        heading: form.heading,
        text: form.text,
        buttonLabel: form.buttonLabel,
        buttonLink: form.buttonLink,
        active: form.active,
      }

      if (form.id) {
        await updateHeroSlide(form.id, payload, user.token)
      } else {
        await createHeroSlide(payload, user.token)
      }

      resetForm()
      await loadSlides()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save slide')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(slide) {
    if (!confirm('Delete this slide? This cannot be undone.')) return
    try {
      await deleteHeroSlide(slide._id, user.token)
      if (form.id === slide._id) resetForm()
      await loadSlides()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete slide')
    }
  }

  async function toggleActive(slide) {
    try {
      await updateHeroSlide(slide._id, { active: !slide.active }, user.token)
      await loadSlides()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update slide')
    }
  }

  async function moveSlide(index, direction) {
    const target = index + direction
    if (target < 0 || target >= slides.length) return

    const reordered = [...slides]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]

    try {
      await Promise.all(
        reordered
          .map((s, i) => (s.order === i ? null : updateHeroSlide(s._id, { order: i }, user.token)))
          .filter(Boolean)
      )
      await loadSlides()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not reorder slides')
    }
  }

  if (loading) return <p className="p-6">Loading hero slides...</p>

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hero Banner</h2>
        <p className="text-sm text-gray-500 mt-1">
          The big banner at the top of your homepage. Each slide can be a photo or a video.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slide list */}
        <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <PhotoIcon className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Slides ({slides.length})</h3>
          </div>

          {slides.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">
              No slides yet. Until you add one, the homepage shows its default banner images.
            </p>
          ) : (
            <div className="divide-y">
              {slides.map((slide, index) => (
                <div
                  key={slide._id}
                  className={`p-4 flex gap-4 items-center ${slide.active ? '' : 'opacity-50'}`}
                >
                  <div className="relative w-28 h-20 sm:w-36 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
                    <MediaPreview
                      type={slide.mediaType}
                      url={slide.mediaUrl}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                      {slide.mediaType === 'video' ? (
                        <VideoCameraIcon className="h-3 w-3" />
                      ) : (
                        <PhotoIcon className="h-3 w-3" />
                      )}
                      {slide.mediaType}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {slide.heading || <span className="text-gray-400">No heading</span>}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{slide.text}</p>
                    {!slide.active && (
                      <p className="text-xs text-orange-600 mt-1">Hidden from the storefront</p>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => moveSlide(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveSlide(index, 1)}
                      disabled={index === slides.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(slide)}
                      className="p-1.5 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100"
                      title={slide.active ? 'Hide from storefront' : 'Show on storefront'}
                    >
                      {slide.active ? (
                        <EyeIcon className="h-4 w-4" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(slide)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide)}
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

        {/* Add / edit form */}
        <div className="bg-white border rounded-xl p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {form.id ? 'Edit Slide' : 'Add Slide'}
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
            {/* Media */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">
                Photo or Video <span className="text-red-500">*</span>
              </label>

              {form.mediaUrl ? (
                <div className="relative">
                  <MediaPreview
                    type={form.mediaType}
                    url={form.mediaUrl}
                    className="w-full h-36 object-cover rounded-lg border"
                  />
                  <label className="absolute bottom-2 right-2 bg-white border rounded-full p-1.5 shadow cursor-pointer hover:bg-gray-50">
                    <ArrowUpTrayIcon className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
                  <ArrowUpTrayIcon className="h-7 w-7 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Click to upload a photo or video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
              )}

              {uploading && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <ArrowUpTrayIcon className="h-3 w-3 animate-bounce" /> Uploading... videos can
                  take a minute
                </p>
              )}

              <input
                value={form.mediaUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                placeholder="...or paste a link to the photo or video"
                className="border rounded-md p-2 w-full text-xs mt-2"
              />

              <div className="flex gap-4 mt-2 text-xs text-gray-600">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="mediaType"
                    checked={form.mediaType === 'image'}
                    onChange={() => setForm((prev) => ({ ...prev, mediaType: 'image' }))}
                  />
                  Photo
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="mediaType"
                    checked={form.mediaType === 'video'}
                    onChange={() => setForm((prev) => ({ ...prev, mediaType: 'video' }))}
                  />
                  Video
                </label>
              </div>

              <p className="text-[11px] text-gray-400 mt-2 flex items-start gap-1">
                <InformationCircleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Photos up to 10 MB, videos up to 50 MB. Use MP4, and keep videos short (ideally under 15 MB) so the
                homepage loads fast. Videos play silently on a loop.
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Heading</label>
              <input
                value={form.heading}
                onChange={(e) => setForm((prev) => ({ ...prev, heading: e.target.value }))}
                placeholder="e.g. New Season, New Style"
                className="border rounded-md p-2 w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Subtext</label>
              <input
                value={form.text}
                onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="e.g. Shop the new collection"
                className="border rounded-md p-2 w-full text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Button text</label>
                <input
                  value={form.buttonLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, buttonLabel: e.target.value }))}
                  placeholder="Shop Now"
                  className="border rounded-md p-2 w-full text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Button link</label>
                <input
                  value={form.buttonLink}
                  onChange={(e) => setForm((prev) => ({ ...prev, buttonLink: e.target.value }))}
                  placeholder="/shop"
                  className="border rounded-md p-2 w-full text-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 -mt-2">
              Leave the button text empty to hide the button. Links like /category/shoes stay on
              your site; full web addresses open in a new tab.
            </p>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                className="h-4 w-4"
              />
              Show this slide on the storefront
            </label>

            {formError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : form.id ? 'Update Slide' : 'Add Slide'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminHero