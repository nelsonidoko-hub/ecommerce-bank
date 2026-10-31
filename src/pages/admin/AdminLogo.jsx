
import { useEffect, useRef, useState } from 'react'
import { getLogo, saveLogo } from '../../services/logoService'
import { API_BASE } from '../../config'

const UPLOAD_URL = `${API_BASE}/api/upload`
const MAX_FILE_SIZE = 5 * 1024 * 1024

function AdminLogo() {
  const fileInputRef = useRef(null)

  const [imageUrl, setImageUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [altText, setAltText] = useState('Abuja Store Logo')

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Load the current store logo from the backend.
  useEffect(() => {
    let cancelled = false

    const loadLogo = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getLogo()

        if (cancelled) return

        const currentUrl = data.imageUrl || ''

        setImageUrl(currentUrl)
        setPreviewUrl(currentUrl)
        setAltText(data.altText || 'Abuja Store Logo')
      } catch (err) {
        if (cancelled) return

        // A missing logo is acceptable when setting it up for the first time.
        if (
          err.status === 404 ||
          err.message?.includes('404')
        ) {
          setImageUrl('')
          setPreviewUrl('')
          setAltText('Abuja Store Logo')
        } else {
          setError(
            err.message || 'Could not load the current logo.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadLogo()

    return () => {
      cancelled = true
    }
  }, [])

  // Upload the selected image to Cloudinary through your backend.
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')
    setMessage('')

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('The image must not exceed 5 MB.')
      event.target.value = ''
      return
    }

    const storedUser = localStorage.getItem('user')
    let user

    try {
      user = storedUser ? JSON.parse(storedUser) : null
    } catch {
      user = null
    }

    if (!user?.token) {
      setError('Please log in again with your administrator account.')
      event.target.value = ''
      return
    }

    const localPreview = URL.createObjectURL(file)

    setPreviewUrl(localPreview)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Image upload failed.')
      }

      // Your uploadController returns { url: result.secure_url }.
      const uploadedUrl = data.url

      if (
        typeof uploadedUrl !== 'string' ||
        !uploadedUrl.trim()
      ) {
        throw new Error('The server did not return an image URL.')
      }

      setImageUrl(uploadedUrl)
      setPreviewUrl(uploadedUrl)
      setMessage(
        'Image uploaded successfully. Click Save Changes to publish it.'
      )
    } catch (err) {
      setPreviewUrl(imageUrl)
      setError(err.message || 'Could not upload the image.')
    } finally {
      URL.revokeObjectURL(localPreview)
      setUploading(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Save the Cloudinary URL and alternative text to MongoDB.
  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!imageUrl.trim()) {
      setError('Please upload a logo or enter an image URL.')
      return
    }

    setSaving(true)

    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

        const savedLogo = await saveLogo(
        {
            imageUrl: imageUrl.trim(),
            altText: altText.trim() || 'Abuja Store Logo',
        },
        storedUser.token
        )

      const savedUrl = savedLogo.imageUrl || imageUrl.trim()

      setImageUrl(savedUrl)
      setPreviewUrl(savedUrl)
      setAltText(savedLogo.altText || altText.trim())
      setMessage('Store logo saved successfully!')
    } catch (err) {
      setError(err.message || 'Could not save the logo.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemovePreview = () => {
    setImageUrl('')
    setPreviewUrl('')
    setMessage('')
    setError('')
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-gray-500">Loading logo settings...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Logo Settings
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage the logo displayed across your Abuja Store website.
        </p>
      </div>

      {/* Main settings card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo preview */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Current Logo Preview
            </label>

            <div className="flex min-h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={altText || 'Abuja Store Logo'}
                  className="max-h-40 max-w-full object-contain"
                  onError={() => {
                    setError(
                      'The image preview could not be loaded. Check the image URL.'
                    )
                  }}
                />
              ) : (
                <div className="text-center">
                  <div className="mb-3 text-4xl text-gray-300">
                    🖼️
                  </div>

                  <p className="text-sm text-gray-500">
                    No logo selected yet
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Upload an image to preview your store logo.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload image */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Upload New Logo
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading || saving}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 text-sm text-gray-700 file:mr-4 file:cursor-pointer file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:font-medium hover:file:bg-gray-200 disabled:cursor-not-allowed"
            />

            <p className="mt-2 text-xs text-gray-500">
              Maximum file size: 5 MB. The image will be uploaded to Cloudinary.
            </p>

            {uploading && (
              <p className="mt-3 text-sm font-medium text-gray-600">
                Uploading image... Please wait.
              </p>
            )}
          </div>

          {/* Optional image URL */}
          <div>
            <label
              htmlFor="imageUrl"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Logo Image URL
            </label>

            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(event) => {
                const value = event.target.value
                setImageUrl(value)
                setPreviewUrl(value)
                setMessage('')
              }}
              placeholder="https://example.com/logo.png"
              disabled={uploading || saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-800 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
            />

            <p className="mt-2 text-xs text-gray-500">
              You can upload a file above or paste an image URL here.
            </p>
          </div>

          {/* Alternative text */}
          <div>
            <label
              htmlFor="altText"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Alternative Text
            </label>

            <input
              id="altText"
              type="text"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Abuja Store Logo"
              maxLength={150}
              disabled={uploading || saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-800 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
            />

            <p className="mt-2 text-xs text-gray-500">
              Describes the logo for accessibility tools.
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleRemovePreview}
              disabled={uploading || saving || !previewUrl}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Selection
            </button>

            <button
              type="submit"
              disabled={uploading || saving || !imageUrl.trim()}
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Helpful note */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-800">
          Important
        </p>

        <p className="mt-1 text-sm leading-6 text-gray-600">
          Uploading an image does not publish it immediately. After the upload
          succeeds, click Save Changes to store the logo in the database.
        </p>
      </div>
    </div>
  )
}

export default AdminLogo
