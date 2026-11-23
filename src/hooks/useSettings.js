import { useState, useEffect } from 'react'
import { getSettings } from '../services/settingsService'
import { readStoredTheme, storeTheme } from '../utils/themes'

// Used until the real settings arrive, or if the request fails,
// so the footer and checkout never break. Mirrors the backend defaults.
export const defaultSettings = {
  storeName: '',
  contactEmail: '',
  contactPhone: '',
  whatsappNumber: '',
  address: { line1: '', city: '', state: '', country: 'Nigeria' },
  social: { instagram: '', x: '', tiktok: '' },
  shipping: { flatRate: 3500, freeShippingThreshold: 0 },
  tax: { rate: 7.5, label: 'VAT' },
  pickup: {
    enabled: true,
    name: 'Main Retail Store',
    address: '',
    readyTime: 'Usually ready in 2 to 4 hours',
  },
  announcement: { enabled: false, text: '', link: '' },
  theme: { template: 'classic', brandColor: '', headingFont: '', bodyFont: '', radius: '' },
  hours: {
    enabled: false,
    timezone: 'Africa/Lagos',
    whenClosed: 'block',
    monOpen: '09:00', monClose: '21:00', monClosed: false,
    tueOpen: '09:00', tueClose: '21:00', tueClosed: false,
    wedOpen: '09:00', wedClose: '21:00', wedClosed: false,
    thuOpen: '09:00', thuClose: '21:00', thuClosed: false,
    friOpen: '09:00', friClose: '21:00', friClosed: false,
    satOpen: '09:00', satClose: '21:00', satClosed: false,
    sunOpen: '09:00', sunClose: '21:00', sunClosed: false,
  },
  homeArrivals: {
    enabled: true,
    title: 'New Arrivals',
    subtitle: 'Explore the newest drops',
    count: 8,
  },
  homeBestSellers: { enabled: true, label: 'Trending', title: 'Best Seller' },
  homeBanner: {
    enabled: true,
    image: '',
    heading: 'New Season, New Style',
    text: 'Check out our latest collection before it sells out',
    buttonLabel: 'Shop Now',
    buttonLink: '/shop',
  },
  homeCategoryRow: { enabled: true, title: 'Popular picks', category: '' },
  homeFeatured: {
    enabled: true,
    title: 'Featured collection',
    image: '',
    buttonLabel: 'VIEW',
    buttonLink: '/shop',
    category: '',
  },
  // The homepage sections (the server always sends these)
  homeSections: [],
}

// One shared copy, so the navbar, footer and checkout make a single request
let cached = null
let pending = null
const listeners = new Set()

// The builder shows the shop in a frame with ?preview=1: it loads the owner's
// unpublished draft, and the builder pushes every change straight in.
export const isPreview =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1'

// Call after saving in the admin so this tab shows the new values immediately
export function setCachedSettings(next) {
  cached = next
  if (!isPreview) storeTheme(next.theme)
  listeners.forEach((fn) => fn(next))
}

if (isPreview && typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    // Only from the builder in this same shop
    if (event.origin !== window.location.origin) return
    const msg = event.data
    if (msg?.type !== 'builder:design') return
    const base = cached || defaultSettings
    setCachedSettings({
      ...base,
      theme: { ...base.theme, ...(msg.theme || {}) },
      homeSections: Array.isArray(msg.homeSections) ? msg.homeSections : base.homeSections,
      isPreview: true,
    })
  })
  // Tell the builder we're ready for its latest changes
  if (window.parent !== window) window.parent.postMessage({ type: 'builder:ready' }, window.location.origin)
}

export function useSettings() {
  // Until the real settings arrive, use the theme remembered from the last visit,
  // so the storefront doesn't flash the wrong look while it loads.
  const [settings, setSettings] = useState(
    () => cached || { ...defaultSettings, theme: readStoredTheme() || defaultSettings.theme }
  )
  const [loaded, setLoaded] = useState(Boolean(cached))

  // Follow later changes (admin saves, the builder's live preview)
  useEffect(() => {
    const update = (next) => {
      setSettings(next)
      setLoaded(true)
    }
    listeners.add(update)
    return () => listeners.delete(update)
  }, [])

  useEffect(() => {
    if (cached) return

    if (!pending) {
      pending = getSettings({ preview: isPreview })
        .then((data) => {
          // A design pushed by the builder before this arrived keeps its
          // theme and sections; everything else (name, contact...) is real
          if (cached?.isPreview) {
            cached = { ...data, theme: cached.theme, homeSections: cached.homeSections, isPreview: true }
            return cached
          }
          cached = data
          if (!isPreview) storeTheme(data.theme)
          return data
        })
        .catch((err) => {
          console.error('Could not load store settings', err)
          return null
        })
        .finally(() => {
          pending = null
        })
    }

    pending.then((data) => {
      if (data) setSettings(data)
      setLoaded(true)
    })
  }, [])

  return { settings, loaded }
}